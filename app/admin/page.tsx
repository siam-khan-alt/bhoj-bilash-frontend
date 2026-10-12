"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  UtensilsCrossed,
  Wallet,
  Calculator,
  ReceiptText,
  ArrowRight,
} from "lucide-react";
import { getAllOrders } from "@/lib/api/orders";
import { getExpenses } from "@/lib/api/expenses";
import { useLang } from "@/context/LanguageContext";
import Button from "@/components/common/Button";

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalFoods: 0,
    availFoods: 0,
    todayRevenue: 0,
    todayOrders: 0,
    todayExpense: 0,
    todayExpCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orders, foods, expenses] = await Promise.all([
          getAllOrders(),
          (await import("@/lib/api/food")).getFoods(),
          getExpenses(),
        ]);
        const today = new Date().toISOString().slice(0, 10);
        const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
        const todayPaid = paidOrders.filter((o) => o.createdAt.slice(0, 10) === today);
        const todayExp = expenses.filter((e) => e.date === today);
        setStats({
          totalOrders: orders.length,
          totalRevenue: paidOrders.reduce((s, o) => s + o.totalAmount, 0),
          totalFoods: foods.length,
          availFoods: foods.filter((f) => f.available !== false).length,
          todayRevenue: todayPaid.reduce((s, o) => s + o.totalAmount, 0),
          todayOrders: todayPaid.length,
          todayExpense: todayExp.reduce((s, e) => s + e.amount, 0),
          todayExpCount: todayExp.length,
        });
      } catch (err) {
        console.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div>
        <div className="h-8 w-48 bg-card-bg border border-card-border rounded-md mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-card-bg border border-card-border rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );

  const cash = stats.todayRevenue - stats.todayExpense;

  const cards = [
    {
      label: t("ov.sale"),
      value: `৳${stats.todayRevenue}`,
      sub: t("ov.saleSub", { n: stats.todayOrders }),
      icon: DollarSign,
      tone: "text-brand bg-brand/10",
      href: "/admin/orders",
      link: t("ov.viewOrders"),
    },
    {
      label: t("ov.exp"),
      value: `৳${stats.todayExpense}`,
      sub: t("ov.expSub", { n: stats.todayExpCount }),
      icon: Wallet,
      tone: "text-red-500 bg-red-500/10",
      href: "/admin/expenses",
      link: t("ov.viewExp"),
    },
    {
      label: t("ov.cash"),
      value: `৳${cash}`,
      sub: cash >= 0 ? t("ov.cashOk") : t("ov.cashBad"),
      icon: Calculator,
      tone: "text-accent bg-accent/10",
      hot: cash < 0,
      href: "/admin/hisab",
      link: t("ov.viewHisab"),
    },
    {
      label: t("ov.orders"),
      value: stats.totalOrders,
      sub: t("ov.ordersSub"),
      icon: ShoppingBag,
      tone: "text-brand bg-brand/10",
      href: "/admin/orders",
      link: t("ov.viewOrders"),
    },
    {
      label: t("ov.rev"),
      value: `৳${stats.totalRevenue}`,
      sub: t("ov.revSub"),
      icon: DollarSign,
      tone: "text-accent bg-accent/10",
      href: "/admin/hisab",
      link: t("ov.viewHisab"),
    },
    {
      label: t("ov.foods"),
      value: stats.totalFoods,
      sub: t("ov.foodsSub", { n: stats.availFoods }),
      icon: UtensilsCrossed,
      tone: "text-blue-500 bg-blue-500/10",
      href: "/admin/foods",
      link: t("ov.manageFoods"),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-1">
        <div>
          <h2 className="text-xl font-black text-text-main">{t("ov.title")}</h2>
          <p className="text-xs text-muted mt-0.5">{t("ov.sub")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/pos">
            <Button variant="primary" className="text-xs" icon={<ReceiptText className="w-4 h-4" />}>
              {t("ov.pos")}
              <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">BILL</span>
            </Button>
          </Link>
          <Link href="/admin/hisab">
            <Button variant="secondary" className="text-xs">{t("ov.hisab")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-card-bg border rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 ${
              card.hot ? "border-red-500/40" : "border-card-border hover:border-brand/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted font-bold uppercase tracking-wide">{card.label}</p>
              <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${card.tone}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-2xl font-black mt-1 ${card.hot ? "text-red-500" : "text-text-main"}`}>{card.value}</p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-xs text-muted">{card.sub}</p>
              <Link
                href={card.href}
                className="flex items-center gap-0.5 text-[11px] font-black text-brand hover:gap-1.5 transition-all shrink-0"
              >
                {card.link} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
