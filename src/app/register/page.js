"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Zavoláme naše API vytvořené v předchozím kroku
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/login"); // Po úspěšné registraci pošleme uživatele se přihlásit
    } else {
      const data = await res.json();
      setError(data.message || "Nastala chyba při registraci.");
    }
  };

  return (
    <div className="app">
      <header className="hero" style={{ marginTop: "40px" }}>
        <h1 className="title">Vnitřní počasí</h1>
        <p className="subtitle">Vytvoř si nový účet</p>
      </header>
      <section className="card">
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Heslo</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
          </label>
          {error && <p style={{ color: "var(--autumn)", fontSize: "13px", margin: "0 0 12px" }}>{error}</p>}
          <button type="submit" className="btn-primary">Vytvořit účet</button>
        </form>
        <div style={{ marginTop: "18px", textAlign: "center", fontSize: "14px" }}>
          <span style={{ color: "var(--ink-dim)" }}>Už máš účet? </span>
          <Link href="/login" style={{ color: "var(--summer)", textDecoration: "none" }}>Přihlas se</Link>
        </div>
      </section>
    </div>
  );
}