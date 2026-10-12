"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { useLang } from "@/context/LanguageContext";
import { getPackages, effectivePrice } from "@/lib/api/packages";
import { getFoods } from "@/lib/api/food";
import type { Package, Food } from "@/types";
import Button from "@/components/common/Button";
import { ReceiptText, ClipboardList, UtensilsCrossed, Package as PkgIcon, BadgePercent } from "lucide-react";

/** Choto hotel entry — login thakle admin e pathao, na thakle login. Niche public package/offer (marketing). */
export default function HomePage() {
  const { user } = useAuth();
  const { config } = useRestaurant();
  const { t } = useLang();
  const [packages, setPackages] = useState<Package[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    getPackages(true).then(setPackages);
    getFoods().then(setFoods).catch(() => {});
  }, []);

  const foodName = (id: string) => foods.find((f) => f._id === id)?.name || "item";

  return (
    <div className="container mx-auto px-6 lg:px-16 py-16 text-center">
      <p className="text-xs font-black tracking-widest uppercase text-brand mb-3">{config.name}</p>
      <h1 className="text-3xl sm:text-4xl font-black mb-3">
        {t("home.titleA")} <span className="text-brand">{t("home.titleB")}</span> {t("home.titleC")}
      </h1>
      <p className="text-muted text-sm max-w-md mx-auto mb-8">
        {t("home.sub")}
      </p>

      {user ? (
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/admin/pos">
            <Button variant="primary" icon={<ReceiptText className="w-4 h-4" />}>{t("home.pos")}</Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="secondary" icon={<ClipboardList className="w-4 h-4" />}>{t("home.orders")}</Button>
          </Link>
          {user.role === "admin" && (
            <Link href="/admin/foods">
              <Button variant="secondary" icon={<UtensilsCrossed className="w-4 h-4" />}>{t("home.foods")}</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/menu">
            <Button variant="primary" className="px-8">{t("home.menuBtn")}</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-8">{t("home.staffLogin")}</Button>
          </Link>
        </div>
      )}

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
                <div key={p._id} className="bg-card-bg border border-card-border rounded-lg p-5 text-left">
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
          <p className="text-center text-xs text-muted mt-4">{t("home.pkgHint")}</p>
        </div>
      )}
    </div>
  );
}
