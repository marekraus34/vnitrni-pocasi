import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="app" style={{ maxWidth: "800px" }}>
      <header className="hero" style={{ marginTop: "60px", marginBottom: "60px" }}>
        <p className="eyebrow" style={{ color: "var(--summer)" }}>Inner Weather</p>
        <h1 className="title" style={{ fontSize: "clamp(34px, 8vw, 56px)", lineHeight: "1.15" }}>
          Pochop její cyklus.<br />Předpověz náladu.
        </h1>
        <p className="subtitle" style={{ maxWidth: "46ch", fontSize: "16px", marginTop: "24px" }}>
          Aplikace pro muže, kteří chtějí mít ve vztahu jasno. Zjisti, v jaké je právě fázi, kdy plánovat náročné výlety a kdy raději přinést čokoládu a pustit film.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "36px", flexWrap: "wrap" }}>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "14px 32px" }}>
            Začít zdarma
          </Link>
          <Link href="/login" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "14px 32px", background: "transparent", color: "var(--ink)", border: "1px solid var(--border)" }}>
            Přihlásit se
          </Link>
        </div>
      </header>

      <section style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div className="card">
          <h3 style={{ color: "var(--summer)", fontFamily: "var(--font-body)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            4 Roční období
          </h3>
          <p style={{ fontSize: "14.5px", color: "var(--ink-dim)", lineHeight: "1.6" }}>
            Ženský cyklus není jen menstruace. Sleduj, jak se přirozeně mění její energie od zimního útlumu po letní vrchol.
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: "var(--spring)", fontFamily: "var(--font-body)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            Jasné tipy
          </h3>
          <p style={{ fontSize: "14.5px", color: "var(--ink-dim)", lineHeight: "1.6" }}>
            Ke každé fázi dostaneš konkrétní doporučení. Co navrhnout za program a jakým konverzacím se raději vyhnout.
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: "var(--autumn)", fontFamily: "var(--font-body)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            Chytrý deník
          </h3>
          <p style={{ fontSize: "14.5px", color: "var(--ink-dim)", lineHeight: "1.6" }}>
            Zapisuj si poznámky, úroveň stresu a spánku. Systém tě upozorní, jakmile bude potřebovat víc tvé podpory.
          </p>
        </div>
      </section>

      <footer style={{ marginTop: "80px", textAlign: "center", padding: "24px 0", borderTop: "1px solid var(--border)", color: "var(--ink-dim)", fontSize: "13px" }}>
        <p>© 2026 Vnitřní počasí. Vytvořeno pro lepší vztahy.</p>
      </footer>
    </div>
  );
}