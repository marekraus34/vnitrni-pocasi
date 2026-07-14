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
    eyebrow: 'Čtyři roční období', title: 'Vnitřní počasí', subtitle: 'Pohled na to, v jaké je fázi – a jak jí dnes můžeš usnadnit den.',
    loading: 'Načítám data...', today_btn: 'Dnes', wheel_day_label: 'Den cyklu', energy_label: 'Energie',
    dos_heading: 'Co dělat', avoid_label: 'Vyvaruj se:', forecast_heading: 'Dalších 10 dní',
    insights_summary: 'Přehledy a analýza', ins_trend_title: 'Trend délky cyklu',
    profile_summary: 'Profil a životní styl', prof_age: 'Věk', prof_activity: 'Úroveň fyzické aktivity',
    act_sedentary: 'Sedavý', act_light: 'Mírně aktivní', act_active: 'Aktivní (trénink, sport)', act_athlete: 'Sportovec / Vysoká zátěž',
    prof_pill: 'Užívá hormonální antikoncepci', journal_summary: 'Deník nálad', j_date_label: 'Datum',
    j_rating_legend: 'Nálada (1-5)', j_sleep_legend: 'Spánek (1=špatný, 5=skvělý)', j_stress_legend: 'Stres (1=klid, 5=max)',
    j_symptoms_legend: 'Příznaky', j_note_label: 'Poznámka', journal_submit: 'Uložit zápis',
    history_summary: 'Historie cyklu', history_add_btn: 'Přidat', settings_summary: 'Systém & Účet',
    set_cycle_label: 'Délka cyklu (dny)', set_period_label: 'Menstruace (dny)', settings_submit: 'Uložit změny',
    pill_warning: 'Při hormonální antikoncepci jsou přirozené hormonální výkyvy potlačeny. Fáze berte spíše jako orientační.',
    dow_short: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    symptoms: { cramps: 'Křeče', headache: 'Bolest hlavy', bloating: 'Nadýmání', fatigue: 'Únava', irritability: 'Podrážděnost', anxiety: 'Úzkost', sugar_cravings: 'Chuť na sladké' },
    ob_h2: 'Než začneme', ob_start_label: 'Začátek poslední menstruace', ob_cycle_label: 'Délka cyklu (dny)', ob_period_label: 'Délka menstruace', ob_submit: 'Uložit a začít',
    phases: {
      menstrual: { season: 'Zima', emoji: '❄️', name: 'Menstruační fáze', energy_label: 'Nízká', mood: 'Tělo zpomaluje a bere si zpátečku. Časté jsou křeče, únava a chuť stáhnout se do klidu.', dos: ['Navrhni klidný večer doma – deka, čaj, film.', 'Termofor nebo teplá koupel.', 'Dej jí prostor, pokud ho chce.'], avoid: 'Náročné výlety a bagatelizování bolesti.' },
      follicular: { season: 'Jaro', emoji: '🌱', name: 'Folikulární fáze', energy_label: 'Stoupající', mood: 'Hormony se probouzí. Nálada se zlepšuje a roste chuť do nových věcí.', dos: ['Navrhni něco nového – výlet, kurz.', 'Plánujte společné věci a dovolenou.', 'Podpoř její nápady.'], avoid: 'Nic zvláštního.' },
      ovulatory: { season: 'Léto', emoji: '☀️', name: 'Ovulační fáze', energy_label: 'Nejvyšší', mood: 'Vrchol cyklu. Energie a chuť na blízkost jsou na maximu.', dos: ['Naplánuj rande nebo společenskou akci.', 'Dobrý čas na důležité rozhovory.', 'Dej prostor spontánnosti.'], avoid: 'Rutina.' },
      luteal: { season: 'Podzim', emoji: '🍂', name: 'Luteální fáze', energy_label: 'Klesající', mood: 'Energie klesá. Poslední dny (PMS) často přináší podrážděnost nebo úzkost.', dos: ['Buď trpělivý – výkyvy nálad nejsou o tobě.', 'Držte volnější režim bez stresu.', 'Zeptej se, co právě potřebuje.'], avoid: 'Hádky o maličkosti a tlačení do akcí.' }
    },
    ctx: {
      high_stress: 'V posledních dnech zaznamenán vyšší stres. Uberte na nárocích, dej jí dnes absolutní klid.',
      bad_sleep: 'Měla horší spánek. Nabídni jí, že dnes převezmeš část jejích povinností.',
      active_luteal: 'V této fázi klesá fyzická síla. Podpoř ji v regeneraci.',
      active_follicular: 'Fyzická síla a tolerance tréninku je teď na vrcholu. Skvělý čas na společný sport.',
      trend_stress: 'Data naznačují, že v cyklech s vyšším stresem dochází k jejich prodlužování.',
      trend_ok: 'Cyklus vypadá stabilně.'
    }
  },
  en: {
    eyebrow: 'Four Seasons', title: 'Inner Weather', subtitle: 'A quick look at her phase and how you can help.',
    loading: 'Loading...', today_btn: 'Today', wheel_day_label: 'Cycle day', energy_label: 'Energy',
    dos_heading: 'What to do', avoid_label: 'Avoid:', forecast_heading: 'Next 10 days',
    insights_summary: 'Insights & Analysis', ins_trend_title: 'Cycle Length Trend',
    profile_summary: 'Profile & Lifestyle', prof_age: 'Age', prof_activity: 'Activity Level',
    act_sedentary: 'Sedentary', act_light: 'Lightly active', act_active: 'Active (training, sports)', act_athlete: 'Athlete / High load',
    prof_pill: 'Uses hormonal contraception', journal_summary: 'Journal', j_date_label: 'Date',
    j_rating_legend: 'Mood (1-5)', j_sleep_legend: 'Sleep (1-5)', j_stress_legend: 'Stress (1-5)',
    j_symptoms_legend: 'Symptoms', j_note_label: 'Note', journal_submit: 'Save entry',
    history_summary: 'Cycle History', history_add_btn: 'Add', settings_summary: 'System & Account',
    set_cycle_label: 'Cycle length', set_period_label: 'Period length', settings_submit: 'Save',
    pill_warning: 'Hormonal contraception suppresses natural fluctuations. Treat phases as a rough guide.',
    dow_short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    symptoms: { cramps: 'Cramps', headache: 'Headache', bloating: 'Bloating', fatigue: 'Fatigue', irritability: 'Irritability', anxiety: 'Anxiety', sugar_cravings: 'Sugar cravings' },
    ob_h2: 'Before we start', ob_start_label: 'First day of last period', ob_cycle_label: 'Cycle length (days)', ob_period_label: 'Period length', ob_submit: 'Save and view',
    phases: {
      menstrual: { season: 'Winter', emoji: '❄️', name: 'Menstrual Phase', energy_label: 'Low', mood: 'Body slows down. Cramps and fatigue are common.', dos: ['Quiet evening at home.', 'Warm bath or hot water bottle.', 'Give her space.'], avoid: 'Demanding events.' },
      follicular: { season: 'Spring', emoji: '🌱', name: 'Follicular Phase', energy_label: 'Rising', mood: 'Energy and mood are lifting.', dos: ['Suggest something new.', 'Plan holidays or projects.', 'Support her ideas.'], avoid: 'Nothing in particular.' },
      ovulatory: { season: 'Summer', emoji: '☀️', name: 'Ovulatory Phase', energy_label: 'Peak', mood: 'Peak energy, confidence, and desire for closeness.', dos: ['Plan a date.', 'Good time for big talks.', 'Be spontaneous.'], avoid: 'Routine.' },
      luteal: { season: 'Autumn', emoji: '🍂', name: 'Luteal Phase', energy_label: 'Declining', mood: 'Energy fades. Late luteal (PMS) often brings irritability.', dos: ['Be patient.', 'Keep it low-stress.', 'Ask what she needs.'], avoid: 'Arguments over small things.' }
    },
    ctx: {
      high_stress: 'High stress recorded recently. Lower expectations today and give her absolute peace.',
      bad_sleep: 'Poor sleep recently. Offer to take over some of her chores today.',
      active_luteal: 'Physical strength naturally drops in this phase. Support her recovery.',
      active_follicular: 'Physical strength and training tolerance are peaking. Great time for a workout together.',
      trend_stress: 'Data suggests cycles with higher stress tend to be longer/irregular.',
      trend_ok: 'Cycle length appears stable.'
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

  const [jMood, setJMood] = useState(null);
  const [jSleep, setJSleep] = useState(null);
  const [jStress, setJStress] = useState(null);
  const [jSymptoms, setJSymptoms] = useState([]);
  const [jNote, setJNote] = useState("");
  const [newPeriodDate, setNewPeriodDate] = useState("");

  const t = (key) => I18N[lang][key];

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
      periods: [fd.get('start')],
      cycleLength: parseInt(fd.get('cycle')),
      periodLength: parseInt(fd.get('period')),
      age: fd.get('age'),
      activity: fd.get('activity'),
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

  if (status === "loading") return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "#09070b" }}>Načítám...</div>;
  if (status === "unauthenticated") return <LandingPage />;
  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "#09070b" }}>Načítám data...</div>;
  if (!session) return null;

  if (!settings || !settings.periods || settings.periods.length === 0) {
    return (
      <div className="app-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          .app-wrapper { background: #09070b; min-height: 100vh; padding: 40px 18px; display: flex; align-items: center; justify-content: center; color: #fff; }
          .ios-glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(48px) saturate(200%); -webkit-backdrop-filter: blur(48px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(255, 255, 255, 0.25); border-left: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2); border-radius: 32px; padding: 40px; width: 100%; max-width: 500px; }
          .field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
          .field span { font-size: 13px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; }
          input, select { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 14px; border-radius: 16px; color: #fff; font-size: 16px; outline: none; transition: border 0.3s; }
          input:focus, select:focus { border-color: rgba(255,255,255,0.4); }
          .btn-primary { background: #fff; color: #000; padding: 16px; border-radius: 99px; font-weight: 600; font-size: 16px; width: 100%; border: none; cursor: pointer; transition: transform 0.2s; }
          .btn-primary:hover { transform: scale(1.02); }
        `}} />
        <div className="ios-glass">
          <h2 style={{ fontSize: "28px", marginBottom: "8px", fontFamily: "var(--font-display)" }}>{t('ob_h2')}</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "32px", fontSize: "15px" }}>Vyplňte základní údaje pro kalibraci radaru.</p>
          <form onSubmit={handleOnboarding}>
            <label className="field"><span>{t('ob_start_label')}</span><input type="date" name="start" required /></label>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <label className="field" style={{ flex: "1 1 120px" }}><span>{t('ob_cycle_label')}</span><input type="number" name="cycle" defaultValue="28" required /></label>
              <label className="field" style={{ flex: "1 1 120px" }}><span>{t('ob_period_label')}</span><input type="number" name="period" defaultValue="5" required /></label>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: "16px" }}>{t('ob_submit')}</button>
          </form>
        </div>
      </div>
    );
  }

  const ranges = getPhaseDayRanges(settings.cycleLength, settings.periodLength);
  const currentDay = getCycleDay(selectedDate, settings.periods, settings.cycleLength);
  const phaseKey = getPhaseKey(currentDay, ranges);
  const phaseData = I18N[lang].phases[phaseKey];

  const getGradientColors = (phase) => {
    switch (phase) {
      case 'winter': return { c1: '#E2929C', c2: '#6B4C9A', c3: '#2B3A67', op: 0.65 };
      case 'spring': return { c1: '#9FCBA4', c2: '#5C8A69', c3: '#185A63', op: 0.65 };
      case 'summer': return { c1: '#F0BB6C', c2: '#E25B5B', c3: '#8E1E4F', op: 0.65 };
      case 'autumn': return { c1: '#E0875B', c2: '#A64B2A', c3: '#5C2A3A', op: 0.65 };
      default: return { c1: '#E2929C', c2: '#F0BB6C', c3: '#5C8A69', op: 0.3 };
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
  if (recentEntries.some(e => e.stress >= 4)) ctxTips.push(t('ctx').high_stress);
  if (recentEntries.some(e => e.sleep <= 2)) ctxTips.push(t('ctx').bad_sleep);
  
  const ascPeriods = [...settings.periods].sort();

  const RatingRow = ({ label, val, setter }) => (
    <fieldset style={{ border: "none", margin: "0 0 20px 0", padding: 0 }}>
      <legend style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: "8px" }}>{label}</legend>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} type="button" onClick={() => setter(v)} style={{ flex: 1, minWidth: "40px", padding: "12px 0", borderRadius: "12px", background: val === v ? "var(--summer)" : "rgba(255,255,255,0.08)", color: val === v ? "#000" : "#fff", border: "1px solid rgba(255,255,255,0.15)", fontWeight: val === v ? "bold" : "normal", cursor: "pointer", transition: "all 0.2s" }}>
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  );

  // OPRAVA SCROLLOVÁNÍ: Manuální výpočet offsetu, aby se karta neschovala pod skleněnou lištu
  const openAndScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.open = true;
      setTimeout(() => {
        const y = element.getBoundingClientRect().top + window.scrollY - 90; // 90px offset pro horní lištu
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 50); // Mírné zpoždění, aby se element stihl rozevřít
    }
  };

  const scrollToRadar = () => {
    const element = document.getElementById('top-radar');
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="app-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --winter: #E2929C;
          --spring: #9FCBA4;
          --summer: #F0BB6C;
          --autumn: #E0875B;
          --bg: #09070b;
          --surface-2: rgba(255,255,255,0.05);
          --ink: #ffffff;
          --ink-dim: rgba(255,255,255,0.6);
          --card-pad: 32px;
        }

        .app-wrapper { position: relative; min-height: 100vh; color: #fff; overflow-x: hidden; padding-top: 100px; padding-bottom: 120px; }
        h1, h2, h3, p, span, li, legend { color: inherit; }

        .mesh-background { position: fixed; inset: 0; z-index: -3; background: #09070b; overflow: hidden; }
        .mesh-orb { position: absolute; border-radius: 50%; filter: blur(100px); transition: background 2s ease, opacity 2s ease; }
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

        .ios-glass {
          background: rgba(30, 25, 34, 0.45);
          backdrop-filter: blur(48px) saturate(200%);
          -webkit-backdrop-filter: blur(48px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          border-left: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);
          border-radius: 32px;
          position: relative;
          overflow: hidden;
        }

        .glass-nav {
          position: fixed; top: 16px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 600px;
          height: 64px; border-radius: 99px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px 0 24px; z-index: 100;
        }
        
        .nav-brand-icon { display: none; }

        .nav-badge { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 99px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
        .nav-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .glass-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(10px); flex-shrink: 0; }
        .glass-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }

        .main-container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; padding: 0 16px; position: relative; z-index: 1; }
        
        .liquid-glow { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; opacity: 0.3; pointer-events: none; }
        .glass-content { position: relative; z-index: 2; padding: var(--card-pad); }

        /* OPRAVA OŘEZÁVÁNÍ DATUMOVKY PRO iOS SAFARI */
        input[type="date"] {
          -webkit-appearance: none;
          appearance: none;
          min-height: 52px;
          line-height: normal; /* Důležité: zabrání oříznutí textu */
          text-align: center;
        }

        .glass-date-pill {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 10px 20px;
          border-radius: 99px; font-family: inherit; font-size: 15px; font-weight: 500; outline: none; cursor: pointer; transition: border 0.3s;
        }
        .glass-date-pill:focus { border-color: rgba(255,255,255,0.4); }
        ::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }

        input:not(.glass-date-pill), select, textarea { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 14px; border-radius: 16px; color: #fff; font-size: 16px; outline: none; width: 100%; transition: border 0.3s; box-sizing: border-box; }
        input:focus:not(.glass-date-pill), select:focus, textarea:focus { border-color: rgba(255,255,255,0.4); }
        .field span { display: block; font-size: 13px; color: rgba(255,255,255,0.7); text-transform: uppercase; margin-bottom: 8px; }
        .btn-primary { background: #fff; color: #000; padding: 16px; border-radius: 99px; font-weight: 600; font-size: 16px; width: 100%; border: none; cursor: pointer; transition: transform 0.2s; }
        .btn-primary:hover { transform: scale(1.02); }

        /* OPRAVA OŘEZÁVÁNÍ EMOJI PRO iOS SAFARI */
        .emoji-icon {
          font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
          line-height: normal; /* Nejdůležitější pravidlo pro iOS emoji */
          padding: 4px 0; /* Bezpečná zóna proti oříznutí */
          display: inline-block;
          vertical-align: middle;
        }

        details { transition: all 0.3s ease; }
        summary { cursor: pointer; font-family: var(--font-display); font-size: 22px; color: #fff; display: flex; align-items: center; justify-content: space-between; list-style: none; padding: var(--card-pad); margin: calc(var(--card-pad) * -1); }
        summary::-webkit-details-marker { display: none; }
        summary::after { content: '+'; font-size: 28px; font-weight: 300; transition: transform 0.3s; }
        details[open] summary::after { transform: rotate(45deg); }
        details[open] summary { border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: var(--card-pad); padding-bottom: var(--card-pad); }
        
        .forecast-strip { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
        .forecast-chip { min-width: 70px; display: flex; flex-direction: column; align-items: center; padding: 16px 12px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.2s; }
        .forecast-chip.active { background: var(--accent); color: #000; border: none; font-weight: 600; }
        .forecast-chip:hover:not(.active) { background: rgba(255,255,255,0.1); }

        @media (max-width: 600px) {
          :root { --card-pad: 24px; }
          .glass-nav { padding: 0 12px; }
          .glass-date-pill { padding: 10px 12px; font-size: 14px; }
          h2 { font-size: 26px !important; }
          
          .nav-brand-text { display: none !important; }
          .nav-brand-icon { display: block !important; }
          
          .forecast-chip { min-width: 52px; padding: 10px 6px; border-radius: 14px; }
          .forecast-chip > span:nth-child(1) { font-size: 10px !important; }
          .forecast-chip > span:nth-child(2) { font-size: 15px !important; margin: 2px 0 !important; }
          .forecast-chip > span:nth-child(3) { width: 4px !important; height: 4px !important; }
        }
      `}} />

      <div className="mesh-background">
        <div className="mesh-orb orb-1" style={{ background: colors.c1, opacity: colors.op }}></div>
        <div className="mesh-orb orb-2" style={{ background: colors.c2, opacity: colors.op }}></div>
        <div className="mesh-orb orb-3" style={{ background: colors.c3, opacity: colors.op }}></div>
      </div>
      <div className="noise-overlay"></div>

      <nav className="glass-nav ios-glass">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="nav-brand-text" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "18px" }}>Vnitřní počasí</span>
          <svg className="nav-brand-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path>
          </svg>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginLeft: "auto" }}>
          
          <div className="nav-badge" onClick={scrollToRadar} style={{cursor: 'pointer'}}>
            <span className="nav-dot" style={{ background: `var(${PHASE_ACCENTS[phaseKey]})`, boxShadow: `0 0 10px var(${PHASE_ACCENTS[phaseKey]})` }}></span>
            <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="emoji-icon" style={{ fontSize: "15px" }}>{phaseData.emoji}</span> 
              <span>{currentDay}. den</span>
            </span>
          </div>

          <button className="glass-btn" onClick={() => openAndScroll('journal-details')}>➕</button>
          <button className="glass-btn" onClick={() => openAndScroll('settings-details')}>⚙️</button>
        </div>
      </nav>

      <div className="main-container">

        <section id="top-radar" className="ios-glass" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div className="liquid-glow" style={{ width: "250px", height: "250px", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: `var(${PHASE_ACCENTS[phaseKey]})` }}></div>
          <div style={{ position: "relative", zIndex: 2 }}>
            
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <button className="glass-btn" onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}>‹</button>
              
              <input 
                type="date" 
                value={toIso(selectedDate)} 
                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))} 
                className="glass-date-pill"
              />

              <button className="glass-btn" onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}>›</button>
            </div>

            <div style={{ position: "relative", width: "240px", height: "240px", margin: "0 auto" }}>
              <svg viewBox="0 0 240 240" style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
                <g transform="rotate(-90 120 120)">
                  {wheelSegments}
                  <circle cx={120 + 88 * Math.cos(markerAngle)} cy={120 + 88 * Math.sin(markerAngle)} r="12" fill="#fff" strokeWidth="4" stroke={`var(${PHASE_ACCENTS[phaseKey]})`} style={{ transition: 'all 0.5s' }} />
                </g>
              </svg>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1px" }}>{t('wheel_day_label')}</span>
                <span style={{ fontSize: "48px", fontFamily: "var(--font-display)", fontWeight: 500, lineHeight: 1 }}>{currentDay}</span>
                <span style={{ fontSize: "14px", color: `var(${PHASE_ACCENTS[phaseKey]})`, fontWeight: 600, marginTop: "4px" }}>{phaseData.season}</span>
              </div>
            </div>

          </div>
        </section>

        <section className="ios-glass">
          <div className="glass-content">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", marginBottom: "8px" }}>{phaseData.name}</h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: "24px" }}>{phaseData.mood}</p>
            
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "20px", padding: "20px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{t('energy_label')}</span>
                <span style={{ fontWeight: 600, color: `var(${PHASE_ACCENTS[phaseKey]})` }}>{phaseData.energy_label}</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${PHASE_ENERGY_PCT[phaseKey]}%`, background: `var(${PHASE_ACCENTS[phaseKey]})`, borderRadius: "99px", transition: "width 1s cubic-bezier(0.2, 0.8, 0.2, 1)" }}></div>
              </div>
            </div>

            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>
              {t('dos_heading')}
            </h3>
            
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
              {ctxTips.map((tip, i) => <li key={`ctx-${i}`} style={{ background: "rgba(255,255,255,0.05)", padding: "12px 16px", borderRadius: "12px", fontSize: "15px", borderLeft: "3px solid var(--summer)" }}>{tip}</li>)}
              {phaseData.dos.map((tip, i) => <li key={`dos-${i}`} style={{ background: "rgba(255,255,255,0.05)", padding: "12px 16px", borderRadius: "12px", fontSize: "15px" }}>{tip}</li>)}
            </ul>

            <div style={{ background: "rgba(226,146,156,0.1)", border: "1px solid rgba(226,146,156,0.2)", padding: "16px", borderRadius: "16px", color: "rgba(255,255,255,0.9)", fontSize: "15px" }}>
              <strong style={{ color: "var(--winter)" }}>{t('avoid_label')}</strong> {phaseData.avoid}
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
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === 0 ? "#000" : `var(${PHASE_ACCENTS[fPk]})` }}></span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ios-glass">
          <details id="journal-details">
            <summary>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="emoji-icon" style={{ marginRight: '14px', fontSize: '24px' }}>📝</span>
                {t('journal_summary')}
              </div>
            </summary>
            
            <div className="glass-content" style={{ paddingTop: 0 }}>
              <form onSubmit={handleSaveJournal}>
                
                <label className="field" style={{ marginBottom: "24px" }}>
                  <span>{t('j_date_label')}</span>
                  <input 
                    type="date" 
                    value={toIso(selectedDate)} 
                    onChange={e => e.target.value && setSelectedDate(new Date(e.target.value))} 
                    required 
                  />
                </label>

                <RatingRow label={t('j_rating_legend')} val={jMood} setter={setJMood} />
                <RatingRow label={t('j_sleep_legend')} val={jSleep} setter={setJSleep} />
                <RatingRow label={t('j_stress_legend')} val={jStress} setter={setJStress} />
                
                <div style={{ marginBottom: "24px" }}>
                  <span style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: "12px" }}>{t('j_symptoms_legend')}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {SYMPTOM_KEYS.map(k => (
                      <button key={k} type="button" onClick={() => setJSymptoms(jSymptoms.includes(k) ? jSymptoms.filter(x => x !== k) : [...jSymptoms, k])} style={{ background: jSymptoms.includes(k) ? "var(--winter)" : "rgba(255,255,255,0.08)", color: jSymptoms.includes(k) ? "#000" : "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: "99px", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}>
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
                  <div key={j.date} style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600 }}>{formatDate(new Date(j.date))}</span>
                      <button type="button" onClick={() => syncData(settings, journal.filter(x => x.date !== j.date))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "20px", cursor: "pointer" }}>×</button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {j.mood && <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "6px" }}>Nálada: {j.mood}</span>}
                      {j.stress >= 4 && <span style={{ fontSize: "12px", background: "rgba(226,146,156,0.2)", color: "var(--winter)", padding: "4px 8px", borderRadius: "6px" }}>Vysoký stres</span>}
                    </div>
                    {j.note && <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", marginTop: "12px", marginBottom: 0 }}>{j.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </details>
        </section>

        <section className="ios-glass">
          <details id="settings-details">
            <summary>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="emoji-icon" style={{ marginRight: '14px', fontSize: '24px' }}>⚙️</span>
                {t('settings_summary')}
              </div>
            </summary>

            <div className="glass-content" style={{ paddingTop: 0 }}>
              
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Parametry cyklu</h3>
              <form onSubmit={handleSystemSave} style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('set_cycle_label')}</span><input type="number" name="cycleLength" defaultValue={settings.cycleLength} required /></label>
                  <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('set_period_label')}</span><input type="number" name="periodLength" defaultValue={settings.periodLength} required /></label>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "12px", fontSize: "15px" }}>{t('settings_submit')}</button>
              </form>

              <h3 style={{ fontSize: "18px", marginBottom: "16px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>{t('history_summary')}</h3>
              <form onSubmit={handleAddPeriod} style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <input type="date" value={newPeriodDate} onChange={e => setNewPeriodDate(e.target.value)} required style={{ flex: "1 1 200px" }} />
                <button type="submit" className="btn-primary" style={{ flex: "0 0 auto", width: "auto", padding: "0 24px" }}>{t('history_add_btn')}</button>
              </form>
              
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {ascPeriods.reverse().map(p => (
                  <li key={p} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span>{formatDate(new Date(p))}</span>
                    <button type="button" onClick={() => syncData({ ...settings, periods: settings.periods.filter(x => x !== p) }, journal)} style={{ background: "none", border: "none", color: "var(--autumn)", fontSize: "16px", cursor: "pointer" }}>Smazat</button>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>Přihlášen jako: {session.user.email}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button onClick={() => signOut()} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "14px", borderRadius: "16px", fontSize: "15px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                    Odhlásit (Nechat e-mail v paměti)
                  </button>
                  <button onClick={() => { localStorage.removeItem("lastUserEmail"); signOut(); }} style={{ background: "rgba(226,146,156,0.15)", border: "1px solid rgba(226,146,156,0.3)", color: "var(--winter)", padding: "14px", borderRadius: "16px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                    Odhlásit a zapomenout účet
                  </button>
                </div>
              </div>

            </div>
          </details>
        </section>

      </div>
    </div>
  );
}
