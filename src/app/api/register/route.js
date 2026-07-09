import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectToDatabase();

    // Zkontrolujeme, jestli uživatel už neexistuje
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "E-mail už je zaregistrovaný." }, { status: 400 });
    }

    // Zašifrování hesla
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vytvoření uživatele v databázi
    await User.create({ email, password: hashedPassword });

    return NextResponse.json({ message: "Uživatel vytvořen." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Chyba serveru." }, { status: 500 });
  }
}