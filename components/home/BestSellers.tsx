"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { BestSeller } from "@/lib/bestsellers";

/** Home page — sobceye beshi sell howa 8 ta item (menu theke). */
export default function BestSellers({ items }: { items: BestSeller[] }) {
  const { t } = useLang();
  if (items.length === 0) return null;

  return (
    <section className="mt-16 text-left">
      <div className="text-center mb-6">
        <p className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-500 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-orange-500/20">
          <Flame className="w-4 h-4" /> {t("home.bestTag")}
        </p>
        <h2 className="text-2xl font-black mt-3">
          {t("home.bestA")} <span className="text-brand">{t("home.bestB")}</span>
        </h2>
        <p className="text-muted text-xs mt-1">{t("home.bestSub")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(({ food: f, sold }, i) => (
          <Link
            key={f._id}
            href="/menu"
            className="group bg-card-bg border border-card-border rounded-lg p-3 hover:border-brand/60 transition-colors"
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
              {i < 3 && (
                <span
                  className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full text-white uppercase ${
                    i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : "bg-amber-700"
                  }`}
                >
                  #{i + 1}
                </span>
              )}
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

      <div className="text-center mt-6">
        <Link
          href="/menu"
          className="inline-block text-xs font-black text-brand border border-brand/30 rounded-full px-6 py-2 hover:bg-brand hover:text-white transition-colors"
        >
          {t("home.viewMenu")} →
        </Link>
      </div>
    </section>
  );
}
