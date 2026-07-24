"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [activeSeason, setActiveSeason] = useState(null);
  const [savedEmail, setSavedEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("lastUserEmail");
    if (storedEmail) setSavedEmail(storedEmail);

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSeason(entry.target.dataset.season);
        }
      });
    }, { rootMargin: "-35% 0px -35% 0px" });

    const cards = document.querySelectorAll('.season-card');
    cards.forEach(card => cardObserver.observe(card));

    const headerObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setActiveSeason(null);
    }, { threshold: 0.3 });
    
    const header = document.getElementById('landing-header');
    if (header) headerObserver.observe(header);

    return () => {
      cardObserver.disconnect();
      headerObserver.disconnect();
    };
  }, []);

  const handleClearUser = () => {
    localStorage.removeItem("lastUserEmail");
    setSavedEmail(null);
  };

  const getGradientColors = () => {
    switch (activeSeason) {
      case 'winter': return { c1: '#E2929C', c2: '#7A5B6B', c3: '#2B3A67', op: 0.8 };
      case 'spring': return { c1: '#9FCBA4', c2: '#5C8A69', c3: '#2B5C5D', op: 0.8 };
      case 'summer': return { c1: '#F0BB6C', c2: '#E25B5B', c3: '#9A2A54', op: 0.8 };
      case 'autumn': return { c1: '#E0875B', c2: '#8B3A2B', c3: '#C98A2C', op: 0.8 };
      default: return { c1: '#E2929C', c2: '#F0BB6C', c3: '#5C8A69', op: 0.35 };
    }
  };

  const colors = getGradientColors();

  return (
    <div className="landing-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-wrapper {
          position: relative;
          overflow-x: hidden;
          padding: 0 18px;
          min-height: 100vh;
        }
        
        .ios-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(48px) saturate(200%);
          -webkit-backdrop-filter: blur(48px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          border-left: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);
          border-radius: 40px;
        }

        .glass-nav {
          position: fixed;
          top: 16px; left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 900px;
          height: 64px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 100;
        }
        
        .glass-btn {
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .glass-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2), inset 0 2px 2px rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4) !important;
        }
        .user-badge {
          display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 99px;
          background: rgba(255,255,255,0.05);
        }
        .status-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--spring); box-shadow: 0 0 8px var(--spring);
        }

        .mesh-background { position: fixed; inset: 0; z-index: -3; background: var(--bg); overflow: hidden; }

        .mesh-orb {
          position: absolute; border-radius: 50%; filter: blur(100px);
          transition: background 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.5s ease;
        }

        .orb-1 { width: 120vw; height: 60vh; bottom: -30vh; left: -10vw; animation: float1 14s infinite alternate ease-in-out; }
        .orb-2 { width: 80vw; height: 80vh; bottom: -40vh; right: -20vw; animation: float2 18s infinite alternate-reverse ease-in-out; }
        .orb-3 { width: 90vw; height: 70vh; bottom: -20vh; left: -20vw; animation: float3 22s infinite alternate ease-in-out; }

        @keyframes float1 { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-5vh) scale(1.1); } }
        @keyframes float2 { 0% { transform: translateX(0) scale(1); } 100% { transform: translateX(-15vw) scale(1.15); } }
        @keyframes float3 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(10vw, -15vh) scale(1.2); } }

        .noise-overlay {
          position: fixed; inset: 0; z-index: -2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05; pointer-events: none;
        }

        .hero-title {
          font-family: var(--font-display); font-size: clamp(42px, 10vw, 76px); font-weight: 500;
          line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 24px; color: var(--ink);
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .section-title { font-family: var(--font-display); font-size: clamp(32px, 6vw, 48px); font-weight: 500; margin-bottom: 16px; color: var(--ink); }

        .season-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 40px; }
        
        .season-card { padding: 32px 24px; transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); cursor: pointer; position: relative; overflow: hidden; }
        .season-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--card-accent); opacity: 0; transition: opacity 0.5s; }
        .season-card:hover, .season-card.active { transform: translateY(-8px) scale(1.02); box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.3); }
        .season-card:hover::before, .season-card.active::before { opacity: 1; }

        .real-mockup {
          width: 100%; max-width: 320px; aspect-ratio: 9/19; margin: 60px auto 0;
          position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; padding: 20px;
          border-radius: 48px;
        }
        .real-mockup img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; border-radius: 48px;}

        /* BENTO GRID */
        .bento-grid { 
          display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: minmax(280px, auto); gap: 24px; margin-top: 40px;
        }
        
        .bento-card {
          padding: 40px 32px; display: flex; flex-direction: column; position: relative; overflow: hidden;
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .bento-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.3); }

        .bento-card h3, .bento-card p, .mini-tags, .text-content { position: relative; z-index: 3; }
        .bento-card h3 { font-family: var(--font-display); font-size: 28px; margin-bottom: 12px; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .bento-card p { color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0; }
        
        .wide { grid-column: span 2; }
        .tall { grid-row: span 2; justify-content: flex-start; }
        
        .liquid-glow { position: absolute; border-radius: 50%; filter: blur(50px); z-index: 0; opacity: 0.6; transition: transform 2s ease; }
        .bento-card:hover .liquid-glow { transform: scale(1.2); }

        .bento-visual { position: absolute; z-index: 1; transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .bento-card:hover .bento-visual { transform: scale(1.05) translate(-5px, 5px); }
        
        .card-radar .bento-visual { top: 32px; right: 32px; }
        .mini-radar {
          width: 150px; height: 150px; border-radius: 50%; border: 14px solid rgba(255,255,255,0.06);
          border-top-color: var(--summer); border-right-color: var(--summer); transform: rotate(-15deg);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.6), 0 0 40px rgba(240,187,108,0.2);
        }

        .mini-graph { display: flex; align-items: flex-end; justify-content: center; gap: 12px; height: 150px; }
        .bar { width: 32px; background: rgba(255,255,255,0.08); border-radius: 8px 8px 0 0; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); border-bottom: none; }
        .bar.active { background: linear-gradient(180deg, var(--autumn) 0%, rgba(224,135,91,0.1) 100%); border-color: var(--autumn); box-shadow: 0 0 20px rgba(224,135,91,0.4); }

        .card-journal { align-items: center; text-align: center; justify-content: center; }
        .card-journal .text-content { max-width: 100%; }
        
        .mini-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 24px; }
        .mini-tag { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.9); padding: 8px 14px; border-radius: 99px; font-size: 12.5px; font-family: var(--font-mono); border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(10px); }
        .mini-tag.highlight { background: var(--winter); color: var(--bg); border-color: var(--winter); font-weight: 600; }

        .text-content { max-width: 60%; }

        @media (max-width: 900px) {
          .nav-email { display: none; }
          .season-grid { grid-template-columns: 1fr; }
          .bento-grid { grid-template-columns: 1fr; grid-auto-rows: auto; }
          .wide, .tall { grid-column: span 1; grid-row: span 1; }
          .bento-card { min-height: 320px; padding: 32px 24px; }
          .card-radar .text-content { max-width: 100%; position: relative; z-index: 10; }
          .card-radar .bento-visual { top: 24px; right: 24px; transform: scale(0.7); transform-origin: top right; opacity: 0.3; }
          .card-graph { padding-bottom: 180px; } 
          .card-graph .bento-visual { left: 0; right: 0; bottom: 0; }
          .mini-graph { gap: 8px; }
          .bar { width: 24px; }
        }
      `}} />

      <div className="mesh-background">
        <div className="mesh-orb orb-1" style={{ background: colors.c1, opacity: colors.op }}></div>
        <div className="mesh-orb orb-2" style={{ background: colors.c2, opacity: colors.op }}></div>
        <div className="mesh-orb orb-3" style={{ background: colors.c3, opacity: colors.op }}></div>
      </div>
      <div className="noise-overlay"></div>

      <nav className="glass-nav ios-glass">
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "18px", color: "var(--ink)" }}>Vnitřní počasí</span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          
          {savedEmail && (
            <div className="nav-email user-badge ios-glass" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
              <span className="status-dot"></span>
              <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>
                {savedEmail}
              </span>
            </div>
          )}

          <Link href="/login" className="glass-btn ios-glass" style={{ display: "inline-flex", alignItems: "center", padding: "8px 20px", borderRadius: "99px", textDecoration: "none", color: "var(--ink)", fontSize: "13px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.25)" }}>
            {savedEmail ? "Znovu přihlásit" : "Přihlásit"}
          </Link>
          
        </div>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "100px", position: "relative", zIndex: 1 }}>
        
        <header id="landing-header" style={{ textAlign: "center", paddingTop: "140px", paddingBottom: "40px" }}>
          <p className="eyebrow" style={{ color: "var(--ink-dim)", marginBottom: "20px" }}>Pro tebe i pro něj</p>
          <h1 className="hero-title">Předpověz náladu.<br />Mějte ve vztahu jasno.</h1>
          <p className="subtitle" style={{ maxWidth: "54ch", fontSize: "18px", margin: "0 auto 40px", color: "var(--ink-dim)", lineHeight: 1.6 }}>
            Změny nálad nejsou náhodné. Jsou to roční období uvnitř těla. Sleduj svůj vlastní cyklus, nebo lépe porozuměj cyklu své partnerky.
          </p>
          
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            {savedEmail ? (
              <>
                <Link href="/login" className="ios-glass" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", padding: "16px 36px", fontSize: "16px", color: "var(--bg)", background: "var(--ink)", fontWeight: 600, borderRadius: "99px" }}>
                  Pokračovat do aplikace
                </Link>
                <button onClick={handleClearUser} className="glass-btn ios-glass" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", background: "transparent", padding: "16px 36px", fontSize: "14px", color: "var(--ink)", fontWeight: 500, borderRadius: "99px" }}>
                  Přihlásit se pod jiným účtem
                </button>
              </>
            ) : (
              <Link href="/register" className="ios-glass" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", padding: "16px 36px", fontSize: "16px", color: "var(--ink)", fontWeight: 600, borderRadius: "99px" }}>
                Založit účet zdarma
              </Link>
            )}
          </div>

          <div className="real-mockup ios-glass">
            <img src="/app-preview.png" alt="Ukázka aplikace" onError={(e) => e.target.style.display='none'} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--ink)", lineHeight: 1.5, zIndex: 1 }}>
              Nahraj snímek obrazovky<br/>(app-preview.png)
            </div>
          </div>
        </header>

        <section style={{ marginTop: "120px" }}>
          <h2 className="section-title" style={{ textAlign: "center" }}>4 Fáze. 4 Roční období.</h2>
          <p style={{ textAlign: "center", color: "var(--ink-dim)", marginBottom: "40px" }}>Posouvejte stránkou a vnímejte změny.</p>
          
          <div className="season-grid" onMouseLeave={() => setActiveSeason(null)}>
            <div className={`season-card ios-glass ${activeSeason === 'spring' ? 'active' : ''}`} data-season="spring" style={{ '--card-accent': 'var(--spring)' }} onMouseEnter={() => setActiveSeason('spring')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>🌱</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--spring)", marginBottom: "8px" }}>Jaro (Folikulární)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Hormony se probouzí. Ideální čas vyzkoušet něco nového nebo naplánovat výlet.</p>
            </div>
            <div className={`season-card ios-glass ${activeSeason === 'summer' ? 'active' : ''}`} data-season="summer" style={{ '--card-accent': 'var(--summer)' }} onMouseEnter={() => setActiveSeason('summer')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>☀️</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--summer)", marginBottom: "8px" }}>Léto (Ovulace)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Vrchol měsíce. Energie a sebevědomí jsou na maximu. Skvělý čas na společnost a hlubší sblížení.</p>
            </div>
            <div className={`season-card ios-glass ${activeSeason === 'autumn' ? 'active' : ''}`} data-season="autumn" style={{ '--card-accent': 'var(--autumn)' }} onMouseEnter={() => setActiveSeason('autumn')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>🍂</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--autumn)", marginBottom: "8px" }}>Podzim (Luteální)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Energie klesá, přichází PMS. Tělo volá po zpomalení. Je čas na větší trpělivost a empatii.</p>
            </div>
            <div className={`season-card ios-glass ${activeSeason === 'winter' ? 'active' : ''}`} data-season="winter" style={{ '--card-accent': 'var(--winter)' }} onMouseEnter={() => setActiveSeason('winter')}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>❄️</span>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--winter)", marginBottom: "8px" }}>Zima (Menstruace)</h3>
              <p style={{ fontSize: "15px", color: "var(--ink-dim)", lineHeight: "1.6" }}>Energie je na minimu. Tělo potřebuje absolutní klid. Skvělý čas na termofor, čaj a odpočinek.</p>
            </div>
          </div>
        </section>

        <section style={{ marginTop: "160px", position: "relative", zIndex: 10 }}>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "16px" }}>Všechno, co potřebujete</h2>
          <p style={{ textAlign: "center", color: "var(--ink-dim)", marginBottom: "40px", fontSize: "16px" }}>Žádné složité lékařské tabulky. Jen čistá data a pochopení.</p>
          
          <div className="bento-grid">
            <div className="bento-card ios-glass wide card-radar">
              <div className="liquid-glow" style={{ width: "200px", height: "200px", top: "-50px", right: "-50px", background: "rgba(240,187,108,0.35)" }}></div>
              <div className="bento-visual">
                <div className="mini-radar"></div>
              </div>
              <div className="text-content" style={{ marginTop: "auto" }}>
                <h3>Přesný radar fází</h3>
                <p>Okamžitě vidíte, v jakém ročním období se cyklus nachází a kolik zbývá energie.</p>
              </div>
            </div>

            <div className="bento-card ios-glass tall card-graph">
              <div className="liquid-glow" style={{ width: "250px", height: "250px", bottom: "-50px", left: "50%", transform: "translateX(-50%)", background: "rgba(226,146,156,0.35)" }}></div>
              <div className="text-content">
                <h3>Trendová analýza</h3>
                <p>Aplikace se učí z dat. Zjistěte včas, jak moc stres ovlivňuje délku cyklu, a předvídejte krize dřív, než nastanou.</p>
              </div>
              <div className="bento-visual" style={{ bottom: "0", left: "32px", right: "32px" }}>
                <div className="mini-graph">
                  <div className="bar" style={{ height: "40%" }}></div>
                  <div className="bar" style={{ height: "60%" }}></div>
                  <div className="bar" style={{ height: "80%" }}></div>
                  <div className="bar active" style={{ height: "100%" }}></div>
                  <div className="bar" style={{ height: "50%" }}></div>
                </div>
              </div>
            </div>
            
            <div className="bento-card ios-glass card-journal">
              <div className="liquid-glow" style={{ width: "180px", height: "180px", top: "50%", left: "50%", marginTop: "-90px", marginLeft: "-90px", background: "rgba(159,203,164,0.3)" }}></div>
              <div className="text-content">
                <h3>Deník nálad</h3>
                <p>Chytré a rychlé zaznamenání pocitů.</p>
              </div>
              <div className="mini-tags">
                <div className="mini-tag highlight">Křeče</div>
                <div className="mini-tag">Bolest hlavy</div>
                <div className="mini-tag">Nadýmání</div>
                <div className="mini-tag">Únava</div>
                <div className="mini-tag highlight">Podrážděnost</div>
                <div className="mini-tag">Úzkost</div>
                <div className="mini-tag">Chuť na sladké</div>
              </div>
            </div>

            <div className="bento-card ios-glass">
              <div className="liquid-glow" style={{ width: "150px", height: "150px", bottom: "-20px", right: "-20px", background: "rgba(224,135,91,0.35)" }}></div>
              <div className="text-content">
                <h3 style={{ color: "var(--spring)", textShadow: "none" }}>Osobní asistent</h3>
                <p>Každý den přesně na míru: Co dělat a čemu se vyhnout pro maximální pohodu.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
