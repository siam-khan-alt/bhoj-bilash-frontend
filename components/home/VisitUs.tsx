"use client";

import { MapPin, Phone, Navigation, Store, ShoppingBag, PiggyBank, Star } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useRestaurant } from "@/context/RestaurantContext";
import Button from "@/components/common/Button";

/** Closing CTA — thikana, phone, map + call. Sob config theke (real data). */
export default function VisitUs() {
  const { t } = useLang();
  const { config } = useRestaurant();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${config.name} ${config.address ?? ""}`
  )}`;

  const points = [
    { icon: Store, label: t("home.visitF1") },
    { icon: ShoppingBag, label: t("home.visitF2") },
    { icon: PiggyBank, label: t("home.visitF3") },
  ];

  return (
    <section className="mt-16">
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-10 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <p className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-accent/20">
            <MapPin className="w-4 h-4" /> {t("home.visitTag")}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mt-3">
            {t("home.visitA")} <span className="text-brand">{t("home.visitB")}</span>
          </h2>
          <p className="text-muted text-sm mt-2">{t("home.visitSub")}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {points.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1.5 text-xs font-bold border border-card-border rounded-full px-3 py-1.5"
              >
                <p.icon className="w-3.5 h-3.5 text-brand" />
                {p.label}
              </span>
            ))}
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500 hover:text-amber-600 mt-4"
          >
            <Star className="w-4 h-4" />
            {t("home.visitReview")} →
          </a>
        </div>

        <div className="space-y-3">
          {config.address && (
            <div className="flex items-center gap-3 border border-card-border rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-brand/10 text-brand inline-flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted">
                  {t("home.visitAddr")}
                </p>
                <p className="font-bold text-sm">{config.address}</p>
              </div>
              <a href={mapUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="px-4 py-2.5" icon={<Navigation className="w-4 h-4" />}>
                  {t("home.visitDir")}
                </Button>
              </a>
            </div>
          )}
          {config.phone && (
            <div className="flex items-center gap-3 border border-card-border rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-accent/10 text-accent inline-flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted">
                  {t("home.visitPhone")}
                </p>
                <p className="font-bold text-sm">{config.phone}</p>
              </div>
              <a href={`tel:${config.phone.replace(/\s/g, "")}`}>
                <Button variant="primary" className="px-4 py-2.5" icon={<Phone className="w-4 h-4" />}>
                  {t("home.callBtn")}
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
