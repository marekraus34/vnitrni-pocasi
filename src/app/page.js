"use client";

import LandingPage from "@/components/LandingPage";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ================================================================
   1. SLOVNÍK A KONSTANTY
   ================================================================ */
const SYMPTOM_KEYS = ['cramps', 'headache', 'bloating', 'fatigue', 'irritability', 'anxiety', 'sugar_cravings'];
const PHASE_ACCENTS = { menstrual: '--winter', follicular: '--spring', ovulatory: '--summer', luteal: '--autumn' };
const PHASE_ENERGY_PCT = { menstrual: 18, follicular: 60, ovulatory: 95, luteal: 38 };

const I18N = {
  cs: {
    eyebrow: 'Čtyři roční období', 
    title: 'Vnitřní počasí', 
    loading: 'Načítám data...', today_btn: 'Dnes', wheel_day_label: 'Den cyklu', energy_label: 'Energie',
    forecast_heading: 'Dalších 10 dní',
    insights_summary: 'Přehledy a analýza', ins_trend_title: 'Trend délky cyklu',
    profile_summary: 'Profil a životní styl', prof_age: 'Věk', prof_activity: 'Úroveň fyzické aktivity',
    act_sedentary: 'Sedavý', act_light: 'Mírně aktivní', act_active: 'Aktivní (trénink, sport)', act_athlete: 'Sportovec / Vysoká zátěž',
    prof_pill: 'Užívá hormonální antikoncepci', journal_summary: 'Deník cyklu', j_date_label: 'Datum',
    j_rating_legend: 'Nálada (1-5)', j_sleep_legend: 'Spánek (1=špatný, 5=skvělý)', j_stress_legend: 'Stres (1=klid, 5=max)',
    j_symptoms_legend: 'Příznaky', j_note_label: 'Poznámka', journal_submit: 'Uložit zápis',
    history_summary: 'Historie cyklu', history_add_btn: 'Přidat', settings_summary: 'Systém & Účet',
    set_cycle_label: 'Délka cyklu (dny)', set_period_label: 'Menstruace (dny)', settings_submit: 'Uložit změny',
    pill_warning: 'Při hormonální antikoncepci jsou přirozené hormonální výkyvy potlačeny. Fáze berte spíše jako orientační.',
    dow_short: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    symptoms: { cramps: 'Křeče', headache: 'Bolest hlavy', bloating: 'Nadýmání', fatigue: 'Únava', irritability: 'Podrážděnost', anxiety: 'Úzkost', sugar_cravings: 'Chuť na sladké' },
    ob_h2: 'Než začneme', ob_start_label_female: 'Začátek tvé poslední menstruace', ob_start_label_partner: 'Začátek její poslední menstruace', ob_cycle_label: 'Délka cyklu (dny)', ob_period_label: 'Délka menstruace', ob_submit: 'Uložit a začít',
    
    phases: {
      menstrual: { 
        season: 'Zima', emoji: '❄️', name: 'Menstruační fáze', energy_label: 'Nízká', 
        female: {
          mood: 'Tvoje tělo zpomaluje a bere si zpátečku. Časté jsou křeče, únava a přirozená chuť stáhnout se do klidu.',
          dos_heading: 'Doporučení pro tebe',
          dos: ['Dopřej si klidný večer doma – deka, čaj, kniha nebo film.', 'Zkus termofor nebo teplou koupel k uvolnění.', 'Dovol si odpočívat, pokud to tvé tělo potřebuje.'],
          avoid_label: 'Na co si dát pozor:',
          avoid: 'Náročné fyzické výkony a příliš mnoho společenských závazků.'
        },
        partner: {
          mood: 'Její tělo zpomaluje a bere si zpátečku. Časté jsou křeče, únava a chuť stáhnout se do klidu.',
          dos_heading: 'Co pro ni dělat',
          dos: ['Navrhni klidný večer doma – deka, čaj, film.', 'Nabídni jí termofor nebo napusť teplou koupel.', 'Dej jí prostor, pokud ho chce.'],
          avoid_label: 'Vyvaruj se:',
          avoid: 'Náročné výlety a bagatelizování bolesti.'
        }
      },
      follicular: { 
        season: 'Jaro', emoji: '🌱', name: 'Folikulární fáze', energy_label: 'Stoupající', 
        female: {
          mood: 'Hormony se probouzí. Tvá nálada se přirozeně zlepšuje a roste chuť pouštět se do nových věcí.',
          dos_heading: 'Doporučení pro tebe',
          dos: ['Pusť se do nových projektů, práce ti teď půjde od ruky.', 'Plánuj výlety, dovolenou nebo společenské akce.', 'Využij rostoucí energii pro trénink.'],
          avoid_label: 'Na co si dát pozor:',
          avoid: 'Prokrastinace – tohle je tvé nejproduktivnější okno.'
        },
        partner: {
          mood: 'Hormony se probouzí. Její nálada se zlepšuje a roste chuť do nových věcí.',
          dos_heading: 'Co pro ni dělat',
          dos: ['Navrhni něco nového – výlet, sport, kurz.', 'Plánujte společné věci a dovolenou.', 'Podpoř její nápady a kreativitu.'],
          avoid_label: 'Vyvaruj se:',
          avoid: 'Nic zvláštního, užijte si skvělou náladu.'
        }
      },
      ovulatory: { 
        season: 'Léto', emoji: '☀️', name: 'Ovulační fáze', energy_label: 'Nejvyšší', 
        female: {
          mood: 'Vrchol cyklu. Tvá energie, sebevědomí i chuť na intimitu jsou aktuálně na absolutním maximu.',
          dos_heading: 'Doporučení pro tebe',
          dos: ['Vyraž do společnosti nebo si naplánuj rande.', 'Ideální čas na důležité schůzky nebo prezentace.', 'Užívej si svou sílu a sebevědomí.'],
          avoid_label: 'Na co si dát pozor:',
          avoid: 'Zbytečné sezení doma o samotě.'
        },
        partner: {
          mood: 'Vrchol cyklu. Její energie, sebevědomí a chuť na blízkost jsou na maximu.',
          dos_heading: 'Co pro ni dělat',
          dos: ['Naplánuj rande nebo společenskou akci.', 'Skvělý čas na důležité i hlubší rozhovory.', 'Dej prostor spontánnosti a intimitě.'],
          avoid_label: 'Vyvaruj se:',
          avoid: 'Přílišná rutina a stereotyp.'
        }
      },
      luteal: { 
        season: 'Podzim', emoji: '🍂', name: 'Luteální fáze', energy_label: 'Klesající', 
        female: {
          mood: 'Energie začíná klesat. Poslední dny před menstruací (PMS) mohou přinést podrážděnost, únavu nebo citlivost.',
          dos_heading: 'Doporučení pro tebe',
          dos: ['Buď k sobě laskavá, výkyvy nálad jsou hormonální, ne osobní.', 'Drž volnější režim, víc spi a omez stres.', 'Dopřej si jídlo, na které máš chuť, ale nezapomínej na živiny.'],
          avoid_label: 'Na co si dát pozor:',
          avoid: 'Dělání velkých životních rozhodnutí a vyhrocené hádky.'
        },
        partner: {
          mood: 'Energie klesá. Poslední dny (PMS) často přináší podrážděnost nebo úzkost.',
          dos_heading: 'Co pro ni dělat',
          dos: ['Buď trpělivý – výkyvy nálad nejsou o tobě.', 'Držte volnější režim bez stresu.', 'Zeptej se jí na rovinu, co právě teď potřebuje.'],
          avoid_label: 'Vyvaruj se:',
          avoid: 'Hádky o maličkosti a tlačení do akcí, na které nemá energii.'
        }
      }
    },
    ctx: {
      female: {
        high_stress: 'Zaznamenala jsi vyšší úroveň stresu. Uber dnes na nárocích a dopřej si klid.',
        bad_sleep: 'Měla jsi horší spánek. Zkus si dnes najít čas na odpočinek nebo si jít dřív lehnout.',
        active_luteal: 'Tvá fyzická síla v této fázi klesá. Podpoř tělo v regeneraci a nenapínej síly na 100 %.',
        active_follicular: 'Fyzická síla i tolerance tréninku je na vrcholu. Skvělý den na to se zapotit!',
        trend_stress: 'Tvá data naznačují, že v cyklech s vyšším stresem dochází k jejich prodlužování.',
        trend_ok: 'Tvůj cyklus vypadá stabilně a zdravě.'
      },
      partner: {
        high_stress: 'V posledních dnech zaznamenán vyšší stres. Uberte na nárocích, dej jí dnes absolutní klid.',
        bad_sleep: 'Měla horší spánek. Nabídni jí, že dnes převezmeš část jejích povinností.',
        active_luteal: 'V této fázi přirozeně klesá fyzická síla. Podpoř ji v regeneraci.',
        active_follicular: 'Fyzická síla a tolerance tréninku je teď na vrcholu. Skvělý čas na společný sport.',
        trend_stress: 'Data naznačují, že v cyklech s vyšším stresem dochází k jejich prodlužování.',
        trend_ok: 'Její cyklus vypadá stabilně.'
      }
    }
  }
};

/* ================================================================
   2. POMOCNÉ FUNKCE
   ================================================================ */
const toIso = (d) => d.toISOString().split('T')[0];
const formatDate = (d) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;

function getPhaseDayRanges(cycleLength, periodLength) {
  const pl = Math.min(periodLength, cycleLength - 3);
  const lutealLen = (cycleLength < 22) ? Math.floor(cycleLength / 2) : 14;
  const lutealStart = cycleLength - lutealLen + 1;
  const ovulatoryStart = lutealStart - 4;
  return {
    menstrual: { start: 1, end: pl },
    follicular: { start: pl + 1, end: ovulatoryStart - 1 },
    ovulatory: { start: ovulatoryStart, end: lutealStart - 1 },
    luteal: { start: lutealStart, end: cycleLength }
  };
}

function getCycleDay(dateObj, periods, cycleLength) {
  if (!periods || !periods.length) return 1;
  const asc = [...periods].sort();
  const start = new Date(asc[asc.length - 1] + 'T00:00:00');
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diff = Math.round((d - start) / 86400000);
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
}

function getPhaseKey(day, ranges) {
  if (day >= ranges.menstrual.start && day <= ranges.menstrual.end) return 'menstrual';
  if (day >= ranges.follicular.start && day <= ranges.follicular.end) return 'follicular';
  if (day >= ranges.ovulatory.start && day <= ranges.ovulatory.end) return 'ovulatory';
  return 'luteal';
}

/* ================================================================
   3. HLAVNÍ KOMPONENTA (REACT)
   ================================================================ */
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [lang] = useState("cs");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [journal, setJournal] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [openSection, setOpenSection] = useState(null);
  const [theme, setTheme] = useState("dark"); 

  const [onboardingRole, setOnboardingRole] = useState(null); 

  const [pairCodeInput, setPairCodeInput] = useState("");
  const [pairError, setPairError] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);

  const [jMood, setJMood] = useState(null);
  const [jSleep, setJSleep] = useState(null);
  const [jStress, setJStress] = useState(null);
  const [jSymptoms, setJSymptoms] = useState([]);
  const [jNote, setJNote] = useState("");
  const [newPeriodDate, setNewPeriodDate] = useState("");

  const t = (key) => I18N[lang][key];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", theme === 'light' ? '#f2f2f7' : '#09070b');
  }, [theme]);

  useEffect(() => {
    if (status === "authenticated") {
      localStorage.setItem("lastUserEmail", session.user.email);
       fetch("/api/user")
        .then(res => res.json())
        .then(data => {
          if (data.settings) setSettings(data.settings);
          if (data.journal) setJournal(data.journal);
          setLoading(false);
        });
    }
  }, [status, router]);

  const syncData = async (newSettings, newJournal) => {
    setSettings(newSettings);
    if (newJournal) setJournal(newJournal);
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: newSettings, journal: newJournal })
    });
  };

  const handleOnboarding = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newSettings = {
      role: onboardingRole,
      periods: [fd.get('start')],
      cycleLength: parseInt(fd.get('cycle')),
      periodLength: parseInt(fd.get('period')),
      age: fd.get('age') || null,
      activity: fd.get('activity') || 'light',
      contraception: fd.get('pill') === 'on'
    };
    syncData(newSettings, journal);
  };

  const handleSystemSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    syncData({
      ...settings,
      cycleLength: parseInt(fd.get('cycleLength')),
      periodLength: parseInt(fd.get('periodLength'))
    }, journal);
  };

  const handleGenerateSyncCode = async () => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'generate_code' })
      });
      const data = await res.json();
      if (res.ok) setSettings(data.settings);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePairAccount = async () => {
    setPairError("");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'pair', code: pairCodeInput })
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setPairCodeInput("");
      } else {
        setPairError(data.message || "Neplatný kód.");
      }
    } catch (err) {
      setPairError("Chyba připojení.");
    }
  };

  // PŘIDÁNO: Odpojení účtů
  const handleUnpairAccount = async () => {
    if (!window.confirm("Opravdu chcete zrušit propojení vašich radarů? Oba účty budou navzájem odpojeny.")) return;
    
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'unpair' })
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Chyba při odpojování:", err);
    }
  };

  const handleAddPeriod = (e) => {
    e.preventDefault();
    if (!newPeriodDate || settings.periods.includes(newPeriodDate)) return;
    syncData({ ...settings, periods: [...settings.periods, newPeriodDate] }, journal);
    setNewPeriodDate("");
  };

  const handleSaveJournal = (e) => {
    e.preventDefault();
    const dateStr = toIso(selectedDate);
    const entry = { date: dateStr, mood: jMood, sleep: jSleep, stress: jStress, symptoms: jSymptoms, note: jNote };
    const newJournal = [...journal.filter(j => j.date !== dateStr), entry];
    syncData(settings, newJournal);
    setJMood(null); setJSleep(null); setJStress(null); setJSymptoms([]); setJNote("");
  };

  const toggleSection = (sectionId) => {
    if (openSection === sectionId) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionId);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  };

  if (status === "loading") return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)", background: "var(--bg)" }}>Načítám...</div>;
  if (status === "unauthenticated") return <LandingPage />;
  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)", background: "var(--bg)" }}>Načítám data...</div>;
  if (!session) return null;

  if (!settings || !settings.periods || settings.periods.length === 0) {
    return (
      <div className="app-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --bg: #09070b; --ink: #ffffff; --ink-dim: rgba(255,255,255,0.7); }
          html[data-theme="light"] { --bg: #f2f2f7; --ink: #111111; --ink-dim: rgba(0,0,0,0.6); }
          body { background-color: var(--bg) !important; color: var(--ink) !important; margin: 0; padding: 0; transition: background-color 0.5s ease; }
          .app-wrapper { min-height: 100vh; padding: 40px 18px; display: flex; align-items: center; justify-content: center; }
          .ios-glass { 
            background: rgba(15, 15, 15, 0.45); backdrop-filter: blur(48px) saturate(200%); -webkit-backdrop-filter: blur(48px) saturate(200%); 
            border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); border-radius: 32px; padding: 40px; width: 100%; max-width: 500px; 
            -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); -webkit-backface-visibility: hidden; backface-visibility: hidden;
          }
          html[data-theme="light"] .ios-glass { background: rgba(255, 255, 255, 0.65); border: 1px solid rgba(0,0,0,0.05); }
          .field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
          .field span { font-size: 13px; color: var(--ink-dim); text-transform: uppercase; letter-spacing: 1px; }
          input, select { background: rgba(120,120,120,0.1); border: 1px solid rgba(120,120,120,0.2); padding: 14px; border-radius: 16px; color: inherit; font-size: 16px; outline: none; transition: border 0.3s; }
          .btn-primary { background: var(--ink); color: var(--bg); padding: 16px; border-radius: 99px; font-weight: 600; font-size: 16px; width: 100%; border: none; cursor: pointer; transition: transform 0.2s; }
          
          .role-card { background: rgba(120,120,120,0.1); border: 1px solid rgba(120,120,120,0.2); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); margin-bottom: 16px; }
          .role-card:hover { transform: scale(1.02); background: rgba(120,120,120,0.15); border-color: rgba(255,255,255,0.4); }
          .role-icon { font-size: 40px; line-height: 1; }
          .role-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; }
          .role-desc { font-size: 14px; color: var(--ink-dim); line-height: 1.4; }
          .btn-back { background: none; border: none; color: var(--ink-dim); font-size: 14px; padding: 0; cursor: pointer; text-decoration: underline; margin-bottom: 24px; display: inline-block; }
        `}} />

        <div className="ios-glass">
          {!onboardingRole ? (
            <>
              <h2 style={{ fontSize: "28px", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Vítej uvnitř</h2>
              <p style={{ color: "var(--ink-dim)", marginBottom: "32px", fontSize: "15px", lineHeight: 1.5 }}>
                Aby se ti radar dokonale přizpůsobil, řekni nám, jak ho chceš používat.
              </p>

              <div className="role-card" onClick={() => setOnboardingRole('female')}>
                <div className="role-icon">👩‍🦰</div>
                <div className="role-title">Žena</div>
                <div className="role-desc">Chci sledovat svůj vlastní cyklus, zapisovat si nálady a lépe rozumět svému tělu.</div>
              </div>

              <div className="role-card" onClick={() => setOnboardingRole('partner')}>
                <div className="role-icon">👨‍🦱</div>
                <div className="role-title">Muž</div>
                <div className="role-desc">Chci sledovat cyklus své partnerky a vědět, jak jí daný den můžu nejlépe podpořit.</div>
              </div>
            </>
          ) : (
            <>
              <button className="btn-back" onClick={() => setOnboardingRole(null)}>‹ Zpět na výběr</button>
              <h2 style={{ fontSize: "28px", marginBottom: "8px", fontFamily: "var(--font-display)" }}>
                {onboardingRole === 'female' ? "Tvé údaje" : "Její údaje"}
              </h2>
              <p style={{ color: "var(--ink-dim)", marginBottom: "32px", fontSize: "15px" }}>
                {onboardingRole === 'female' 
                  ? "Vyplň základní parametry pro kalibraci tvého osobního radaru." 
                  : "Vyplň její základní parametry, aby ti radar mohl radit co nejpřesněji."}
              </p>
              
              <form onSubmit={handleOnboarding}>
                <label className="field">
                  <span>{onboardingRole === 'female' ? t('ob_start_label_female') : t('ob_start_label_partner')}</span>
                  <input type="date" name="start" required />
                </label>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <label className="field" style={{ flex: "1 1 120px" }}><span>{t('ob_cycle_label')}</span><input type="number" name="cycle" defaultValue="28" required /></label>
                  <label className="field" style={{ flex: "1 1 120px" }}><span>{t('ob_period_label')}</span><input type="number" name="period" defaultValue="5" required /></label>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: "16px" }}>Vstoupit do aplikace</button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  const currentRole = settings.role || 'female';
  const ranges = getPhaseDayRanges(settings.cycleLength, settings.periodLength);
  const currentDay = getCycleDay(selectedDate, settings.periods, settings.cycleLength);
  const phaseKey = getPhaseKey(currentDay, ranges);
  
  const phaseGeneral = I18N[lang].phases[phaseKey];
  const roleSpecificData = phaseGeneral[currentRole]; 
  const roleCtxTips = I18N[lang].ctx[currentRole];

  const getGradientColors = (phase) => {
    switch (phase) {
      case 'winter': return { c1: '#E2929C', c2: '#6B4C9A', c3: '#2B3A67' };
      case 'spring': return { c1: '#9FCBA4', c2: '#5C8A69', c3: '#185A63' };
      case 'summer': return { c1: '#F0BB6C', c2: '#E25B5B', c3: '#8E1E4F' };
      case 'autumn': return { c1: '#E0875B', c2: '#A64B2A', c3: '#5C2A3A' };
      default: return { c1: '#E2929C', c2: '#F0BB6C', c3: '#5C8A69' };
    }
  };
  const colors = getGradientColors(phaseKey);

  const circ = 2 * Math.PI * 88;
  const wheelSegments = [['menstrual', ranges.menstrual], ['follicular', ranges.follicular], ['ovulatory', ranges.ovulatory], ['luteal', ranges.luteal]].map(p => {
    const len = (p[1].end - p[1].start + 1) / settings.cycleLength;
    const dashBefore = ((p[1].start - 1) / settings.cycleLength) * circ;
    const dashLen = len * circ;
    const dashAfter = Math.max(0, circ - dashBefore - dashLen);
    return <circle key={p[0]} cx="120" cy="120" r="88" fill="none" strokeWidth="24" stroke={`var(${PHASE_ACCENTS[p[0]]})`} strokeDasharray={`0 ${dashBefore} ${dashLen} ${dashAfter}`} style={{ transition: 'stroke 0.3s' }} />;
  });
  const markerAngle = ((currentDay - 0.5) / settings.cycleLength) * 2 * Math.PI;

  const recentEntries = journal.filter(e => {
    const diff = (selectedDate.getTime() - new Date(e.date + 'T00:00:00').getTime()) / 86400000;
    return diff >= 0 && diff <= 2;
  });
  
  const ctxTips = [];
  if (recentEntries.some(e => e.stress >= 4)) ctxTips.push(roleCtxTips.high_stress);
  if (recentEntries.some(e => e.sleep <= 2)) ctxTips.push(roleCtxTips.bad_sleep);
  
  const ascPeriods = [...settings.periods].sort();

  const RatingRow = ({ label, val, setter }) => (
    <fieldset style={{ border: "none", margin: "0 0 20px 0", padding: 0 }}>
      <legend style={{ fontSize: "13px", color: "var(--ink-dim)", textTransform: "uppercase", marginBottom: "8px" }}>{label}</legend>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} type="button" onClick={() => setter(v)} style={{ flex: 1, minWidth: "40px", padding: "12px 0", borderRadius: "12px", background: val === v ? "var(--summer)" : "var(--input-bg)", color: val === v ? "#000" : "var(--ink)", border: "1px solid var(--input-border)", fontWeight: val === v ? "bold" : "normal", cursor: "pointer", transition: "all 0.2s" }}>
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="app-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --winter: #E2929C; --spring: #9FCBA4; --summer: #F0BB6C; --autumn: #E0875B;
          --bg: #09070b; --ink: #ffffff; --ink-dim: rgba(255,255,255,0.6); --surface-2: rgba(255,255,255,0.05);
          --glass-bg: rgba(30, 25, 34, 0.45); --glass-border: rgba(255, 255, 255, 0.08); --glass-border-top: rgba(255, 255, 255, 0.25); --glass-border-left: rgba(255, 255, 255, 0.15);
          --glass-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);
          --input-bg: rgba(255,255,255,0.08); --input-border: rgba(255,255,255,0.15); --btn-bg: #fff; --btn-text: #000; --mesh-op: 0.65; --card-pad: 32px;
        }

        html[data-theme="light"] {
          --bg: #f2f2f7; --ink: #111111; --ink-dim: rgba(0,0,0,0.5); --surface-2: rgba(0,0,0,0.05);
          --glass-bg: rgba(255, 255, 255, 0.65); --glass-border: rgba(0, 0, 0, 0.05); --glass-border-top: rgba(255, 255, 255, 0.8); --glass-border-left: rgba(255, 255, 255, 0.5);
          --glass-shadow: 0 20px 40px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,1);
          --input-bg: rgba(0,0,0,0.04); --input-border: rgba(0,0,0,0.1); --btn-bg: #111; --btn-text: #fff; --mesh-op: 0.4;
        }

        body { background-color: var(--bg) !important; color: var(--ink) !important; margin: 0; padding: 0; transition: background-color 0.5s ease; }
        .app-wrapper { position: relative; min-height: 100vh; overflow-x: hidden; padding-top: 100px; padding-bottom: 120px; }
        h1, h2, h3, p, span, li, legend { color: inherit; }

        .mesh-background { position: fixed; inset: -20%; z-index: -3; background: var(--bg); transition: background 0.5s ease; -webkit-transform: translate3d(0,0,0); transform: translate3d(0,0,0); }
        .mesh-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: var(--mesh-op); transition: background 2s ease, opacity 0.5s ease; pointer-events: none; will-change: transform; }
        .orb-1 { width: 70%; height: 60%; top: 0; left: 0; animation: float1 14s infinite alternate ease-in-out; }
        .orb-2 { width: 60%; height: 70%; top: 20%; right: 0; animation: float2 18s infinite alternate-reverse ease-in-out; }
        .orb-3 { width: 80%; height: 60%; bottom: 0; left: 10%; animation: float3 22s infinite alternate ease-in-out; }

        @keyframes float1 { 0% { transform: translate3d(0, 0, 0) scale(1); } 100% { transform: translate3d(5%, 5%, 0) scale(1.1); } }
        @keyframes float2 { 0% { transform: translate3d(0, 0, 0) scale(1); } 100% { transform: translate3d(-5%, 5%, 0) scale(1.15); } }
        @keyframes float3 { 0% { transform: translate3d(0, 0, 0) scale(1); } 100% { transform: translate3d(5%, -5%, 0) scale(1.2); } }

        .noise-overlay {
          position: fixed; inset: 0; z-index: -2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05; pointer-events: none; -webkit-transform: translate3d(0,0,0); transform: translate3d(0,0,0);
        }

        .ios-glass {
          background: var(--glass-bg); backdrop-filter: blur(48px) saturate(200%); -webkit-backdrop-filter: blur(48px) saturate(200%);
          border: 1px solid var(--glass-border); border-top: 1px solid var(--glass-border-top); border-left: 1px solid var(--glass-border-left);
          box-shadow: var(--glass-shadow); border-radius: 32px; position: relative; overflow: hidden;
          transition: background 0.5s ease, border 0.5s ease, box-shadow 0.5s ease;
          -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); -webkit-backface-visibility: hidden; backface-visibility: hidden;
        }

        .glass-nav {
          position: fixed; top: 16px; left: 50%; width: calc(100% - 32px); max-width: 600px;
          height: 64px; border-radius: 99px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px 0 16px; z-index: 100;
          transform: translateX(-50%) translateZ(0); -webkit-transform: translateX(-50%) translateZ(0);
        }

        .nav-badge { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--input-border); }
        .nav-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .glass-btn { background: var(--surface-2); border: 1px solid var(--input-border); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--ink); font-size: 18px; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(10px); flex-shrink: 0; }
        .glass-btn:hover { background: var(--input-border); transform: translateY(-2px); }

        .main-container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; padding: 0 16px; position: relative; z-index: 1; }
        .liquid-glow { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; opacity: 0.3; pointer-events: none; }
        html[data-theme="light"] .liquid-glow { opacity: 0.6; filter: blur(40px); }
        .glass-content { position: relative; z-index: 2; padding: var(--card-pad); }

        input[type="date"] { -webkit-appearance: none; appearance: none; min-height: 52px; line-height: normal; text-align: center; color: var(--ink); }
        .glass-date-pill { background: var(--input-bg); border: 1px solid var(--input-border); color: var(--ink); padding: 10px 20px; border-radius: 99px; font-family: inherit; font-size: 15px; font-weight: 500; outline: none; cursor: pointer; transition: border 0.3s; }
        .glass-date-pill:focus { border-color: var(--ink-dim); }
        
        ::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(1); }
        html[data-theme="light"] ::-webkit-calendar-picker-indicator { filter: invert(0); }

        input:not(.glass-date-pill), select, textarea { background: var(--input-bg); border: 1px solid var(--input-border); padding: 14px; border-radius: 16px; color: var(--ink); font-size: 16px; outline: none; width: 100%; transition: border 0.3s; box-sizing: border-box; }
        input:focus:not(.glass-date-pill), select:focus, textarea:focus { border-color: var(--ink-dim); }
        
        /* PIN INPUT STYL PRO PÁROVÁNÍ */
        .pin-input { font-family: var(--font-mono); font-size: 28px !important; letter-spacing: 0.3em; text-align: center; font-weight: bold; text-transform: uppercase; }
        .pin-input::placeholder { font-weight: normal; letter-spacing: 0.1em; opacity: 0.4; }

        .field span { display: block; font-size: 13px; color: var(--ink-dim); text-transform: uppercase; margin-bottom: 8px; }
        .btn-primary { background: var(--btn-bg); color: var(--btn-text); padding: 16px; border-radius: 99px; font-weight: 600; font-size: 16px; width: 100%; border: none; cursor: pointer; transition: transform 0.2s; }
        .btn-primary:hover { transform: scale(1.02); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .emoji-icon { font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif; line-height: normal; display: inline-flex; align-items: center; justify-content: center; padding-bottom: 2px; }

        section.accordion-wrapper { scroll-margin-top: 100px; }
        .accordion-header { padding: var(--card-pad); cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; position: relative; z-index: 3; }
        .accordion-title { font-family: var(--font-display); font-size: 22px; color: var(--ink); display: flex; align-items: center; padding-left: 12px; }
        
        .chevron { font-size: 28px; font-weight: 300; transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); margin-right: 16px; }
        .chevron.open { transform: rotate(45deg); }
        
        .accordion-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .accordion-body.open { grid-template-rows: 1fr; border-top: 1px solid var(--input-border); }
        .accordion-content-inner { overflow: hidden; }

        .forecast-strip { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
        .forecast-chip { min-width: 70px; display: flex; flex-direction: column; align-items: center; padding: 16px 12px; border-radius: 20px; background: var(--surface-2); border: 1px solid var(--input-border); cursor: pointer; transition: transform 0.2s; }
        .forecast-chip.active { background: var(--accent); color: #000; border: none; font-weight: 600; }
        .forecast-chip:hover:not(.active) { background: var(--input-border); }

        @media (max-width: 600px) {
          :root { --card-pad: 24px; }
          .glass-nav { padding: 0 12px; }
          .glass-date-pill { padding: 10px 12px; font-size: 14px; }
          h2 { font-size: 26px !important; }
          .nav-brand-text { display: none !important; }
          .forecast-chip { min-width: 52px; padding: 10px 6px; border-radius: 14px; }
          .forecast-chip > span:nth-child(1) { font-size: 10px !important; }
          .forecast-chip > span:nth-child(2) { font-size: 15px !important; margin: 2px 0 !important; }
          .forecast-chip > span:nth-child(3) { width: 4px !important; height: 4px !important; }
        }
      `}} />

      <div className="mesh-background">
        <div className="mesh-orb orb-1" style={{ background: colors.c1 }}></div>
        <div className="mesh-orb orb-2" style={{ background: colors.c2 }}></div>
        <div className="mesh-orb orb-3" style={{ background: colors.c3 }}></div>
      </div>
      <div className="noise-overlay"></div>

      {/* MODÁLNÍ OKNO PRO QR KÓD */}
      {showQRModal && (
        <div 
          style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} 
          onClick={() => setShowQRModal(false)}
        >
          <div className="ios-glass" style={{ padding: "40px 24px", textAlign: "center", width: "100%", maxWidth: "340px", background: "rgba(30,30,30,0.8)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "8px", fontFamily: "var(--font-display)", fontSize: "24px", color: "#fff" }}>Naskenuj mě</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "24px" }}>Ať si tvá drahá polovička zapne foťák.</p>
            
            <div style={{ background: "#fff", padding: "16px", borderRadius: "24px", display: "inline-block", marginBottom: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${settings.syncCode}&margin=0`} alt="QR kód" style={{ display: "block", borderRadius: "8px" }} />
            </div>
            
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>Nebo zadejte kód:<br/><strong style={{ color: "#fff", letterSpacing: "2px" }}>{settings.syncCode}</strong></p>
            
            <button className="btn-primary" onClick={() => setShowQRModal(false)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>Zavřít</button>
          </div>
        </div>
      )}

      <nav className="glass-nav ios-glass">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', outline: 'none' }}
          >
            <span className="emoji-icon" style={{ fontSize: "22px" }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
          </button>
          <span className="nav-brand-text" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "18px", marginLeft: "8px" }}>Vnitřní počasí</span>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginLeft: "auto" }}>
          <div className="nav-badge" onClick={() => document.getElementById('top-radar').scrollIntoView({behavior: 'smooth'})} style={{cursor: 'pointer'}}>
            <span className="nav-dot" style={{ background: `var(${PHASE_ACCENTS[phaseKey]})`, boxShadow: `0 0 10px var(${PHASE_ACCENTS[phaseKey]})` }}></span>
            <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="emoji-icon" style={{ fontSize: "15px" }}>{phaseGeneral.emoji}</span> 
              <span style={{ paddingTop: "1px" }}>{currentDay}. den</span>
            </span>
          </div>
          <button className="glass-btn" onClick={() => toggleSection('journal')}>
            <span style={{ position: "relative", top: "-1px", left: "1px" }}>➕</span>
          </button>
          <button className="glass-btn" onClick={() => toggleSection('settings')}>⚙️</button>
        </div>
      </nav>

      <div className="main-container">

        <section id="top-radar" className="ios-glass" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div className="liquid-glow" style={{ width: "250px", height: "250px", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: `var(${PHASE_ACCENTS[phaseKey]})` }}></div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <button className="glass-btn" onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}>‹</button>
              <input type="date" value={toIso(selectedDate)} onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))} className="glass-date-pill" />
              <button className="glass-btn" onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}>›</button>
            </div>

            <div style={{ position: "relative", width: "240px", height: "240px", margin: "0 auto" }}>
              <svg viewBox="0 0 240 240" style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" }}>
                <g transform="rotate(-90 120 120)">
                  {wheelSegments}
                  <circle cx={120 + 88 * Math.cos(markerAngle)} cy={120 + 88 * Math.sin(markerAngle)} r="12" fill="var(--bg)" strokeWidth="4" stroke={`var(${PHASE_ACCENTS[phaseKey]})`} style={{ transition: 'all 0.5s' }} />
                </g>
              </svg>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--ink-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>{t('wheel_day_label')}</span>
                <span style={{ fontSize: "48px", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1 }}>{currentDay}</span>
                <span style={{ fontSize: "14px", color: `var(${PHASE_ACCENTS[phaseKey]})`, fontWeight: 600, marginTop: "4px" }}>{phaseGeneral.season}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ios-glass">
          <div className="glass-content">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", marginBottom: "8px" }}>{phaseGeneral.name}</h2>
            <p style={{ fontSize: "16px", color: "var(--ink)", opacity: 0.8, lineHeight: 1.6, marginBottom: "24px" }}>
              {roleSpecificData.mood}
            </p>
            
            <div style={{ background: "var(--surface-2)", borderRadius: "20px", padding: "20px", marginBottom: "24px", border: "1px solid var(--input-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
                <span style={{ color: "var(--ink-dim)" }}>{t('energy_label')}</span>
                <span style={{ fontWeight: 600, color: `var(${PHASE_ACCENTS[phaseKey]})` }}>{phaseGeneral.energy_label}</span>
              </div>
              <div style={{ height: "6px", background: "var(--input-border)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${PHASE_ENERGY_PCT[phaseKey]}%`, background: `var(${PHASE_ACCENTS[phaseKey]})`, borderRadius: "99px", transition: "width 1s cubic-bezier(0.2, 0.8, 0.2, 1)" }}></div>
              </div>
            </div>

            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>{roleSpecificData.dos_heading}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
              {ctxTips.map((tip, i) => <li key={`ctx-${i}`} style={{ background: "var(--surface-2)", padding: "12px 16px", borderRadius: "12px", fontSize: "15px", borderLeft: "3px solid var(--summer)" }}>{tip}</li>)}
              {roleSpecificData.dos.map((tip, i) => <li key={`dos-${i}`} style={{ background: "var(--surface-2)", padding: "12px 16px", borderRadius: "12px", fontSize: "15px" }}>{tip}</li>)}
            </ul>

            <div style={{ background: "rgba(226,146,156,0.1)", border: "1px solid rgba(226,146,156,0.2)", padding: "16px", borderRadius: "16px", color: "var(--ink)", fontSize: "15px" }}>
              <strong style={{ color: "var(--winter)" }}>{roleSpecificData.avoid_label}</strong> {roleSpecificData.avoid}
            </div>
          </div>
        </section>

        <section className="ios-glass">
          <div className="glass-content">
            <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>{t('forecast_heading')}</h3>
            <div className="forecast-strip">
              {Array.from({ length: 10 }).map((_, i) => {
                const d = new Date(selectedDate); d.setDate(d.getDate() + i);
                const fDay = getCycleDay(d, settings.periods, settings.cycleLength);
                const fPk = getPhaseKey(fDay, ranges);
                return (
                  <div key={i} className={`forecast-chip ${i === 0 ? 'active' : ''}`} style={{ '--accent': `var(${PHASE_ACCENTS[fPk]})` }} onClick={() => setSelectedDate(d)}>
                    <span style={{ fontSize: "12px", textTransform: "uppercase", opacity: i === 0 ? 1 : 0.6 }}>{t('dow_short')[d.getDay()]}</span>
                    <span style={{ fontSize: "18px", fontWeight: 600, margin: "4px 0" }}>{d.getDate()}.</span>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === 0 ? "var(--btn-bg)" : `var(${PHASE_ACCENTS[fPk]})` }}></span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="journal" className="ios-glass accordion-wrapper">
          <div className="accordion-header" onClick={() => toggleSection('journal')}>
            <div className="accordion-title">
              <span className="emoji-icon" style={{ marginRight: '14px', fontSize: '24px' }}>📝</span>
              {t('journal_summary')}
            </div>
            <span className={`chevron ${openSection === 'journal' ? 'open' : ''}`}>+</span>
          </div>
          
          <div className={`accordion-body ${openSection === 'journal' ? 'open' : ''}`}>
            <div className="accordion-content-inner glass-content" style={{ paddingTop: "24px" }}>
              <form onSubmit={handleSaveJournal}>
                <label className="field" style={{ marginBottom: "24px" }}>
                  <span>{t('j_date_label')}</span>
                  <input type="date" value={toIso(selectedDate)} onChange={e => e.target.value && setSelectedDate(new Date(e.target.value))} required />
                </label>

                <RatingRow label={t('j_rating_legend')} val={jMood} setter={setJMood} />
                <RatingRow label={t('j_sleep_legend')} val={jSleep} setter={setJSleep} />
                <RatingRow label={t('j_stress_legend')} val={jStress} setter={setJStress} />
                
                <div style={{ marginBottom: "24px" }}>
                  <span style={{ display: "block", fontSize: "13px", color: "var(--ink-dim)", textTransform: "uppercase", marginBottom: "12px" }}>{t('j_symptoms_legend')}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {SYMPTOM_KEYS.map(k => (
                      <button key={k} type="button" onClick={() => setJSymptoms(jSymptoms.includes(k) ? jSymptoms.filter(x => x !== k) : [...jSymptoms, k])} style={{ background: jSymptoms.includes(k) ? "var(--winter)" : "var(--input-bg)", color: jSymptoms.includes(k) ? "#000" : "var(--ink)", border: "1px solid var(--input-border)", padding: "8px 16px", borderRadius: "99px", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}>
                        {t('symptoms')[k] || k}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="field">
                  <span>{t('j_note_label')}</span>
                  <textarea rows="3" value={jNote} onChange={e => setJNote(e.target.value)}></textarea>
                </label>
                
                <button type="submit" className="btn-primary" style={{ marginTop: "8px" }}>{t('journal_submit')}</button>
              </form>

              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[...journal].sort((a,b) => a.date < b.date ? 1 : -1).map(j => (
                  <div key={j.date} style={{ background: "var(--surface-2)", padding: "16px", borderRadius: "16px", border: "1px solid var(--input-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600 }}>{formatDate(new Date(j.date))}</span>
                      <button type="button" onClick={() => syncData(settings, journal.filter(x => x.date !== j.date))} style={{ background: "none", border: "none", color: "var(--ink-dim)", fontSize: "20px", cursor: "pointer" }}>×</button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {j.mood && <span style={{ fontSize: "12px", background: "var(--input-bg)", border: "1px solid var(--input-border)", padding: "4px 8px", borderRadius: "6px" }}>Nálada: {j.mood}</span>}
                      {j.stress >= 4 && <span style={{ fontSize: "12px", background: "rgba(226,146,156,0.2)", color: "var(--winter)", padding: "4px 8px", borderRadius: "6px" }}>Vysoký stres</span>}
                    </div>
                    {j.note && <p style={{ fontSize: "14px", color: "var(--ink)", opacity: 0.8, marginTop: "12px", marginBottom: 0 }}>{j.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="settings" className="ios-glass accordion-wrapper">
          <div className="accordion-header" onClick={() => toggleSection('settings')}>
            <div className="accordion-title">
              <span className="emoji-icon" style={{ marginRight: '14px', fontSize: '24px' }}>⚙️</span>
              {t('settings_summary')}
            </div>
            <span className={`chevron ${openSection === 'settings' ? 'open' : ''}`}>+</span>
          </div>

          <div className={`accordion-body ${openSection === 'settings' ? 'open' : ''}`}>
            <div className="accordion-content-inner glass-content" style={{ paddingTop: "24px" }}>
              
              {/* === UNIVERZÁLNÍ SEKCE PRO PÁROVÁNÍ ÚČTŮ (PRO OBA) === */}
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Propojení radarů</h3>
              
              {settings.pairedWith ? (
                // Zobrazení po úspěšném propojení s možností ODPOJENÍ
                <div style={{ background: "var(--surface-2)", borderRadius: "24px", padding: "24px", textAlign: "center", border: "1px solid var(--spring)", marginBottom: "32px" }}>
                  <span className="emoji-icon" style={{ fontSize: "32px", marginBottom: "12px" }}>❤️</span>
                  <h4 style={{ margin: "0 0 8px 0", color: "var(--spring)", fontSize: "18px" }}>Úspěšně propojeno</h4>
                  <p style={{ fontSize: "14px", color: "var(--ink-dim)", margin: "0 0 20px 0" }}>Váš radar sdílí data s:<br/><strong style={{color: "var(--ink)"}}>{settings.pairedWith}</strong></p>
                  
                  <button type="button" onClick={handleUnpairAccount} style={{ background: "transparent", border: "1px solid var(--winter)", color: "var(--winter)", padding: "8px 16px", borderRadius: "99px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}>
                    Zrušit propojení
                  </button>
                </div>
              ) : (
                // Otevřená možnost propojení pro každého (Zadání kódu i Ukázání kódu)
                <div style={{ background: "var(--surface-2)", borderRadius: "24px", padding: "24px", textAlign: "center", border: "1px solid var(--input-border)", marginBottom: "32px" }}>
                  
                  {/* ZADÁNÍ KÓDU */}
                  <p style={{ fontSize: "14px", color: "var(--ink-dim)", marginBottom: "16px", lineHeight: 1.5 }}>
                    Zadejte 6místný kód z druhé aplikace pro okamžité propojení.
                  </p>
                  <input 
                    type="text" 
                    value={pairCodeInput} 
                    onChange={e => setPairCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="X Y Z 1 2 3"
                    className="pin-input"
                    style={{ background: "var(--bg)", border: "1px solid var(--input-border)", borderRadius: "16px", padding: "16px", width: "100%", marginBottom: "16px", color: "var(--ink)" }}
                  />
                  <button type="button" onClick={handlePairAccount} disabled={pairCodeInput.length < 6} className="btn-primary" style={{ background: "var(--summer)", color: "#000", marginBottom: "16px" }}>
                    Propojit účty
                  </button>
                  {pairError && <p style={{ color: "var(--winter)", fontSize: "13px", marginTop: "-4px", marginBottom: "16px", fontWeight: "bold" }}>{pairError}</p>}

                  <div style={{ margin: "24px 0", color: "var(--ink-dim)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px" }}>
                    — nebo —
                  </div>

                  {/* ZOBRAZENÍ KÓDU / QR */}
                  {settings.syncCode ? (
                    <>
                      <p style={{ fontSize: "14px", color: "var(--ink-dim)", marginBottom: "16px" }}>Ukažte svůj kód pro naskenování:</p>
                      <div style={{ fontSize: "32px", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", fontWeight: "bold", background: "var(--bg)", padding: "16px", borderRadius: "16px", marginBottom: "16px", color: "var(--spring)" }}>
                        {settings.syncCode}
                      </div>
                      <button type="button" onClick={() => setShowQRModal(true)} className="glass-btn" style={{ width: "auto", padding: "0 24px", borderRadius: "99px", margin: "0 auto" }}>
                        <span style={{ fontSize: "15px", marginRight: "8px" }}>📷</span> Ukázat QR kód
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={handleGenerateSyncCode} className="btn-primary" style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--input-border)" }}>
                      Vygenerovat můj kód
                    </button>
                  )}
                </div>
              )}
              {/* ======================================= */}

              <h3 style={{ fontSize: "18px", marginBottom: "16px", paddingTop: "16px", borderTop: "1px solid var(--input-border)" }}>Parametry cyklu</h3>
              <form onSubmit={handleSystemSave} style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('set_cycle_label')}</span><input type="number" name="cycleLength" defaultValue={settings.cycleLength} required /></label>
                  <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('set_period_label')}</span><input type="number" name="periodLength" defaultValue={settings.periodLength} required /></label>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "12px", fontSize: "15px" }}>{t('settings_submit')}</button>
              </form>

              <h3 style={{ fontSize: "18px", marginBottom: "16px", paddingTop: "24px", borderTop: "1px solid var(--input-border)" }}>{t('history_summary')}</h3>
              <form onSubmit={handleAddPeriod} style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <input type="date" value={newPeriodDate} onChange={e => setNewPeriodDate(e.target.value)} required style={{ flex: "1 1 200px" }} />
                <button type="submit" className="btn-primary" style={{ flex: "0 0 auto", width: "auto", padding: "0 24px" }}>{t('history_add_btn')}</button>
              </form>
              
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {ascPeriods.reverse().map(p => (
                  <li key={p} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--surface-2)" }}>
                    <span>{formatDate(new Date(p))}</span>
                    <button type="button" onClick={() => syncData({ ...settings, periods: settings.periods.filter(x => x !== p) }, journal)} style={{ background: "none", border: "none", color: "var(--autumn)", fontSize: "16px", cursor: "pointer" }}>Smazat</button>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--input-border)", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "var(--ink-dim)", marginBottom: "16px" }}>Přihlášen jako: {session.user.email}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button onClick={() => signOut()} style={{ background: "var(--surface-2)", border: "1px solid var(--input-border)", color: "var(--ink)", padding: "14px", borderRadius: "16px", fontSize: "15px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                    Odhlásit (Nechat e-mail v paměti)
                  </button>
                  <button onClick={() => { localStorage.removeItem("lastUserEmail"); signOut(); }} style={{ background: "rgba(226,146,156,0.15)", border: "1px solid rgba(226,146,156,0.3)", color: "var(--winter)", padding: "14px", borderRadius: "16px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                    Odhlásit a zapomenout účet
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
