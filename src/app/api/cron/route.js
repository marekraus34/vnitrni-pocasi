import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import webpush from "web-push";

// Inicializace Web Push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@vnitrnipocasi.cz',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Zabrání Vercelu v cachování výsledku cronu
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------
// POMOCNÉ FUNKCE
// ---------------------------------------------------------
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

function getCycleDay(dateObj, periods, cycleLength) {
  if (!periods || !periods.length) return 1;
  const asc = [...periods].sort();
  const start = new Date(asc[asc.length - 1] + 'T00:00:00');
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diff = Math.round((d - start) / 86400000);
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
}

// ---------------------------------------------------------
// HLAVNÍ LOGIKA CRONU
// ---------------------------------------------------------
export async function GET(req) {
  try {
    await connectToDatabase();
    // Najdeme všechny uživatelky (ženy) v systému
    const females = await User.find({ "settings.role": "female" });
    let sentCount = 0;
    const now = new Date();

    for (const female of females) {
      
      // 1. ZKONTROLUJEME PŘIPOMÍNKU NA ZÁPIS (PRO ŽENU)
      if (female.settings?.pushSubscription && female.settings?.reminderFrequency === '3days') {
        let lastEntryDate = null;
        if (female.journal && female.journal.length > 0) {
          // Seřadíme zápisy a vezmeme ten nejnovější
          const sortedJournal = [...female.journal].sort((a, b) => new Date(b.date) - new Date(a.date));
          lastEntryDate = new Date(sortedJournal[0].date);
        }

        let shouldRemind = false;
        if (!lastEntryDate) {
           shouldRemind = true;
        } else {
           const diffTime = Math.abs(now.getTime() - lastEntryDate.getTime());
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
           
           if (diffDays >= 3) shouldRemind = true;
        }

        if (shouldRemind) {
          try {
            await webpush.sendNotification(
              female.settings.pushSubscription,
              JSON.stringify({ title: "Vnitřní počasí 🌸", body: "Už jsi si pár dní nezapsala do deníku. Jak se dnes cítíš?" })
            );
            sentCount++;
          } catch (err) { console.error("Chyba při odesílání ženě:", err); }
        }
      }

      // 2. CHYTRÁ UPOZORNĚNÍ PRO PARTNERA (MUŽE)
      if (female.settings?.pairedWith) {
        // Najdeme spárovaného partnera
        const partner = await User.findOne({ email: female.settings.pairedWith, "settings.role": "partner" });
        
        if (partner && partner.settings?.pushSubscription) {
          const cycleLength = female.settings.cycleLength || 28;
          const currentDay = getCycleDay(now, female.settings.periods, cycleLength);
          const ranges = getPhaseDayRanges(cycleLength, female.settings.periodLength || 5, female.settings.lutealLength || 14);

          // Kolik dní chybí do jednotlivých fází
          const daysToWinter = cycleLength - currentDay + 1; 
          const daysToSummer = ranges.ovulatory.start - currentDay; 
          const daysToAutumn = ranges.luteal.start - currentDay; 
          const daysToSpring = ranges.follicular.start - currentDay; 

          let partnerMessage = null;

          // Kontrolujeme, jestli to má muž vůbec zapnuté
          if (daysToWinter === 3 && partner.settings?.periodAlert !== false) {
            partnerMessage = "⚠️ Za 3 dny začíná Zima. Právě teď vrcholí PMS! Obrň se trpělivostí, může být unavenější a náladová. Zkus jí dnes ulevit od povinností. 🍂";
          } 
          else if (daysToSummer === 2 && partner.settings?.ovulationAlert !== false) {
            partnerMessage = "🔥 Za 2 dny začíná Léto (Ovulace)! Její energie, nálada a chuť na intimitu budou na absolutním maximu. Ideální čas naplánovat rande! ☀️";
          }
          else if (daysToAutumn === 1 && partner.settings?.phaseAlert !== false) {
            partnerMessage = "🍂 Zítra začíná Podzim. Létu a vysoké energii odzvonilo, tělo začne pomalu brzdit. Přepněte doma na klidnější režim.";
          }
          else if (daysToSpring === 1 && partner.settings?.phaseAlert !== false) {
            partnerMessage = "🌱 Zítra začíná Jaro! Zima končí a její energie půjde rychle nahoru. Můžete začít plánovat aktivnější dny.";
          }

          if (partnerMessage) {
            try {
              await webpush.sendNotification(
                partner.settings.pushSubscription,
                JSON.stringify({ title: "Vnitřní počasí 🎯", body: partnerMessage })
              );
              sentCount++;
            } catch (err) { console.error("Chyba při odesílání partnerovi:", err); }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cron proběhl", sent: sentCount });

  } catch (error) {
    console.error("CRON Fatální Chyba:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
