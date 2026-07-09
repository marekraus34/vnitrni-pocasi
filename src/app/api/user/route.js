import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// Metoda pro NAČTENÍ dat (když se stránka poprvé načte)
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

// Metoda pro ULOŽENÍ dat (když uživatel přidá zápis nebo změní nastavení)
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });

    const data = await req.json();
    await connectToDatabase();

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