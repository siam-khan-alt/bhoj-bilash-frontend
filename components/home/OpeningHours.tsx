"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { DEFAULT_HOURS, isOpenNow } from "@/lib/restaurant";

/** Weekly opening hours + live open/closed badge. */
export default function OpeningHours() {
  const { t, lang } = useLang();
  const { config } = useRestaurant();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const hours = config.hours && config.hours.length === 7 ? config.hours : DEFAULT_HOURS;
  const todayIdx = now.getDay(); // 0 = রবিবার
  const open = isOpenNow(hours, now);
  const locale = lang === "bn" ? "bn-BD" : "en-US";

  // সোমবার থেকে শুরু করে দেখাও (বাংলাদেশে সপ্তাহ সোম–রবি হিসাবে পড়তে সুবিধা)
  const order = [1, 2, 3, 4, 5, 6, 0];
  const dayName = (dayIdx: number) => {
    // 2024-01-07 ছিল রবিবার — dayIdx অনুযায়ী তারিখ বানিয়ে নাম নাও
    const d = new Date(2024, 0, 7 + dayIdx);
    return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
  };

  const fmt = (h: string) => h; // "09:00 – 22:00"

  return (
    <section className="mt-16">
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-10 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <p className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-accent/20">
            <Clock className="w-4 h-4" /> {t("home.hoursTag")}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mt-3">
            {t("home.hoursA")} <span className="text-brand">{t("home.hoursB")}</span>
          </h2>
          <p className="text-muted text-sm mt-2">{t("home.hoursSub")}</p>
          <p className="mt-4">
            {open ? (
              <span className="inline-flex items-center gap-2 bg-accent/10 text-accent font-black text-sm px-4 py-2 rounded-full border border-accent/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                </span>
                {t("home.openNow")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-brand/10 text-brand font-black text-sm px-4 py-2 rounded-full border border-brand/30">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                {t("home.closedNow")}
              </span>
            )}
          </p>
          {!hours[todayIdx]?.closed && (
            <p className="text-xs text-muted font-bold mt-2">
              {t("home.hoursToday", { h: `${fmt(hours[todayIdx].open)} – ${fmt(hours[todayIdx].close)}` })}
            </p>
          )}
        </div>

        <div className="border border-card-border rounded-lg divide-y divide-card-border overflow-hidden">
          {order.map((d) => {
            const h = hours[d];
            const isToday = d === todayIdx;
            return (
              <div
                key={d}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  isToday ? "bg-brand/5 font-black" : ""
                }`}
              >
                <span className={isToday ? "text-brand" : "font-bold"}>
                  {dayName(d)}
                  {isToday && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-brand text-white uppercase">•</span>}
                </span>
                <span className={h.closed ? "text-brand font-bold" : "text-muted font-bold"}>
                  {h.closed ? t("home.closedNow") : `${fmt(h.open)} – ${fmt(h.close)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
