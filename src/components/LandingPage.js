"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [activeSeason, setActiveSeason] = useState(null);

  // Sledování scrollování a zjišťování, co je zrovna uprostřed obrazovky
  useEffect(() => {
    // Sledujeme karty ročních období (spustí se, když je karta zhruba uprostřed obrazovky)
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSeason(entry.target.dataset.season);
        }
      });
    }, { 
      // Ignoruje vrchních a spodních 35% obrazovky. Reaguje jen na prostředek.
      rootMargin: "-35% 0px -35% 0px" 
    });

    const cards = document.querySelectorAll('.season-card');
    cards.forEach(card => cardObserver.observe(card));

    // Sledujeme hlavičku, aby se pozadí vrátilo do normálu, když vyjedeš úplně nahoru
    const headerObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setActiveSeason(null);
      }
    }, { threshold: 0.3 });
    
    const header = document.getElementById('landing-header');
    if (header) headerObserver.observe(header);

    return () => {
      cardObserver.disconnect();
      headerObserver.disconnect();
    };
  }, []);

// Funkce vrací 3 barvy a průhlednost pro 3 pohybující se vrstvy
  const getGradientColors = () => {
    switch (activeSeason) {
      case 'winter': return { c1: '#E2929C', c2: '#7A5B6B', c3: '#2B3A67', op: 0.7 };
      case 'spring': return { c1: '#9FCBA4', c2: '#5C8A69', c3: '#2B5C5D', op: 0.7 };
      case 'summer': return { c1: '#F0BB6C', c2: '#E25B5B', c3: '#9A2A54', op: 0.7 };
      case 'autumn': return { c1: '#E0875B', c2: '#8B3A2B', c3: '#C98A2C', op: 0.7 };
      // Výchozí stav (když to zapneš): Jemný mix růžové, žluté a zelené s nižší průhledností
      default: return { c1: '#E2929C', c2: '#F0BB6C', c3: '#5C8A69', op: 0.25 };
    }
  };

  const colors = getGradientColors();

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
        
        .mesh-background {
          position: fixed;
          inset: 0;
          z-index: -3;
          background: var(--bg);
          overflow: hidden;
        }

        .mesh-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.6;
          transition: background 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .orb-1 {
          width: 120vw; height: 60vh;
          bottom: -30vh; left: -10vw;
          animation: float1 14s infinite alternate ease-in-out;
        }
        
        .orb-2 {
          width: 80vw; height: 80vh;
          bottom: -40vh; right: -20vw;
          animation: float2 18s infinite alternate-reverse ease-in-out;
        }

        .orb-3 {
          width: 90vw; height: 70vh;
          bottom: -20vh; left: -20vw;
          animation: float3 22s infinite alternate ease-in-out;
        }

        @keyframes float1 {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          100% { transform: translateY(-5vh) rotate(5deg) scale(1.1); }
        }
        @keyframes float2 {
          0% { transform: translateX(0) translateY(0) scale(1); }
          100% { transform: translateX(-15vw) translateY(-10vh) scale(1.15); }
        }
        @keyframes float3 {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          100% { transform: translate(10vw, -15vh) rotate(-5deg) scale(1.2); }
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          z-index: -2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
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
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--ink);
        }

        .season-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          margin-top: 40px;
        }

        .season-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(16px);
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

        /* Upraveno: Karta reaguje na hover myši i na .active třídu při scrollování */
        .season-card:hover, .season-card.active {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--card-accent);
          background: rgba(44, 37, 49, 0.7);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .season-card:hover::before, .season-card.active::before {
          opacity: 1;
        }

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

{/* TADY SE DĚJE TA MAGIE S POHYBUJÍCÍM SE POZADÍM */}
      <div className="mesh-background">
        <div className="mesh-orb orb-1" style={{ background: colors.c1, opacity: colors.op }}></div>
        <div className="mesh-orb orb-2" style={{ background: colors.c2, opacity: colors.op }}></div>
        <div className="mesh-orb orb-3" style={{ background: colors.c3, opacity: colors.op }}></div>
      </div>
      <div className="noise-overlay"></div>

      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "100px", position: "relative", zIndex: 1 }}>
        
        {/* HERO SEKCE (Při najetí na začátek stránky se pozadí zklidní) */}
        <header id="landing-header" style={{ textAlign: "center", paddingTop: "100px", paddingBottom: "40px" }}>
          <p className="eyebrow" style={{ color: "var(--ink-dim)", marginBottom: "20px" }}>Seznamte se: Vnitřní počasí</p>
          <h1 className="hero-title">
            Pochopte její cyklus.<br />Předpovězte náladu.
          </h1>
          <p className="subtitle" style={{ maxWidth: "54ch", fontSize: "18px", margin: "0 auto 40px", color: "var(--ink-dim)" }}>
            Změny nálad nejsou náhodné. Jsou to jen roční období, která se střídají uvnitř jejího těla. Zjistěte, v jaké je fázi, a buďte o krok napřed.
          </p>
          
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "16px 36px", fontSize: "16px", backdropFilter: "blur(10px)" }}>
              Založit účet zdarma
            </Link>
            <Link href="/login" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "16px 36px", fontSize: "16px", background: "rgba(255,255,255,0.05)", color: "var(--ink)", border: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
              Přihlásit se
            </Link>
          </div>

          <div className="real-mockup">
            <img src="/app-preview.png" alt="Ukázka aplikace" onError={(e) => e.target.style.display='none'} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--ink-dim)", lineHeight: 1.5, zIndex: 1 }}>
              Nahraj snímek obrazovky<br/><br/>Pojmenuj ho:<br/><strong>app-preview.png</strong><br/><br/>a vlož ho do složky <strong>public</strong>.
            </div>
          </div>
        </header>

        {/* 4 ROČNÍ OBDOBÍ */}
        <section style={{ marginTop: "120px" }}>
          <h2 className="section-title" style={{ textAlign: "center" }}>4 Fáze. 4 Roční období.</h2>
          <p style={{ textAlign: "center", color: "var(--ink-dim)", marginBottom: "40px" }}>Jak budete posouvat stránku, prostředí se bude automaticky měnit.</p>
          
          <div className="season-grid" onMouseLeave={() => setActiveSeason(null)}>
            
            <div 
              className={`season-card ${activeSeason === 'winter' ? 'active' : ''}`} 
              data-season="winter"
              style={{ '--card-accent': 'var(--winter)' }} 
              onMouseEnter={() => setActiveSeason('winter')}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>❄️</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--winter)", marginBottom: "8px" }}>Zima (Menstruace)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Energie je na minimu. Tělo potřebuje klid. Skvělý čas na termofor a film. Náročné plány odložte.</p>
            </div>

            <div 
              className={`season-card ${activeSeason === 'spring' ? 'active' : ''}`} 
              data-season="spring"
              style={{ '--card-accent': 'var(--spring)' }} 
              onMouseEnter={() => setActiveSeason('spring')}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>🌱</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--spring)", marginBottom: "8px" }}>Jaro (Folikulární)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Hormony se probouzí. Její nálada stoupá, roste chuť do nových věcí. Ideální čas navrhnout nový sport nebo výlet.</p>
            </div>

            <div 
              className={`season-card ${activeSeason === 'summer' ? 'active' : ''}`} 
              data-season="summer"
              style={{ '--card-accent': 'var(--summer)' }} 
              onMouseEnter={() => setActiveSeason('summer')}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>☀️</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--summer)", marginBottom: "8px" }}>Léto (Ovulace)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Vrchol měsíce. Energie a sebevědomí jsou na maximu. Nejlepší doba na společenské akce a těžké rozhovory.</p>
            </div>

            <div 
              className={`season-card ${activeSeason === 'autumn' ? 'active' : ''}`} 
              data-season="autumn"
              style={{ '--card-accent': 'var(--autumn)' }} 
              onMouseEnter={() => setActiveSeason('autumn')}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>🍂</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--autumn)", marginBottom: "8px" }}>Podzim (Luteální)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Energie klesá, přichází PMS. Může být podrážděná. Buďte trpěliví a uberte na nárocích i stresu.</p>
            </div>

          </div>
        </section>

{/* BENTO BOX GRID (Jak to funguje) */}
        <section style={{ marginTop: "160px", position: "relative", zIndex: 10 }}>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "16px" }}>Všechno, co potřebujete, v jedné aplikaci</h2>
          <p style={{ textAlign: "center", color: "var(--ink-dim)", marginBottom: "40px", fontSize: "16px" }}>Žádné složité tabulky. Jen čistá data a jasné instrukce.</p>
          
          <style dangerouslySetInnerHTML={{ __html: `
            .bento-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              grid-auto-rows: 240px;
              gap: 20px;
            }
            .bento-card {
              background: linear-gradient(145deg, rgba(44, 37, 49, 0.6) 0%, rgba(30, 25, 34, 0.8) 100%);
              border: 1px solid rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(20px);
              border-radius: 32px;
              padding: 32px;
              display: flex;
              flex-direction: column;
              position: relative;
              overflow: hidden;
              transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .bento-card:hover { 
              transform: translateY(-8px) scale(1.01); 
              border-color: rgba(255, 255, 255, 0.15);
              box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
            }
            .bento-card h3 { font-family: var(--font-display); font-size: 26px; margin-bottom: 12px; color: var(--ink); z-index: 2; }
            .bento-card p { color: var(--ink-dim); font-size: 15px; line-height: 1.6; z-index: 2; margin: 0; }
            
            .wide { grid-column: span 2; }
            .tall { grid-row: span 2; justify-content: flex-end; }
            
            /* Vizuální prvky uvnitř karet */
            .bento-visual {
              position: absolute;
              z-index: 1;
              transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .bento-card:hover .bento-visual { transform: scale(1.05) translate(-5px, 5px); }
            
            /* Radar Graphic */
            .mini-radar {
              width: 140px; height: 140px;
              border-radius: 50%;
              border: 16px solid var(--surface-2);
              border-top-color: var(--summer);
              border-right-color: var(--summer);
              transform: rotate(-15deg);
              box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
            }

            /* Graph Graphic */
            .mini-graph {
              display: flex;
              align-items: flex-end;
              gap: 8px;
              height: 120px;
            }
            .bar { width: 24px; background: var(--surface-2); border-radius: 4px 4px 0 0; }
            .bar.active { background: var(--autumn); }

            /* Tags Graphic */
            .mini-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 24px;
            }
            .mini-tag {
              background: var(--surface-2);
              color: var(--ink-dim);
              padding: 6px 12px;
              border-radius: 99px;
              font-size: 11px;
              font-family: var(--font-mono);
              border: 1px solid var(--border);
            }
            .mini-tag.highlight { background: var(--winter); color: var(--bg); border-color: var(--winter); }

            @media (max-width: 800px) {
              .bento-grid { grid-template-columns: 1fr; grid-auto-rows: auto; min-height: 240px; }
              .wide, .tall { grid-column: span 1; grid-row: span 1; }
            }
          `}} />

          <div className="bento-grid">
            
            {/* Karta 1: Radar */}
            <div className="bento-card wide" style={{ background: "linear-gradient(145deg, rgba(240,187,108,0.1), rgba(30,25,34,0.8))" }}>
              <div className="bento-visual" style={{ top: "-20px", right: "-20px" }}>
                <div className="mini-radar"></div>
              </div>
              <div style={{ marginTop: "auto", maxWidth: "60%" }}>
                <h3>Přesný radar fází</h3>
                <p>Žádné zmatky. Okamžitě vidíte, v jakém ročním období se nachází, a kolik jí zbývá energie na vaše společné plány.</p>
              </div>
            </div>
            
            {/* Karta 2: Deník a příznaky */}
            <div className="bento-card">
              <h3>Deník nálad</h3>
              <p>Zaznamenejte si, co zrovna prožívá.</p>
              <div className="mini-tags">
                <div className="mini-tag highlight">Křeče</div>
                <div className="mini-tag">Únava</div>
                <div className="mini-tag">Podrážděnost</div>
              </div>
            </div>

            {/* Karta 3: Analýza (Vysoká) */}
            <div className="bento-card tall" style={{ background: "linear-gradient(180deg, rgba(226,146,156,0.1), rgba(30,25,34,0.8))" }}>
              <div className="bento-visual" style={{ top: "40px", left: "32px", right: "32px" }}>
                <div className="mini-graph">
                  <div className="bar" style={{ height: "40%" }}></div>
                  <div className="bar" style={{ height: "60%" }}></div>
                  <div className="bar" style={{ height: "80%" }}></div>
                  <div className="bar active" style={{ height: "100%" }}></div>
                  <div className="bar" style={{ height: "50%" }}></div>
                </div>
              </div>
              <h3>Trendová analýza</h3>
              <p>Aplikace se učí z vašich záznamů. Zjistěte, jak moc stres ovlivňuje délku jejího cyklu, a předvídejte krize dřív, než nastanou.</p>
            </div>

            {/* Karta 4: Tipy a kontext */}
            <div className="bento-card">
              <h3 style={{ color: "var(--spring)" }}>Konkrétní tipy</h3>
              <p>Ke každému dni dostanete seznam "Co dělat" a "Čemu se vyhnout". Třeba kdy ji vzít na rande a kdy koupit čokoládu.</p>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ marginTop: "120px", textAlign: "center", paddingTop: "60px", borderTop: "1px solid var(--glass-border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", marginBottom: "24px" }}>Jste připraveni mít ve vztahu jasno?</h2>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "16px 36px", display: "inline-block", fontSize: "16px", backdropFilter: "blur(10px)" }}>
            Vytvořit účet a začít
          </Link>
          <p style={{ marginTop: "40px", color: "var(--ink-dim)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            Vaše data jsou u nás v bezpečí a plně šifrovaná. Nečteme je a neprodáváme.
            <br/><br/>
            © 2026 Vnitřní počasí
          </p>
        </footer>

      </div>
    </div>
  );
}
