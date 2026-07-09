import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      {/* Speciální CSS jen pro Landing Page (animace, hover efekty, organický vzhled) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-wrapper {
          --glass: rgba(44, 37, 49, 0.4);
          --glass-border: rgba(245, 238, 232, 0.05);
          position: relative;
          overflow-x: hidden;
          padding: 0 18px;
        }
        
        /* Dýchající organické pozadí (simulace počasí) */
        .ambient-bg {
          position: absolute;
          top: -10%; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(226,146,156,0.08) 0%, rgba(159,203,164,0.05) 35%, rgba(34,29,39,0) 70%);
          filter: blur(80px);
          z-index: -1;
          animation: breathe 12s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes breathe {
          0% { transform: translateX(-50%) scale(0.9); opacity: 0.6; }
          100% { transform: translateX(-50%) scale(1.1); opacity: 1; }
        }

        /* Elegantní typografie z inspirace */
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(42px, 10vw, 72px);
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          background: linear-gradient(180deg, var(--ink) 0%, var(--ink-dim) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(28px, 6vw, 42px);
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--ink);
        }

        /* Interaktivní karty 4 ročních období */
        .season-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          margin-top: 40px;
        }

        .season-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(12px);
          border-radius: var(--radius);
          padding: 32px 24px;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .season-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: var(--card-accent);
          opacity: 0.3;
          transition: opacity 0.4s;
        }

        .season-card:hover {
          transform: translateY(-5px);
          border-color: var(--card-accent);
          background: rgba(44, 37, 49, 0.8);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .season-card:hover::before {
          opacity: 1;
        }

        .season-icon {
          font-size: 32px;
          margin-bottom: 16px;
          display: block;
        }

        .season-name {
          font-family: var(--font-mono);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--card-accent);
          margin-bottom: 8px;
        }

        .season-desc {
          font-size: 15px;
          color: var(--ink-dim);
          line-height: 1.6;
        }

        /* Sekce "Jak to funguje" */
        .step-row {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          padding: 24px 0;
          border-bottom: 1px solid var(--glass-border);
        }
        
        .step-num {
          font-family: var(--font-display);
          font-size: 48px;
          color: var(--surface-2);
          line-height: 0.8;
          font-style: italic;
        }

        /* Mockup telefonu (Placeholder pro tvůj screen) */
        .phone-mockup {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 9/19;
          margin: 60px auto 0;
          border-radius: 40px;
          border: 8px solid var(--surface-2);
          background: linear-gradient(145deg, var(--surface) 0%, var(--bg) 100%);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .mockup-circle {
          width: 140px; height: 140px;
          border-radius: 50%;
          border: 12px solid var(--summer);
          border-top-color: var(--surface-2);
          transform: rotate(-45deg);
        }
      `}} />

      <div className="ambient-bg"></div>

      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "100px" }}>
        
        {/* HERO SEKCE */}
        <header style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "40px" }}>
          <p className="eyebrow" style={{ color: "var(--summer)", marginBottom: "16px" }}>Seznamte se: Vnitřní počasí</p>
          <h1 className="hero-title">
            Pochopte její cyklus.<br />Předpovězte náladu.
          </h1>
          <p className="subtitle" style={{ maxWidth: "54ch", fontSize: "18px", margin: "0 auto 40px", color: "var(--ink-dim)" }}>
            Změny nálad nejsou náhodné. Jsou to jen roční období, která se střídají uvnitř jejího těla. Zjistěte, v jaké je fázi, a buďte o krok napřed.
          </p>
          
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "16px 36px", fontSize: "16px" }}>
              Založit účet zdarma
            </Link>
            <Link href="/login" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "16px 36px", fontSize: "16px", background: "rgba(255,255,255,0.05)", color: "var(--ink)", border: "1px solid var(--border)" }}>
              Přihlásit se
            </Link>
          </div>

          {/* Vizuál (Telefon) */}
          <div className="phone-mockup">
            <div className="mockup-circle"></div>
            <div style={{ marginTop: "24px", width: "60%", height: "8px", background: "var(--surface-2)", borderRadius: "4px" }}></div>
            <div style={{ marginTop: "12px", width: "40%", height: "8px", background: "var(--surface-2)", borderRadius: "4px" }}></div>
          </div>
        </header>

        {/* PROBLÉM VS. ŘEŠENÍ */}
        <section style={{ marginTop: "120px", textAlign: "center", maxWidth: "600px", margin: "120px auto 0" }}>
          <h2 className="section-title">Včera to byl skvělý nápad. Dnes je to důvod k hádce.</h2>
          <p style={{ fontSize: "16px", color: "var(--ink-dim)", lineHeight: "1.7" }}>
            Znáte ten pocit, kdy plánujete výlet, ale ona chce najednou zůstat doma pod dekou? Problém není ve vás. Během 28 dnů se v ženském těle vystřídají 4 různé hormonální fáze. Každá vyžaduje jiný přístup.
          </p>
        </section>

        {/* 4 ROČNÍ OBDOBÍ (Interaktivní) */}
        <section style={{ marginTop: "80px" }}>
          <h2 className="section-title" style={{ textAlign: "center" }}>4 Fáze. 4 Roční období.</h2>
          <div className="season-grid">
            
            <div className="season-card" style={{ '--card-accent': 'var(--winter)' }}>
              <span className="season-icon">❄️</span>
              <h3 className="season-name">Zima (Menstruace)</h3>
              <p className="season-desc">Energie je na minimu. Tělo potřebuje klid. Skvělý čas na termofor, horký čaj a film na gauči. Náročné plány odložte.</p>
            </div>

            <div className="season-card" style={{ '--card-accent': 'var(--spring)' }}>
              <span className="season-icon">🌱</span>
              <h3 className="season-name">Jaro (Folikulární)</h3>
              <p className="season-desc">Hormony se probouzí. Její nálada stoupá, roste chuť do nových věcí. Ideální čas navrhnout nový sport nebo výlet.</p>
            </div>

            <div className="season-card" style={{ '--card-accent': 'var(--summer)' }}>
              <span className="season-icon">☀️</span>
              <h3 className="season-name">Léto (Ovulace)</h3>
              <p className="season-desc">Vrchol měsíce. Energie a sebevědomí jsou na maximu. Nejlepší doba na velké společenské akce a těžké rozhovory.</p>
            </div>

            <div className="season-card" style={{ '--card-accent': 'var(--autumn)' }}>
              <span className="season-icon">🍂</span>
              <h3 className="season-name">Podzim (Luteální)</h3>
              <p className="season-desc">Energie klesá, přichází PMS. Může být citlivější a podrážděná. Buďte trpěliví a uberte na nárocích i stresu.</p>
            </div>

          </div>
        </section>

        {/* JAK TO FUNGUJE */}
        <section style={{ marginTop: "120px", maxWidth: "600px", margin: "120px auto 0" }}>
          <h2 className="section-title">Jak to funguje?</h2>
          
          <div className="step-row">
            <span className="step-num">1</span>
            <div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Zadejte základní data</h3>
              <p style={{ color: "var(--ink-dim)", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>Zeptejte se jí, kdy naposledy začala krvácet a jak zhruba dlouhý má cyklus. To je vše, co potřebujete do začátku.</p>
            </div>
          </div>
          
          <div className="step-row">
            <span className="step-num">2</span>
            <div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Sledujte radar a tipy</h3>
              <p style={{ color: "var(--ink-dim)", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>Aplikace vám každý den ukáže, v jakém je období a navrhne vám, co přesně dělat (a čemu se vyvarovat).</p>
            </div>
          </div>
          
          <div className="step-row" style={{ borderBottom: "none" }}>
            <span className="step-num">3</span>
            <div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Získávejte kontext</h3>
              <p style={{ color: "var(--ink-dim)", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>Zapisujte si její stres nebo špatný spánek. Aplikace to vyhodnotí a upozorní vás, když bude potřebovat více vaší podpory.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ marginTop: "120px", textAlign: "center", paddingTop: "40px", borderTop: "1px solid var(--glass-border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", marginBottom: "24px" }}>Jste připraveni vylepšit svůj vztah?</h2>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "14px 32px", display: "inline-block" }}>
            Začít používat aplikaci
          </Link>
          <p style={{ marginTop: "40px", color: "var(--ink-dim)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            ZÁRUKA SOUKROMÍ: Data jsou bezpečně šifrována na cloudu a nejsou sdílena s třetími stranami.
            <br/><br/>
            © 2026 Vnitřní počasí
          </p>
        </footer>

      </div>
    </div>
  );
}