import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import webpush from "web-push";

// Nastavení klíčů pro odesílání
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@vnitrnipocasi.cz',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// -----------------------------------------------------------------
// POMOCNÉ FUNKCE PRO VÝPOČET FÁZÍ (Stejné jako v page.js)
// -----------------------------------------------------------------
function getCycleDay(dateObj, periods, cycleLength) {
  if (!periods || !periods.length) return 1;
  const asc = [...periods].sort();
  const start = new Date(asc[asc.length - 1] + 'T00:00:00');
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diff = Math.round((d - start) / 86400000);
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
}

function getPhaseDayRanges(cycleLength, periodLength, lutealLength = 14) {
  const pl = Math.min(periodLength, cycleLength - 3);
  const lutealLen = (cycleLength < 22) ? Math.floor(cycleLength / 2) : lutealLength;
  const lutealStart = cycleLength - lutealLen + 1;
  const ovulatoryStart = lutealStart - 4;
  return {
    menstrual: { start: 1, end: pl },
    follicular: { start: pl + 1, end: ovulatoryStart - 1 },
    ovulatory: { start: ovulatoryStart, end: lutealStart - 1 },
    luteal: { start: lutealStart, end: cycleLength }
  };
}
// -----------------------------------------------------------------


export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Najdeme všechny uživatelky, které mají roli ženy a zapnuté push notifikace
    const femaleUsers = await User.find({ 
      "settings.role": "female",
      "settings.pushSubscription": { $ne: null }
    });

    let sentCount = 0;
    const now = new Date();

    for (const user of femaleUsers) {
      const settings = user.settings;
      const periods = settings.periods || [];
      const journal = user.journal || [];
      
      // Pokud nemá zapsanou menstruaci, nemůžeme nic počítat
      if (periods.length === 0) continue;

      const cycleLength = settings.cycleLength || 28;
      const periodLength = settings.periodLength || 5;
      const lutealLength = settings.lutealLength || 14;

      const currentDay = getCycleDay(now, periods, cycleLength);
      const ranges = getPhaseDayRanges(cycleLength, periodLength, lutealLength);

      let notificationToSend = null;

      // ==========================================================
      // 1. KONTROLA CYKLU (Prioritní notifikace)
      // ==========================================================
      
      // Upozornění 2 dny před Menstruací (Zima)
      if (settings.periodAlert !== false && currentDay === cycleLength - 1) {
        notificationToSend = {
          title: "Blíží se Zima ❄️",
          body: "Za pár dní očekávej menstruaci (PMS). Udělej si pohodlí, naber síly a připrav si vše potřebné."
        };
      } 
      // Upozornění před začátkem Ovulace (Léto)
      else if (settings.ovulationAlert !== false && currentDay === ranges.ovulatory.start - 1) {
        notificationToSend = {
          title: "Léto je za rohem ☀️",
          body: "Tvoje energie zítra dosáhne vrcholu a začínají plodné dny. Ideální čas vyrazit ven!"
        };
      }
      // Upozornění na změnu fáze: Příchod Jara (Folikulární)
      else if (settings.phaseAlert !== false && currentDay === ranges.follicular.start) {
        notificationToSend = {
          title: "Vítej v Jaru 🌱",
          body: "Menstruace končí a tvá energie začíná stoupat. Čas na nové projekty a lehký pohyb."
        };
      }
      // Upozornění na změnu fáze: Příchod Podzimu (Luteální)
      else if (settings.phaseAlert !== false && currentDay === ranges.luteal.start) {
        notificationToSend = {
          title: "Podzimní zvolnění 🍂",
          body: "Tvé tělo přechází do luteální fáze. Energie začne mírně klesat, dopřej si více laskavosti."
        };
      }

      // ==========================================================
      // 2. KONTROLA DENÍKU (Pokud není žádná priorita výše)
      // ==========================================================
      if (!notificationToSend && settings.reminderFrequency === '3days') {
        let shouldRemind = false;
        
        if (journal.length === 0) {
          shouldRemind = true;
        } else {
          // Zjištění dnů od posledního zápisu
          const sortedJournal = [...journal].sort((a,b) => a.date < b.date ? 1 : -1);
          const lastEntryDate = new Date(sortedJournal[0].date);
          const diffTime = Math.abs(now - lastEntryDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays >= 3) shouldRemind = true;
        }

        if (shouldRemind) {
          notificationToSend = {
            title: "Jak se dnes cítíš? 🌸",
            body: "Nezapomeň si zapsat dnešní náladu a mrknout na denní tip. Zabere to jen vteřinu."
          };
        }
      }

      // ==========================================================
      // 3. ODESLÁNÍ NOTIFIKACE
      // ==========================================================
      if (notificationToSend) {
        try {
          await webpush.sendNotification(
            settings.pushSubscription,
            JSON.stringify(notificationToSend)
          );
          sentCount++;
        } catch (e) {
          console.error(`Chyba odeslání pro ${user.email}:`, e);
        }
      }
    }

    return NextResponse.json({ success: true, sent: sentCount }, { status: 200 });
  } catch (error) {
    console.error("Cron chyba:", error);
    return NextResponse.json({ message: "Chyba na serveru" }, { status: 500 });
  }
}
