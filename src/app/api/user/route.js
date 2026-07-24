import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) return NextResponse.json({ message: "Uživatel nenalezen" }, { status: 404 });

    return NextResponse.json({ settings: user.settings, journal: user.journal }, { status: 200 });
  } catch (error) {
    console.error("Chyba při GET /api/user:", error);
    return NextResponse.json({ message: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });

    const data = await req.json();
    await connectToDatabase();

    // 1. SCÉNÁŘ: Vygenerování unikátního kódu kýmkoliv
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

      const updatedUser = await User.findOne({ email: session.user.email });
      return NextResponse.json({ settings: updatedUser.settings, journal: updatedUser.journal }, { status: 200 });
    }

    // 3. SCÉNÁŘ: Běžné uložení (Deník nebo změna parametrů)
    const updateDoc = {};
    if (data.settings) updateDoc.settings = data.settings;
    if (data.journal) updateDoc.journal = data.journal;

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateDoc },
      { new: true }
    );

    return NextResponse.json({ settings: user?.settings, journal: user?.journal }, { status: 200 });
  } catch (error) {
    console.error("Chyba při PUT /api/user:", error);
    return NextResponse.json({ message: "Interní chyba serveru" }, { status: 500 });
  }
}
