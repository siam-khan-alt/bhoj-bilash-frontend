"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { getPackages, effectivePrice } from "@/lib/api/packages";
import { getFoods } from "@/lib/api/food";
import { getAllOrders } from "@/lib/api/orders";
import { getBestSellers, getPopularDrinks, type BestSeller } from "@/lib/bestsellers";
import type { Package, Food } from "@/types";
import BestSellers from "@/components/home/BestSellers";
import PopularDrinks from "@/components/home/PopularDrinks";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import OfferBanner from "@/components/home/OfferBanner";
import Gallery from "@/components/home/Gallery";
import Reviews from "@/components/home/Reviews";
import OpeningHours from "@/components/home/OpeningHours";
import VisitUs from "@/components/home/VisitUs";
import { Package as PkgIcon, BadgePercent } from "lucide-react";

/** Public home — hero slider (order → ranna → poribeshon), niche best-seller + package/offer. Staff login navbar-এ। */
export default function HomePage() {
  const { t } = useLang();
  const [packages, setPackages] = useState<Package[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [best, setBest] = useState<BestSeller[]>([]);
  const [drinks, setDrinks] = useState<BestSeller[]>([]);

  useEffect(() => {
    getPackages(true).then(setPackages).catch(() => {});
    Promise.all([getFoods(), getAllOrders().catch(() => [])])
      .then(([f, orders]) => {
        setFoods(f);
        setBest(getBestSellers(f, orders, 8));
        setDrinks(getPopularDrinks(f, orders, 4));
      })
      .catch(() => {});
  }, []);

  const foodName = (id: string) => foods.find((f) => f._id === id)?.name || "item";

  return (
    <div className="container mx-auto px-6 lg:px-16 py-10 lg:py-16">
      <HeroSlider />

      <CategoryShowcase foods={foods} />

      <BestSellers items={best} />

      <PopularDrinks items={drinks} />

      <OfferBanner packages={packages} foods={foods} />

      {packages.length > 0 && (
        <div className="mt-16 text-left">
          <div className="text-center mb-6">
            <p className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-red-500/20">
              <BadgePercent className="w-4 h-4" /> {t("home.pkgTag")}
            </p>
            <h2 className="text-2xl font-black mt-3">{t("home.pkgA")} <span className="text-brand">{t("home.pkgB")}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((p) => {
              const hasOffer = p.offerPrice && Number(p.offerPrice) > 0;
              return (
                <div key={p._id} className="bg-card-bg border border-card-border rounded-lg overflow-hidden text-left">
                  <img src={p.image || "/placeholder-food.png"} alt={p.name} className="w-full h-36 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-food.png"; }} />
                  <div className="p-5">
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
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted mt-4">{t("home.pkgHint")}</p>
        </div>
      )}

      <Gallery foods={foods} />

      <Reviews />

      <OpeningHours />

      <VisitUs />
    </div>
  );
}
