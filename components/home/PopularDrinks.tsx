"use client";

import Link from "next/link";
import { CupSoda, Flame } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { BestSeller } from "@/lib/bestsellers";

/** Popular drinks — sobceye beshi bikri panio (plain pani bad). */
export default function PopularDrinks({ items }: { items: BestSeller[] }) {
  const { t } = useLang();
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="text-center mb-6">
        <p className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-500 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-sky-500/20">
          <CupSoda className="w-4 h-4" /> {t("home.drinkTag")}
        </p>
        <h2 className="text-2xl font-black mt-3">
          {t("home.drinkA")} <span className="text-brand">{t("home.drinkB")}</span>
        </h2>
        <p className="text-muted text-xs mt-1">{t("home.drinkSub")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(({ food: f, sold }) => (
          <Link
            key={f._id}
            href="/menu"
            className="group bg-card-bg border border-card-border rounded-lg p-3 hover:border-sky-500/60 transition-colors"
          >
            <div className="relative mb-2">
              <img
                src={f.image || "/placeholder-food.png"}
                alt={f.name}
                className="w-full h-28 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-food.png";
                }}
              />
              {sold > 0 && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-black/70 text-white">
                  <Flame className="w-3 h-3" />
                  {sold}+ {t("home.sold")}
                </span>
              )}
            </div>
            <p className="font-bold text-sm truncate group-hover:text-brand">{f.name}</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-muted">{f.category}</span>
              <span className="font-black text-brand">৳{f.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
