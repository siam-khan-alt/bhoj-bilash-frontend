"use client";

import Link from "next/link";
import { BadgePercent, Timer } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { effectivePrice } from "@/lib/api/packages";
import type { Food, Package } from "@/types";

/** Cholti offer thakle boro banner — na thakle render-e hobe na. */
export default function OfferBanner({ packages, foods }: { packages: Package[]; foods: Food[] }) {
  const { t } = useLang();
  const offer = packages.find((p) => p.offerPrice && Number(p.offerPrice) > 0);
  if (!offer) return null;

  const foodName = (id: string) => foods.find((f) => f._id === id)?.name || "item";
  const save = Number(offer.price) - Number(offer.offerPrice);

  return (
    <section className="mt-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-brand-hover text-white p-6 sm:p-10">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, white 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {offer.image && (
            <img
              src={offer.image}
              alt={offer.name}
              className="w-full sm:w-44 h-40 sm:h-36 object-cover rounded-xl border border-white/30 shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="flex-1">
            <p className="inline-flex items-center gap-2 bg-white/20 text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/30">
              <Timer className="w-3.5 h-3.5" /> {t("home.offerTag")}
              {offer.offerNote && <span>• {offer.offerNote}</span>}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black mt-3">{offer.name}</h2>
            <p className="text-white/80 text-xs mt-1">
              {offer.items.map((it) => `${foodName(it.foodId)} x${it.qty}`).join(" + ")}
            </p>
            <p className="mt-3 flex items-baseline gap-3">
              <span className="text-white/70 line-through font-bold">৳{offer.price}</span>
              <span className="text-3xl font-black">৳{effectivePrice(offer)}</span>
              {save > 0 && (
                <span className="inline-flex items-center gap-1 bg-white text-brand text-xs font-black px-2.5 py-1 rounded-full">
                  <BadgePercent className="w-3.5 h-3.5" />
                  {t("home.offerSave", { amt: save })}
                </span>
              )}
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <Link
              href="/menu"
              className="inline-block bg-white text-brand font-black text-sm px-8 py-3.5 rounded-md shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              {t("home.offerCta")} →
            </Link>
            <p className="text-white/70 text-[11px] mt-2">{t("home.offerHint")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
