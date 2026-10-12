"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  UtensilsCrossed,
  Wallet,
  Calculator,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { getAllOrders } from "@/lib/api/orders";
import { getExpenses } from "@/lib/api/expenses";
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
      label: "Ajker sale",
      value: `৳${stats.todayRevenue}`,
      sub: `${stats.todayOrders} ta paid order`,
      icon: DollarSign,
      tone: "text-brand bg-brand/10",
      href: "/admin/orders",
      link: "Orders dekhun",
    },
    {
      label: "Ajker khoroc",
      value: `৳${stats.todayExpense}`,
      sub: `${stats.todayExpCount} ta entry`,
      icon: Wallet,
      tone: "text-red-500 bg-red-500/10",
      href: "/admin/expenses",
      link: "Khoroc dekhun",
    },
    {
      label: "Ajker cash (hate)",
      value: `৳${cash}`,
      sub: cash >= 0 ? "Sale − khoroc • hisab milse" : "Minus! check korun",
      icon: Calculator,
      tone: "text-accent bg-accent/10",
      hot: cash < 0,
      href: "/admin/hisab",
      link: "Hisab dekhun",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: "Sob somoy miliye",
      icon: ShoppingBag,
      tone: "text-brand bg-brand/10",
      href: "/admin/orders",
      link: "Orders dekhun",
    },
    {
      label: "Total Revenue",
      value: `৳${stats.totalRevenue}`,
      sub: "Paid orders total",
      icon: DollarSign,
      tone: "text-accent bg-accent/10",
      href: "/admin/hisab",
      link: "Hisab dekhun",
    },
    {
      label: "Food Items",
      value: stats.totalFoods,
      sub: `${stats.availFoods} ta menu te available`,
      icon: UtensilsCrossed,
      tone: "text-blue-500 bg-blue-500/10",
      href: "/admin/foods",
      link: "Foods manage",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-1">
        <div>
          <h2 className="text-xl font-black text-text-main">Admin Overview</h2>
          <p className="text-xs text-muted mt-0.5">Ajker dokan ek nojore — bill banate POS e jan.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/pos">
            <Button variant="primary" className="text-xs" icon={<ShoppingCart className="w-4 h-4" />}>
              POS Terminal
              <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">BILL</span>
            </Button>
          </Link>
          <Link href="/admin/hisab">
            <Button variant="secondary" className="text-xs">Full Hisab dekhun</Button>
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
