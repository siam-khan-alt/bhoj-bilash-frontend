"use client";

import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { isPlainWater } from "@/lib/bestsellers";
import type { Food } from "@/types";

/** Menu category cards — real foods theke group, tap → /menu. */
export default function CategoryShowcase({ foods }: { foods: Food[] }) {
  const { t } = useLang();
  const available = foods.filter((f) => f.available !== false);
  const base = available.length > 0 ? available : foods;
  if (base.length === 0) return null;

  const byCat = new Map<string, Food[]>();
  for (const f of base) {
    const list = byCat.get(f.category) ?? [];
    list.push(f);
    byCat.set(f.category, list);
  }
  const cats = [...byCat.entries()].slice(0, 6);

  return (
    <section className="mt-16">
      <div className="text-center mb-6">
        <p className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-brand/20">
          <LayoutGrid className="w-4 h-4" /> {t("home.catTag")}
        </p>
        <h2 className="text-2xl font-black mt-3">
          {t("home.catA")} <span className="text-brand">{t("home.catB")}</span>
        </h2>
        <p className="text-muted text-xs mt-1">{t("home.catSub")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(([cat, items]) => {
          // cover: pani kokhonoi na — Coca-Cola/Mojo type item prefer
          const cover = items.find((f) => !isPlainWater(f)) ?? items[0];
          return (
          <Link
            key={cat}
            href="/menu"
            className="group relative rounded-lg overflow-hidden border border-card-border h-36 sm:h-44"
          >
            <img
              src={cover?.image || "/placeholder-food.png"}
              alt={cat}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-food.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
              <div>
                <p className="font-black text-white text-sm">{cat}</p>
                <p className="text-[11px] font-bold text-white/70">
                  {t("home.catItems", { n: items.length })}
                </p>
              </div>
              <span className="w-7 h-7 rounded-full bg-white/20 glass-effect inline-flex items-center justify-center text-white group-hover:bg-brand transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
