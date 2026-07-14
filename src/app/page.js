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
    prof_pill: 'Užívá hormonální antikoncepci', journal_summary: 'Deník', j_date_label: 'Datum',
    j_rating_legend: 'Nálada (1-5)', j_sleep_legend: 'Spánek (1=špatný, 5=skvělý)', j_stress_legend: 'Stres (1=klid, 5=max)',
    j_symptoms_legend: 'Příznaky', j_note_label: 'Poznámka', journal_submit: 'Uložit zápis',
    history_summary: 'Historie cyklů', history_add_btn: 'Přidat', settings_summary: 'Systém & Data',
    set_cycle_label: 'Délka cyklu (dny)', set_period_label: 'Menstruace (dny)', settings_submit: 'Uložit',
    pill_warning: 'Při hormonální antikoncepci jsou přirozené hormonální výkyvy potlačeny. Fáze berte spíše jako orientační.',
    dow_short: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    symptoms: { cramps: 'Křeče', headache: 'Bolest hlavy', bloating: 'Nadýmání', fatigue: 'Únava', irritability: 'Podrážděnost', anxiety: 'Úzkost', sugar_cravings: 'Chuť na sladké' },
    ob_h2: 'Než začneme', ob_start_label: 'Začátek poslední menstruace', ob_cycle_label: 'Délka cyklu (dny)', ob_period_label: 'Délka menstruace', ob_submit: 'Uložit a začít',
    phases: {
      menstrual: { season: 'Zima', name: 'Menstruační fáze', energy_label: 'Nízká', mood: 'Tělo zpomaluje a bere si zpátečku. Časté jsou křeče, únava a chuť stáhnout se do klidu.', dos: ['Navrhni klidný večer doma – deka, čaj, film.', 'Termofor nebo teplá koupel.', 'Dej jí prostor, pokud ho chce.'], avoid: 'Náročné výlety a bagatelizování bolesti.' },
      follicular: { season: 'Jaro', name: 'Folikulární fáze', energy_label: 'Stoupající', mood: 'Hormony se probouzí. Nálada se zlepšuje a roste chuť do nových věcí.', dos: ['Navrhni něco nového – výlet, kurz.', 'Plánujte společné věci a dovolenou.', 'Podpoř její nápady.'], avoid: 'Nic zvláštního.' },
      ovulatory: { season: 'Léto', name: 'Ovulační fáze', energy_label: 'Nejvyšší', mood: 'Vrchol cyklu. Energie a chuť na blízkost jsou na maximu.', dos: ['Naplánuj rande nebo společenskou akci.', 'Dobrý čas na důležité rozhovory.', 'Dej prostor spontánnosti.'], avoid: 'Rutina.' },
      luteal: { season: 'Podzim', name: 'Luteální fáze', energy_label: 'Klesající', mood: 'Energie klesá. Poslední dny (PMS) často přináší podrážděnost nebo úzkost.', dos: ['Buď trpělivý – výkyvy nálad nejsou o tobě.', 'Držte volnější režim bez stresu.', 'Zeptej se, co právě potřebuje.'], avoid: 'Hádky o maličkosti a tlačení do akcí.' }
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
    history_summary: 'Cycle History', history_add_btn: 'Add', settings_summary: 'System & Data',
    set_cycle_label: 'Cycle length', set_period_label: 'Period length', settings_submit: 'Save',
    pill_warning: 'Hormonal contraception suppresses natural fluctuations. Treat phases as a rough guide.',
    dow_short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    symptoms: { cramps: 'Cramps', headache: 'Headache', bloating: 'Bloating', fatigue: 'Fatigue', irritability: 'Irritability', anxiety: 'Anxiety', sugar_cravings: 'Sugar cravings' },
    ob_h2: 'Before we start', ob_start_label: 'First day of last period', ob_cycle_label: 'Cycle length (days)', ob_period_label: 'Period length', ob_submit: 'Save and view',
    phases: {
      menstrual: { season: 'Winter', name: 'Menstrual Phase', energy_label: 'Low', mood: 'Body slows down. Cramps and fatigue are common.', dos: ['Quiet evening at home.', 'Warm bath or hot water bottle.', 'Give her space.'], avoid: 'Demanding events.' },
      follicular: { season: 'Spring', name: 'Follicular Phase', energy_label: 'Rising', mood: 'Energy and mood are lifting.', dos: ['Suggest something new.', 'Plan holidays or projects.', 'Support her ideas.'], avoid: 'Nothing in particular.' },
      ovulatory: { season: 'Summer', name: 'Ovulatory Phase', energy_label: 'Peak', mood: 'Peak energy, confidence, and desire for closeness.', dos: ['Plan a date.', 'Good time for big talks.', 'Be spontaneous.'], avoid: 'Routine.' },
      luteal: { season: 'Autumn', name: 'Luteal Phase', energy_label: 'Declining', mood: 'Energy fades. Late luteal (PMS) often brings irritability.', dos: ['Be patient.', 'Keep it low-stress.', 'Ask what she needs.'], avoid: 'Arguments over small things.' }
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

  // Stavy aplikace
  const [lang, setLang] = useState("cs");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [journal, setJournal] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Stavy formulářů
  const [jMood, setJMood] = useState(null);
  const [jSleep, setJSleep] = useState(null);
  const [jStress, setJStress] = useState(null);
  const [jSymptoms, setJSymptoms] = useState([]);
  const [jNote, setJNote] = useState("");
  const [newPeriodDate, setNewPeriodDate] = useState("");

  const t = (key) => I18N[lang][key];

  // Načtení dat z MongoDB po přihlášení
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

  // Uložení dat do MongoDB
  const syncData = async (newSettings, newJournal) => {
    setSettings(newSettings);
    if (newJournal) setJournal(newJournal);
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: newSettings, journal: newJournal })
    });
  };

  // Obsluha Onboardingu
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

  // Uložení Profilu (z hlavní stránky)
  const handleProfileSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    syncData({
      ...settings,
      age: fd.get('age'),
      activity: fd.get('activity'),
      contraception: fd.get('pill') === 'on'
    }, journal);
  };

  // Uložení Systému (Délka cyklu/menstruace)
  const handleSystemSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    syncData({
      ...settings,
      cycleLength: parseInt(fd.get('cycleLength')),
      periodLength: parseInt(fd.get('periodLength'))
    }, journal);
  };

  // Přidání nové menstruace
  const handleAddPeriod = (e) => {
    e.preventDefault();
    if (!newPeriodDate || settings.periods.includes(newPeriodDate)) return;
    syncData({ ...settings, periods: [...settings.periods, newPeriodDate] }, journal);
    setNewPeriodDate("");
  };

  // Uložení deníku
  const handleSaveJournal = (e) => {
    e.preventDefault();
    const dateStr = toIso(selectedDate);
    const entry = { date: dateStr, mood: jMood, sleep: jSleep, stress: jStress, symptoms: jSymptoms, note: jNote };
    const newJournal = [...journal.filter(j => j.date !== dateStr), entry];
    syncData(settings, newJournal);
    setJMood(null); setJSleep(null); setJStress(null); setJSymptoms([]); setJNote("");
  };

  // ====== TADY JSOU TY PODMÍNKY ======
  if (status === "loading") return <p className="loading-msg" style={{ marginTop: "40px" }}>Načítám...</p>;
  if (status === "unauthenticated") return <LandingPage />;
  if (loading) return <p className="loading-msg" style={{ marginTop: "40px" }}>Načítám...</p>;
  if (!session) return null;

  // Renderování Onboardingu
  if (!settings || !settings.periods || settings.periods.length === 0) {
    return (
      <div className="app">
        <header className="hero">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 className="title">{t('title')}</h1>
          <p className="subtitle">{t('subtitle')}</p>
        </header>
        <section className="card onboarding">
          <h2>{t('ob_h2')}</h2>
          <form onSubmit={handleOnboarding}>
            <label className="field"><span>{t('ob_start_label')}</span><input type="date" name="start" required /></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('ob_cycle_label')}</span><input type="number" name="cycle" defaultValue="28" required /></label>
              <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('ob_period_label')}</span><input type="number" name="period" defaultValue="5" required /></label>
            </div>
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink-dim)", marginBottom: "12px", textTransform: "uppercase" }}>{t('profile_summary')}</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('prof_age')}</span><input type="number" name="age" /></label>
                <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}>
                  <span>{t('prof_activity')}</span>
                  <select name="activity" defaultValue="light">
                    <option value="sedentary">{t('act_sedentary')}</option>
                    <option value="light">{t('act_light')}</option>
                    <option value="active">{t('act_active')}</option>
                    <option value="athlete">{t('act_athlete')}</option>
                  </select>
                </label>
              </div>
              <label className="field checkbox" style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}>
                <input type="checkbox" name="pill" /> <span>{t('prof_pill')}</span>
              </label>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: "20px" }}>{t('ob_submit')}</button>
          </form>
        </section>
      </div>
    );
  }

  // Výpočty pro hlavní UI
  const ranges = getPhaseDayRanges(settings.cycleLength, settings.periodLength);
  const currentDay = getCycleDay(selectedDate, settings.periods, settings.cycleLength);
  const phaseKey = getPhaseKey(currentDay, ranges);
  const phaseData = I18N[lang].phases[phaseKey];

  // Výpočet kruhu (SVG)
  const circ = 2 * Math.PI * 88;
  const wheelSegments = [['menstrual', ranges.menstrual], ['follicular', ranges.follicular], ['ovulatory', ranges.ovulatory], ['luteal', ranges.luteal]].map(p => {
    const len = (p[1].end - p[1].start + 1) / settings.cycleLength;
    const dashBefore = ((p[1].start - 1) / settings.cycleLength) * circ;
    const dashLen = len * circ;
    const dashAfter = Math.max(0, circ - dashBefore - dashLen);
    return <circle key={p[0]} cx="120" cy="120" r="88" fill="none" strokeWidth="24" stroke={`var(${PHASE_ACCENTS[p[0]]})`} strokeDasharray={`0 ${dashBefore} ${dashLen} ${dashAfter}`} style={{ transition: 'stroke 0.3s' }} />;
  });
  const markerAngle = ((currentDay - 0.5) / settings.cycleLength) * 2 * Math.PI;

  // Kontextové tipy
  const recentEntries = journal.filter(e => {
    const diff = (selectedDate.getTime() - new Date(e.date + 'T00:00:00').getTime()) / 86400000;
    return diff >= 0 && diff <= 2;
  });
  const ctxTips = [];
  if (recentEntries.some(e => e.stress >= 4)) ctxTips.push(t('ctx').high_stress);
  if (recentEntries.some(e => e.sleep <= 2)) ctxTips.push(t('ctx').bad_sleep);
  if (settings.activity === 'athlete' || settings.activity === 'active') {
    if (phaseKey === 'luteal' || phaseKey === 'menstrual') ctxTips.push(t('ctx').active_luteal);
    if (phaseKey === 'follicular' || phaseKey === 'ovulatory') ctxTips.push(t('ctx').active_follicular);
  }

  // Historie a Trendy
  const ascPeriods = [...settings.periods].sort();
  const diffs = [];
  for (let i = 1; i < ascPeriods.length; i++) {
    diffs.push(Math.round((new Date(ascPeriods[i]) - new Date(ascPeriods[i - 1])) / 86400000));
  }
  const avgCycle = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : settings.cycleLength;
  const maxDiff = diffs.length ? Math.max(...diffs) + 5 : 40;

  // Komponenty pro hodnocení 1-5
  const RatingRow = ({ label, val, setter }) => (
    <fieldset className="field-group">
      <legend>{label}</legend>
      <div className="rating-buttons" style={{ flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} type="button" className={`rating-btn ${val === v ? 'active' : ''}`} onClick={() => setter(v)}>{v}</button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="app">
      {/* Hlavička */}
      <header className="hero">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1 className="title">{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
        <div className="lang-switch">
          <button className={`lang-btn ${lang === 'cs' ? 'active' : ''}`} onClick={() => setLang('cs')}>CZ</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
      </header>

      <main>
        {/* Kruhový diagram */}
        <section className="wheel-section">
          <div className="wheel-wrap">
            <svg viewBox="0 0 240 240">
              <g transform="rotate(-90 120 120)">
                {wheelSegments}
                <circle className="wheel-marker" cx={120 + 88 * Math.cos(markerAngle)} cy={120 + 88 * Math.sin(markerAngle)} r="10" fill="var(--ink)" strokeWidth="5" stroke={`var(${PHASE_ACCENTS[phaseKey]})`} style={{ transition: 'all 0.5s' }} />
              </g>
            </svg>
            <div className="wheel-center">
              <span className="wheel-day-label">{t('wheel_day_label')}</span>
              <span className="wheel-day">{currentDay}</span>
              <span className="wheel-phase-label" style={{ color: `var(${PHASE_ACCENTS[phaseKey]})` }}>{phaseData.season}</span>
            </div>
          </div>
        </section>

        {/* Navigace dny */}
        <nav className="date-nav">
          <button className="nav-btn" onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}>‹</button>
          <input type="date" id="date-input" value={toIso(selectedDate)} onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))} />
          <button className="nav-btn" onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}>›</button>
          <button className="today-btn" onClick={() => setSelectedDate(new Date())}>{t('today_btn')}</button>
        </nav>

        {/* Hlavní karta výsledku */}
        <section className="card result-card" style={{ '--accent': `var(${PHASE_ACCENTS[phaseKey]})` }}>
          <p className="result-date">{formatDate(selectedDate)} · {currentDay}. den</p>
          {settings.contraception && <div className="pill-warning">{t('pill_warning')}</div>}
          <p className="result-season" style={{ color: "var(--accent)" }}>{phaseData.season}</p>
          <h2 className="result-phase">{phaseData.name}</h2>
          
          <div className="energy">
            <span className="energy-label">{t('energy_label')}</span>
            <div className="energy-track"><div className="energy-fill" style={{ width: `${PHASE_ENERGY_PCT[phaseKey]}%`, background: "var(--accent)" }}></div></div>
            <span className="energy-value">{phaseData.energy_label}</span>
          </div>
          
          <p className="result-mood">{phaseData.mood}</p>
          
          <div className="result-dos">
            <h3>{t('dos_heading')}</h3>
            <ul>
              {ctxTips.map((tip, i) => <li key={`ctx-${i}`} className="ctx-tip">{tip}</li>)}
              {phaseData.dos.map((tip, i) => <li key={`dos-${i}`}>{tip}</li>)}
            </ul>
          </div>
          <p className="result-avoid"><strong>{t('avoid_label')}</strong> {phaseData.avoid}</p>
        </section>

        {/* Forecast Strip */}
        <section className="forecast" style={{ marginTop: "28px" }}>
          <h3>{t('forecast_heading')}</h3>
          <div className="forecast-strip">
            {Array.from({ length: 10 }).map((_, i) => {
              const d = new Date(selectedDate); d.setDate(d.getDate() + i);
              const fDay = getCycleDay(d, settings.periods, settings.cycleLength);
              const fPk = getPhaseKey(fDay, ranges);
              return (
                <div key={i} className={`forecast-chip ${i === 0 ? 'active' : ''}`} style={{ '--accent': `var(${PHASE_ACCENTS[fPk]})` }} onClick={() => setSelectedDate(d)}>
                  <span className="fc-dow">{t('dow_short')[d.getDay()]}</span>
                  <span className="fc-date">{d.getDate()}.{d.getMonth() + 1}.</span>
                  <span className="fc-dot"></span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Přehledy a analýza */}
        <details className="settings" style={{ marginTop: "28px" }}>
          <summary><span className="summary-title">{t('insights_summary')}</span></summary>
          <div className="settings-body">
            {diffs.length > 0 ? (
              <div className="insights-block">
                <h3>{t('ins_trend_title')}</h3>
                <div className="trend-chart">
                  {diffs.map((d, i) => (
                    <div key={i} className="trend-bar-wrap">
                      <div className="trend-bar" style={{ height: `${(d / maxDiff) * 100}%`, background: d > 35 || d < 21 ? 'var(--autumn)' : 'var(--surface-2)' }}></div>
                      <span className="trend-val">{d}</span>
                    </div>
                  ))}
                  <div className="avg-line" style={{ bottom: `${(avgCycle / maxDiff) * 100}%` }}></div>
                </div>
                <div className="insight-text-box" style={{ background: "var(--surface-2)", padding: "14px", borderRadius: "12px", marginTop: "12px", borderLeft: "3px solid var(--summer)", fontSize: "13.5px" }}>
                  <strong>Průměr: {Math.round(avgCycle)} dní.</strong><br/>
                  {diffs.length > 0 && Math.max(...diffs) - Math.min(...diffs) > 6 ? (journal.some(e => e.stress >= 4) ? t('ctx').trend_stress : `Cyklus kolísá (rozptyl ${Math.max(...diffs) - Math.min(...diffs)} dní).`) : t('ctx').trend_ok}
                </div>
              </div>
            ) : (
              <p className="hint">Pro zobrazení grafů přidejte alespoň 2 menstruace.</p>
            )}
          </div>
        </details>

        {/* Profil a životní styl */}
        <details className="settings" style={{ marginTop: "14px" }}>
          <summary><span className="summary-title">{t('profile_summary')}</span></summary>
          <div className="settings-body">
            <form onSubmit={handleProfileSave}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}>
                  <span>{t('prof_age')}</span>
                  <input type="number" name="age" defaultValue={settings.age} />
                </label>
                <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}>
                  <span>{t('prof_activity')}</span>
                  <select name="activity" defaultValue={settings.activity}>
                    <option value="sedentary">{t('act_sedentary')}</option>
                    <option value="light">{t('act_light')}</option>
                    <option value="active">{t('act_active')}</option>
                    <option value="athlete">{t('act_athlete')}</option>
                  </select>
                </label>
              </div>
              <label className="field checkbox" style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}>
                <input type="checkbox" name="pill" defaultChecked={settings.contraception} /> <span>{t('prof_pill')}</span>
              </label>
              <button type="submit" className="btn-primary" style={{ marginTop: "12px" }}>{t('settings_submit')}</button>
            </form>
          </div>
        </details>

        {/* Deník */}
        <details className="settings" style={{ marginTop: "14px" }}>
          <summary><span className="summary-title">{t('journal_summary')}</span></summary>
          <div className="settings-body">
            <form onSubmit={handleSaveJournal}>
              <label className="field" style={{ marginBottom: "16px" }}>
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
              <fieldset className="field-group">
                <legend>{t('j_symptoms_legend')}</legend>
                <div className="symptom-tags">
                  {SYMPTOM_KEYS.map(k => (
                    <button key={k} type="button" className={`tag-btn ${jSymptoms.includes(k) ? 'active' : ''}`} onClick={() => setJSymptoms(jSymptoms.includes(k) ? jSymptoms.filter(x => x !== k) : [...jSymptoms, k])}>
                      {t('symptoms')[k] || k}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field"><span>{t('j_note_label')}</span><textarea rows="2" value={jNote} onChange={e => setJNote(e.target.value)}></textarea></label>
              <button type="submit" className="btn-primary">{t('journal_submit')}</button>
            </form>
            <ul className="journal-list">
              {[...journal].sort((a,b) => a.date < b.date ? 1 : -1).map(j => (
                <li key={j.date} className="journal-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <div className="journal-item-meta" style={{ display: "flex", width: "100%", alignItems: "center", gap: "8px" }}>
                    <span className="j-date">{formatDate(new Date(j.date))}</span>
                    <div style={{ display: "flex", gap: "6px", marginRight: "auto" }}>
                      {j.mood && <span style={{ fontSize: "11px", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "4px" }}>Nálada {j.mood}</span>}
                      {j.stress >= 4 && <span style={{ fontSize: "11px", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "4px", color: "var(--autumn)" }}>Stres</span>}
                    </div>
                    <button type="button" className="delete-x" onClick={() => syncData(settings, journal.filter(x => x.date !== j.date))}>×</button>
                  </div>
                  {j.note && <div style={{ fontSize: "12.5px", color: "var(--ink-dim)", marginTop: "4px" }}>{j.note}</div>}
                </li>
              ))}
            </ul>
          </div>
        </details>

        {/* Historie */}
        <details className="settings" style={{ marginTop: "14px" }}>
          <summary><span className="summary-title">{t('history_summary')}</span></summary>
          <div className="settings-body">
            <form className="inline-add-form" onSubmit={handleAddPeriod}>
              <input type="date" value={newPeriodDate} onChange={e => setNewPeriodDate(e.target.value)} required />
              <button type="submit" className="btn-small">{t('history_add_btn')}</button>
            </form>
            <ul className="history-list">
              {ascPeriods.reverse().map(p => (
                <li key={p} className="history-item" style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{formatDate(new Date(p))}</span>
                  <button type="button" className="delete-x" onClick={() => syncData({ ...settings, periods: settings.periods.filter(x => x !== p) }, journal)}>×</button>
                </li>
              ))}
            </ul>
          </div>
        </details>

        {/* Systém a Odhlášení */}
        <details className="settings" style={{ marginTop: "14px" }}>
          <summary><span className="summary-title">{t('settings_summary')}</span></summary>
          <div className="settings-body">
            <form onSubmit={handleSystemSave}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('set_cycle_label')}</span><input type="number" name="cycleLength" defaultValue={settings.cycleLength} required /></label>
                <label className="field" style={{ flex: "1 1 120px", marginBottom: 0 }}><span>{t('set_period_label')}</span><input type="number" name="periodLength" defaultValue={settings.periodLength} required /></label>
              </div>
              <button type="submit" className="btn-primary">{t('settings_submit')}</button>
            </form>
          </div>
        </details>

{/* PŮVODNÍ OBYČEJNÉ ODHLÁŠENÍ SMAŽ A VLOŽ TOTO: */}
        <div style={{ marginTop: "28px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <p style={{ fontSize: "13px", color: "var(--ink-dim)", marginBottom: "4px" }}>Přihlášen jako: {session.user.email}</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => signOut()} style={{ background: "none", border: "1px solid var(--border)", color: "var(--ink)", padding: "8px 16px", borderRadius: "99px", fontSize: "13px", cursor: "pointer" }}>
              Odhlásit se
            </button>
            <button onClick={() => { localStorage.removeItem("lastUserEmail"); signOut(); }} style={{ background: "none", border: "1px solid var(--border)", color: "var(--autumn)", padding: "8px 16px", borderRadius: "99px", fontSize: "13px", cursor: "pointer" }}>
              Přihlásit se pod jiným účtem
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
