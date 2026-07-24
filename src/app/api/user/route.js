import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// Metoda pro NAČTENÍ dat (Když se stránka poprvé načte)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) return NextResponse.json({ message: "Uživatel nenalezen" }, { status: 404 });

    // Připravíme si data k odeslání do aplikace
    let responseSettings = { ...user.settings.toObject() };
    let responseJournal = [...user.journal];

    // === CHYTRÉ ZRCADLENÍ DAT (SDÍLENÍ) ===
    if (user.settings.pairedWith) {
      const partner = await User.findOne({ email: user.settings.pairedWith });
      
      if (partner) {
        // Pokud jsem Muž ('partner') a má propojenou Ženu ('female'),
        // vezmu si její cyklus a její deník a přepíšu jimi svůj prázdný výpis.
        if (user.settings.role === 'partner' && partner.settings.role === 'female') {
          responseSettings.periods = partner.settings.periods;
          responseSettings.cycleLength = partner.settings.cycleLength;
          responseSettings.periodLength = partner.settings.periodLength;
          responseJournal = partner.journal;
        }
        // (Pokud jsem Žena, nic nedělám, do aplikace se pošlou moje vlastní data).
      }
    }

    return NextResponse.json({ settings: responseSettings, journal: responseJournal }, { status: 200 });
  } catch (error) {
    console.error("Chyba při GET /api/user:", error);
    return NextResponse.json({ message: "Interní chyba serveru" }, { status: 500 });
  }
}


// Metoda pro ULOŽENÍ dat (Tlačítka, deník, propojení)
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });

    const data = await req.json();
    await connectToDatabase();

    // 1. SCÉNÁŘ: Vygenerování kódu kýmkoliv
    if (data.action === 'generate_code') {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { "settings.syncCode": newCode } },
        { new: true }
      );
      return NextResponse.json({ settings: updatedUser.settings, journal: updatedUser.journal }, { status: 200 });
    }

    // 2. SCÉNÁŘ: Uživatel zadal kód pro OBOUSMĚRNÉ PROPOJENÍ
    if (data.action === 'pair') {
      const targetUser = await User.findOne({ "settings.syncCode": data.code });
      if (!targetUser) {
        return NextResponse.json({ message: "Tento kód neexistuje nebo vypršel." }, { status: 400 });
      }

      // Propojíme oba účty navzájem
      await User.findOneAndUpdate(
        { email: session.user.email }, 
        { $set: { "settings.pairedWith": targetUser.email } }
      );
      await User.findOneAndUpdate(
        { email: targetUser.email }, 
        { $set: { "settings.pairedWith": session.user.email } }
      );

      // Použijeme rovnou naši chytrou GET metodu, aby se načetla zrcadlená data!
      return await GET(req);
    }

    // 3. SCÉNÁŘ: Zrušení propojení (Odpojí V OBA SMĚRECH)
    if (data.action === 'unpair') {
      const currentUser = await User.findOne({ email: session.user.email });
      const partnerEmail = currentUser?.settings?.pairedWith;

      await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { "settings.pairedWith": null, "settings.syncCode": null } }
      );

      if (partnerEmail) {
        await User.findOneAndUpdate(
          { email: partnerEmail },
          { $set: { "settings.pairedWith": null, "settings.syncCode": null } }
        );
      }

      return await GET(req);
    }

    // 4. SCÉNÁŘ: Běžné uložení (Přidání do deníku nebo úprava cyklu)
    const currentUser = await User.findOne({ email: session.user.email });
    let targetEmailForBioData = session.user.email; // Výchozí stav: ukládám sám sobě

    // Zjistíme, jestli nejsme Muž, který má zapsat data do účtu své Ženy
    if (currentUser.settings.pairedWith && currentUser.settings.role === 'partner') {
      const partner = await User.findOne({ email: currentUser.settings.pairedWith });
      if (partner && partner.settings.role === 'female') {
        targetEmailForBioData = partner.email; // Měníme cíl! Pošleme data na její účet.
      }
    }

    if (targetEmailForBioData !== session.user.email) {
      // JSME MUŽ: Ukládáme deník DO ÚČTU ŽENY
      const updatePartnerDoc = {};
      if (data.settings) {
        if (data.settings.periods) updatePartnerDoc["settings.periods"] = data.settings.periods;
        if (data.settings.cycleLength) updatePartnerDoc["settings.cycleLength"] = data.settings.cycleLength;
        if (data.settings.periodLength) updatePartnerDoc["settings.periodLength"] = data.settings.periodLength;
      }
      if (data.journal) updatePartnerDoc.journal = data.journal; // Přepíšeme její deník o náš nový zápis

      if (Object.keys(updatePartnerDoc).length > 0) {
        await User.findOneAndUpdate({ email: targetEmailForBioData }, { $set: updatePartnerDoc });
      }
    } else {
      // JSME ŽENA (nebo nepropojený muž): Ukládáme normálně sobě
      const updateDoc = {};
      if (data.settings) updateDoc.settings = data.settings;
      if (data.journal) updateDoc.journal = data.journal;
      await User.findOneAndUpdate({ email: session.user.email }, { $set: updateDoc });
    }

    // Znovu vrátíme přes naši chytrou GET metodu
    return await GET(req);

  } catch (error) {
    console.error("Chyba při PUT /api/user:", error);
    return NextResponse.json({ message: "Interní chyba serveru" }, { status: 500 });
  }
}
