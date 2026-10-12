"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  UtensilsCrossed,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  Check,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useRestaurant } from "@/context/RestaurantContext";
import Button from "@/components/common/Button";

interface Slide {
  key: string;
  icon: LucideIcon;
  image: string;
}

/** 3-step dokan story: order → ranna → poribeshon. Left content, right image (main focus). */
const SLIDES: Slide[] = [
  {
    key: "s1",
    icon: ClipboardList,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "s2",
    icon: UtensilsCrossed,
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "s3",
    icon: ReceiptText,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
];

const AUTOPLAY_MS = 5500;

export default function HeroSlider() {
  const { t } = useLang();
  const { config } = useRestaurant();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    setIdx((n + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  const slide = SLIDES[idx];
  const Icon = slide.icon;

  return (
    <section
      className="text-left"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* ---- left: pure content ---- */}
        <div key={slide.key} className="animate-[heroIn_.45s_ease]">
          <p className="inline-flex items-center gap-2 bg-brand/10 text-brand text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-brand/20">
            <Icon className="w-3.5 h-3.5" />
            {t(`home.${slide.key}tag`)}
          </p>
          <p className="text-xs font-black tracking-widest uppercase text-muted mt-4">{config.name}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mt-1">
            {t(`home.${slide.key}tA`)} <span className="text-brand">{t(`home.${slide.key}tB`)}</span>
          </h1>
          <p className="text-muted text-sm mt-3 max-w-md">{t(`home.${slide.key}sub`)}</p>

          <ul className="mt-4 space-y-2">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-center gap-2 text-sm font-bold">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent inline-flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                {t(`home.${slide.key}p${n}`)}
              </li>
            ))}
          </ul>

          {/* public CTA — menu + call */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/menu">
              <Button variant="primary" className="px-8" icon={<UtensilsCrossed className="w-4 h-4" />}>
                {t("home.menuBtn")}
              </Button>
            </Link>
            {config.phone && (
              <a href={`tel:${config.phone.replace(/\s/g, "")}`}>
                <Button variant="secondary" className="px-8" icon={<Phone className="w-4 h-4" />}>
                  {t("home.callBtn")} • {config.phone}
                </Button>
              </a>
            )}
          </div>

          {/* dots + counter */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex gap-1.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.key}
                  aria-label={`slide ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === idx ? "w-8 bg-brand" : "w-3 bg-card-border hover:bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-black text-muted">
              {idx + 1} / {SLIDES.length}
            </span>
          </div>
        </div>

        {/* ---- right: image main focus ---- */}
        <div className="relative">
          <div className="absolute -inset-4 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-card-border shadow-2xl">
            <img
              key={slide.image}
              src={slide.image}
              alt={t(`home.${slide.key}tag`)}
              className="w-full h-[280px] sm:h-[340px] lg:h-[420px] object-cover animate-[heroIn_.45s_ease]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-food.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
            {/* floating chips */}
            <span className="absolute top-4 right-4 bg-card-bg/90 glass-effect border border-card-border text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
              {t(`home.${slide.key}f1`)}
            </span>
            <span className="absolute bottom-4 left-4 bg-brand text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
              {t(`home.${slide.key}f2`)}
            </span>
          </div>

          {/* arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 sm:-left-5 flex flex-col gap-2">
            <button
              aria-label="prev"
              onClick={() => go(idx - 1)}
              className="w-9 h-9 rounded-full bg-card-bg/90 glass-effect border border-card-border shadow-lg inline-flex items-center justify-center hover:border-brand/50 hover:text-brand cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 sm:-right-5 flex flex-col gap-2">
            <button
              aria-label="next"
              onClick={() => go(idx + 1)}
              className="w-9 h-9 rounded-full bg-card-bg/90 glass-effect border border-card-border shadow-lg inline-flex items-center justify-center hover:border-brand/50 hover:text-brand cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes heroIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
    </section>
  );
}
