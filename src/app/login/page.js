"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res.error) {
      setError("Neplatný e-mail nebo heslo.");
    } else {
      router.push("/"); // Po úspěšném přihlášení přesměrujeme na hlavní stránku
    }
  };

  return (
    <div className="app">
      <header className="hero" style={{ marginTop: "40px" }}>
        <h1 className="title">Vnitřní počasí</h1>
        <p className="subtitle">Přihlas se ke svému účtu</p>
      </header>
      <section className="card">
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Heslo</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <p style={{ color: "var(--autumn)", fontSize: "13px", margin: "0 0 12px" }}>{error}</p>}
          <button type="submit" className="btn-primary">Přihlásit se</button>
        </form>
        <div style={{ marginTop: "18px", textAlign: "center", fontSize: "14px" }}>
          <span style={{ color: "var(--ink-dim)" }}>Nemáš ještě účet? </span>
          <Link href="/register" style={{ color: "var(--summer)", textDecoration: "none" }}>Zaregistruj se</Link>
        </div>
      </section>
    </div>
  );
}