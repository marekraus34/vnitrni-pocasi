"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  // Stav, který sleduje, nad jakým ročním obdobím má uživatel zrovna myš
  const [hoveredSeason, setHoveredSeason] = useState(null);

  // Funkce, která mění pozadí podle aktivního období
  const getDynamicBackground = () => {
    switch (hoveredSeason) {
      case 'winter': return 'radial-gradient(circle at 50% 60%, rgba(226,146,156,0.18) 0%, var(--bg) 70%)';
      case 'spring': return 'radial-gradient(circle at 50% 60%, rgba(159,203,164,0.18) 0%, var(--bg) 70%)';
      case 'summer': return 'radial-gradient(circle at 50% 60%, rgba(240,187,108,0.18) 0%, var(--bg) 70%)';
      case 'autumn': return 'radial-gradient(circle at 50% 60%, rgba(224,135,91,0.18) 0%, var(--bg) 70%)';
      default: return 'radial-gradient(circle at 50% 0%, rgba(245,238,232,0.04) 0%, var(--bg) 60%)';
    }
  };

  return (
    <div className="landing-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-wrapper {
          --glass: rgba(44, 37, 49, 0.4);
          --glass-border: rgba(245, 238, 232, 0.05);
          position: relative;
          overflow-x: hidden;
          padding: 0 18px;
          min-height: 100vh;
        }
        
        /* Nové dynamické pozadí měnící se podle ročních období */
        .dynamic-ambient-bg {
          position: fixed;
          inset: 0;
          z-index: -2;
          transition: background 1s cubic-bezier(0.2, 0.8, 0.2, 1);
          pointer-events: none;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(42px, 10vw, 76px);
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          color: var(--ink);
        }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--ink);
        }

        /* Karty období */
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
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .season-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: var(--card-accent);
          opacity: 0;
          transition: opacity 0.5s;
        }

        .season-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--card-accent);
          background: rgba(44, 37, 49, 0.9);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .season-card:hover::before {
          opacity: 1;
        }

        /* Nový realistický rámeček pro tvůj screenshot */
        .real-mockup {
          width: 100%;
          max-width: 300px;
          aspect-ratio: 9/19;
          margin: 60px auto 0;
          border-radius: 36px;
          background: var(--surface-2);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1);
          border: 10px solid #1a161e;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }
        
        .real-mockup img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 2;
        }

        .mockup-placeholder-text {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--ink-dim);
          line-height: 1.5;
          z-index: 1;
        }

        .step-row {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          padding: 32px 0;
          border-bottom: 1px solid var(--glass-border);
        }
        
        .step-num {
          font-family: var(--font-display);
          font-size: 56px;
          color: var(--surface-2);
          line-height: 0.8;
          font-style: italic;
        }
      `}} />

      {/* Tento div se plynule přebarvuje podle Hoveru */}
      <div className="dynamic-ambient-bg" style={{ background: getDynamicBackground() }}></div>

      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "100px" }}>
        
        {/* HERO SEKCE */}
        <header style={{ textAlign: "center", paddingTop: "100px", paddingBottom: "40px" }}>
          <p className="eyebrow" style={{ color: "var(--ink-dim)", marginBottom: "20px" }}>Seznamte se: Vnitřní počasí</p>
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

          {/* Vizuál - Rámeček připravený na tvůj screenshot */}
          <div className="real-mockup">
            {/* Po nahrání fotky se automaticky zobrazí. Dokud fotka není, ukazuje se text pod ní. */}
            <img src="/app-preview.png" alt="Ukázka aplikace" onError={(e) => e.target.style.display='none'} />
            <div className="mockup-placeholder-text">
              Nahraj snímek obrazovky<br/><br/>Pojmenuj ho:<br/><strong>app-preview.png</strong><br/><br/>a vlož ho do složky <strong>public</strong>.
            </div>
          </div>
        </header>

        {/* 4 ROČNÍ OBDOBÍ (S hover efektem) */}
        <section style={{ marginTop: "120px" }}>
          <h2 className="section-title" style={{ textAlign: "center" }}>4 Fáze. 4 Roční období.</h2>
          <p style={{ textAlign: "center", color: "var(--ink-dim)", marginBottom: "40px" }}>Přejeďte myší přes období pro změnu atmosféry.</p>
          
          <div className="season-grid" onMouseLeave={() => setHoveredSeason(null)}>
            
            <div className="season-card" style={{ '--card-accent': 'var(--winter)' }} onMouseEnter={() => setHoveredSeason('winter')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>❄️</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--winter)", marginBottom: "8px" }}>Zima (Menstruace)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Energie je na minimu. Tělo potřebuje klid. Skvělý čas na termofor a film. Náročné plány odložte.</p>
            </div>

            <div className="season-card" style={{ '--card-accent': 'var(--spring)' }} onMouseEnter={() => setHoveredSeason('spring')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>🌱</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--spring)", marginBottom: "8px" }}>Jaro (Folikulární)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Hormony se probouzí. Její nálada stoupá, roste chuť do nových věcí. Ideální čas navrhnout nový sport nebo výlet.</p>
            </div>

            <div className="season-card" style={{ '--card-accent': 'var(--summer)' }} onMouseEnter={() => setHoveredSeason('summer')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>☀️</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--summer)", marginBottom: "8px" }}>Léto (Ovulace)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Vrchol měsíce. Energie a sebevědomí jsou na maximu. Nejlepší doba na společenské akce a těžké rozhovory.</p>
            </div>

            <div className="season-card" style={{ '--card-accent': 'var(--autumn)' }} onMouseEnter={() => setHoveredSeason('autumn')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>🍂</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--autumn)", marginBottom: "8px" }}>Podzim (Luteální)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Energie klesá, přichází PMS. Může být podrážděná. Buďte trpěliví a uberte na nárocích i stresu.</p>
            </div>

          </div>
        </section>

        {/* JAK TO FUNGUJE */}
        <section style={{ marginTop: "140px", maxWidth: "600px", margin: "140px auto 0" }}>
          <h2 className="section-title">Jak to funguje?</h2>
          
          <div className="step-row">
            <span className="step-num">1</span>
            <div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Zadejte základní data</h3>
              <p style={{ color: "var(--ink-dim)", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>Zeptejte se jí, kdy naposledy začala krvácet a jak zhruba dlouhý má cyklus. To je vše, co do začátku potřebujete.</p>
            </div>
          </div>
          
          <div className="step-row">
            <span className="step-num">2</span>
            <div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Sledujte radar a tipy</h3>
              <p style={{ color: "var(--ink-dim)", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>Aplikace vám každý den ukáže, v jakém je období a navrhne vám, co přesně dělat (a čemu se raději vyhnout).</p>
            </div>
          </div>
          
          <div className="step-row" style={{ borderBottom: "none" }}>
            <span className="step-num">3</span>
            <div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Získávejte kontext</h3>
              <p style={{ color: "var(--ink-dim)", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>Zapisujte si její stres nebo špatný spánek. Aplikace data analyzuje a upozorní vás, když bude potřebovat více podpory.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ marginTop: "120px", textAlign: "center", paddingTop: "60px", borderTop: "1px solid var(--glass-border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", marginBottom: "24px" }}>Jste připraveni mít ve vztahu jasno?</h2>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "16px 36px", display: "inline-block", fontSize: "16px" }}>
            Vytvořit účet a začít
          </Link>
          <p style={{ marginTop: "40px", color: "var(--ink-dim)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            Vaše data jsou u nás v bezpečí a plně šifrovaná.
            <br/><br/>
            © 2026 Vnitřní počasí
          </p>
        </footer>

      </div>
    </div>
  );
}