"use client";

import { useRef } from "react";
import Link from "next/link";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { isPlainWater } from "@/lib/bestsellers";
import type { Food } from "@/types";

/** Food photo strip — real menu images, scroll + arrow, tap → /menu. Pani bad. */
export default function Gallery({ foods }: { foods: Food[] }) {
  const { t } = useLang();
  const rowRef = useRef<HTMLDivElement>(null);
  const photos = foods.filter((f) => f.available !== false && !isPlainWater(f) && f.image && !f.image.includes("placeholder"));
  if (photos.length === 0) return null;

  const scrollBy = (dir: number) => {
    rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="mt-16">
      <div className="text-center mb-6">
        <p className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-500 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-purple-500/20">
          <Camera className="w-4 h-4" /> {t("home.galTag")}
        </p>
        <h2 className="text-2xl font-black mt-3">
          {t("home.galA")} <span className="text-brand">{t("home.galB")}</span>
        </h2>
        <p className="text-muted text-xs mt-1">{t("home.galSub")}</p>
      </div>

      <div className="relative">
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1"
        >
          {photos.map((f) => (
            <Link
              key={f._id}
              href="/menu"
              className="group relative shrink-0 w-56 sm:w-64 h-40 sm:h-48 rounded-lg overflow-hidden border border-card-border snap-start"
            >
              <img
                src={f.image}
                alt={f.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-food.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
                <p className="font-black text-white text-sm truncate">{f.name}</p>
                <span className="font-black text-white text-sm shrink-0">৳{f.price}</span>
              </div>
            </Link>
          ))}
        </div>

        {photos.length > 3 && (
          <>
            <button
              aria-label="prev"
              onClick={() => scrollBy(-1)}
              className="hidden sm:inline-flex absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 rounded-full bg-card-bg/90 glass-effect border border-card-border shadow-lg items-center justify-center hover:border-brand/50 hover:text-brand cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              aria-label="next"
              onClick={() => scrollBy(1)}
              className="hidden sm:inline-flex absolute top-1/2 -translate-y-1/2 -right-4 w-9 h-9 rounded-full bg-card-bg/90 glass-effect border border-card-border shadow-lg items-center justify-center hover:border-brand/50 hover:text-brand cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
