import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import webpush from "web-push";

// Nastavení web-push s VAPID klíči z prostředí Vercelu
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@vnitrnipocasi.cz',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// POST metoda pro uložení push odběru z telefonu
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });
    }

    const subscription = await req.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: "Neplatná data odběru" }, { status: 400 });
    }

    await connectToDatabase();

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { "settings.pushSubscription": subscription } }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Chyba při ukládání push subscription:", error);
    return NextResponse.json({ message: "Chyba serveru: " + error.message }, { status: 500 });
  }
}

// Metoda pro NAČTENÍ dat
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) return NextResponse.json({ message: "Uživatel nenalezen" }, { status: 404 });

    let responseSettings = { ...user.settings.toObject() };
    let responseJournal = [...user.journal];

    if (user.settings.pairedWith) {
      const partner = await User.findOne({ email: user.settings.pairedWith });
      if (partner) {
        if (user.settings.role === 'partner' && partner.settings.role === 'female') {
          responseSettings.periods = partner.settings.periods;
          responseSettings.cycleLength = partner.settings.cycleLength;
          responseSettings.periodLength = partner.settings.periodLength;
          responseJournal = partner.journal;
        }
      }
    }

    return NextResponse.json({ settings: responseSettings, journal: responseJournal }, { status: 200 });
  } catch (error) {
    console.error("Chyba při GET /api/user:", error);
    return NextResponse.json({ message: "Interní chyba serveru" }, { status: 500 });
  }
}

// Metoda pro ULOŽENÍ dat a ODESLÁNÍ NOTIFIKACE
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });

    const data = await req.json();
    await connectToDatabase();

    if (data.action === 'generate_code') {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { "settings.syncCode": newCode } },
        { new: true }
      );
      return NextResponse.json({ settings: updatedUser.settings, journal: updatedUser.journal }, { status: 200 });
    }

    if (data.action === 'pair') {
      const targetUser = await User.findOne({ "settings.syncCode": data.code });
      if (!targetUser) {
        return NextResponse.json({ message: "Tento kód neexistuje nebo vypršel." }, { status: 400 });
      }

      await User.findOneAndUpdate(
        { email: session.user.email }, 
        { $set: { "settings.pairedWith": targetUser.email } }
      );
      await User.findOneAndUpdate(
        { email: targetUser.email }, 
        { $set: { "settings.pairedWith": session.user.email } }
      );

      return await GET(req);
    }

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

    const currentUser = await User.findOne({ email: session.user.email });
    let targetEmailForBioData = session.user.email; 

    if (currentUser.settings.pairedWith && currentUser.settings.role === 'partner') {
      const partner = await User.findOne({ email: currentUser.settings.pairedWith });
      if (partner && partner.settings.role === 'female') {
        targetEmailForBioData = partner.email; 
      }
    }

    if (targetEmailForBioData !== session.user.email) {
      const updatePartnerDoc = {};
      if (data.settings) {
        if (data.settings.periods) updatePartnerDoc["settings.periods"] = data.settings.periods;
        if (data.settings.cycleLength) updatePartnerDoc["settings.cycleLength"] = data.settings.cycleLength;
        if (data.settings.periodLength) updatePartnerDoc["settings.periodLength"] = data.settings.periodLength;
      }
      if (data.journal) updatePartnerDoc.journal = data.journal; 

      if (Object.keys(updatePartnerDoc).length > 0) {
        await User.findOneAndUpdate({ email: targetEmailForBioData }, { $set: updatePartnerDoc });
      }
    } else {
      const updateDoc = {};
      if (data.settings) updateDoc.settings = data.settings;
      if (data.journal) updateDoc.journal = data.journal;
      await User.findOneAndUpdate({ email: session.user.email }, { $set: updateDoc });

      // =========================================================================
      // NOTIFIKACE PŘI ZÁPISU DO DENÍKU
      // =========================================================================
      if (data.journal) {
        let recipientUser = null;

        // Pokud má propojeného partnera, pošle notifikaci partnerovi
        if (currentUser.settings.pairedWith) {
          recipientUser = await User.findOne({ email: currentUser.settings.pairedWith });
        } else {
          // Pokud testuje sám bez partnera, pošle zkušební notifikaci sám sobě
          recipientUser = currentUser;
        }

        if (recipientUser && recipientUser.settings?.pushSubscription) {
          const latestEntry = data.journal[data.journal.length - 1];
          let tipText = "Nové poznámky v deníku byly uloženy ❤️";

          if (latestEntry) {
            if (latestEntry.stress >= 4) {
              tipText = "⚠️ Zaznamenán vyšší stres. Dopřej tělu klid a oddych.";
            } else if (latestEntry.mood && latestEntry.mood <= 2) {
              tipText = "🌧️ Dnešek je náročnější. Zkus zpomalit a odpočinout si.";
            } else if (latestEntry.mood === 5) {
              tipText = "☀️ Skvělá nálada! Využij dnešek na plno.";
            } else if (latestEntry.symptoms && latestEntry.symptoms.length > 0) {
              tipText = `💊 Boli zaznamenané příznaky (${latestEntry.symptoms.join(', ')}).`;
            }
          }

          try {
            await webpush.sendNotification(
              recipientUser.settings.pushSubscription,
              JSON.stringify({
                title: "Vnitřní počasí 🌤️",
                body: tipText
              })
            );
          } catch (pushErr) {
            console.error("Chyba při odesílání push notifikace:", pushErr);
          }
        }
      }
      // =========================================================================
    }

    return await GET(req);

  } catch (error) {
    console.error("Chyba při PUT /api/user:", error);
    return NextResponse.json({ message: "Interní chyba serveru" }, { status: 500 });
  }
}
