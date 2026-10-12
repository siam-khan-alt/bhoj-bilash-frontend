"use client";

import { useEffect, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { useLang } from "@/context/LanguageContext";
import { getFoods } from "@/lib/api/food";
import { getPackages, effectivePrice } from "@/lib/api/packages";
import type { Food, Package } from "@/types";
import { BadgePercent, Package as PkgIcon, MapPin, Phone } from "lucide-react";

/** Public menu — QR scan / customer: ajke ki ase + offer. No login. */
export default function PublicMenuPage() {
  const { config } = useRestaurant();
  const { t } = useLang();
  const [foods, setFoods] = useState<Food[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [cat, setCat] = useState("all");

  useEffect(() => {
    getFoods().then((f) => setFoods(f.filter((x) => x.available !== false))).catch(() => {});
    getPackages(true).then(setPackages).catch(() => {});
  }, []);

  const foodName = (id: string) => foods.find((f) => f._id === id)?.name || "item";
  const cats = ["all", ...new Set(foods.map((f) => f.category))];
  const shown = foods.filter((f) => (cat === "all" ? true : f.category === cat));

  return (
    <div className="container mx-auto px-6 lg:px-16 py-10">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-widest uppercase text-brand mb-2">{config.name}</p>
        <h1 className="text-3xl sm:text-4xl font-black">{t("menu.titleA")} <span className="text-brand">{t("menu.titleB")}</span></h1>
        <p className="text-muted text-sm mt-2">{t("menu.sub")}</p>
        {(config.address || config.phone) && (
          <p className="text-xs text-muted mt-2 flex items-center justify-center gap-3">
            {config.address && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{config.address}</span>}
            {config.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{config.phone}</span>}
          </p>
        )}
      </div>

      {packages.length > 0 && (
        <div className="mb-10">
          <p className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-red-500/20 mb-4">
            <BadgePercent className="w-4 h-4" /> {t("menu.pkgTag")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((p) => {
              const hasOffer = p.offerPrice && Number(p.offerPrice) > 0;
              return (
                <div key={p._id} className="bg-card-bg border border-card-border rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <PkgIcon className="w-4 h-4 text-brand" />
                    <p className="font-black flex-1">{p.name}</p>
                    {hasOffer && p.offerNote && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white uppercase">{p.offerNote}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mb-3">{p.items.map((it) => `${foodName(it.foodId)} x${it.qty}`).join(" + ")}</p>
                  <p className="font-black">
                    {hasOffer && <span className="text-sm text-muted line-through mr-2">৳{p.price}</span>}
                    <span className="text-brand text-xl">৳{effectivePrice(p)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-xs font-black border ${cat === c ? "bg-brand text-white border-brand" : "bg-card-bg border-card-border text-muted"}`}>
            {c === "all" ? t("menu.all") : c}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-muted">{t("menu.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shown.map((f) => (
            <div key={f._id} className="bg-card-bg border border-card-border rounded-lg p-3">
              <img src={f.image || "/placeholder-food.png"} alt={f.name} className="w-full h-28 object-cover rounded-md mb-2" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-food.png"; }} />
              <p className="font-bold text-sm">{f.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] text-muted">{f.category}</span>
                <span className="font-black text-brand">৳{f.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-center text-xs text-muted mt-8">{t("menu.note")}</p>
    </div>
  );
}
