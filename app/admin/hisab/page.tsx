"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getAllOrders } from "@/lib/api/orders";
import { getExpenses } from "@/lib/api/expenses";
import { getSalaryPayments } from "@/lib/api/salary";
import { getStaff } from "@/lib/api/staff";
import { getAttendanceByMonth } from "@/lib/api/attendance";
import { monthPayable } from "@/lib/salary";
import type { Order, Expense, SalaryPayment, StaffMember } from "@/types";
import Link from "next/link";
import Button from "@/components/common/Button";
import { useLang } from "@/context/LanguageContext";

const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function HisabPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalary] = useState<SalaryPayment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/admin/pos");
  }, [user, router]);

  useEffect(() => {
    (async () => {
      const m = thisMonth();
      const [o, e, s, st, a] = await Promise.all([getAllOrders(), getExpenses(), getSalaryPayments(m), getStaff(), getAttendanceByMonth(m)]);
      setOrders(o);
      setExpenses(e);
      setSalary(s);
      setStaff(st.filter((x) => x.active));
      setAtt(a);
    })();
  }, []);

  const [att, setAtt] = useState<import("@/types").Attendance[]>([]);

  if (user?.role !== "admin") return <p className="text-muted font-bold">{t("c.noAccess")}</p>;

  const tday = today();
  const m = thisMonth();
  const paidOrders = (list: Order[]) => list.filter((o) => o.paymentStatus === "paid");

  const todaySale = paidOrders(orders).filter((o) => o.createdAt.slice(0, 10) === tday).reduce((s, o) => s + o.totalAmount, 0);
  const todayChar = paidOrders(orders).filter((o) => o.createdAt.slice(0, 10) === tday).reduce((s, o) => s + (o.discount || 0), 0);
  const todayExp = expenses.filter((e) => e.date === tday && e.category !== "salary").reduce((s, e) => s + e.amount, 0);
  const todaySal = salary.filter((p) => p.date === tday).reduce((s, p) => s + p.amount, 0);
  const todayCash = todaySale - todayExp - todaySal;

  const monthSale = paidOrders(orders).filter((o) => o.createdAt.startsWith(m)).reduce((s, o) => s + o.totalAmount, 0);
  const monthChar = paidOrders(orders).filter((o) => o.createdAt.startsWith(m)).reduce((s, o) => s + (o.discount || 0), 0);
  const monthExp = expenses.filter((e) => e.date.startsWith(m) && e.category !== "salary").reduce((s, e) => s + e.amount, 0);
  const monthSalPaid = salary.reduce((s, p) => s + p.amount, 0);
  const monthPayableTotal = staff.reduce((s, x) => s + monthPayable(x, att), 0);
  const monthDue = monthPayableTotal - monthSalPaid;
  const monthProfit = monthSale - monthExp - monthSalPaid;

  const cards = [
    { label: t("hi.sale"), value: `৳${todaySale}`, sub: t("hi.saleSub", { exp: todayExp, sal: todaySal, extra: todayChar > 0 ? t("hi.charPart", { amt: todayChar }) : "" }) },
    { label: t("hi.cash"), value: `৳${todayCash}`, sub: todayCash >= 0 ? t("hi.cashOk") : t("hi.cashBad"), hot: todayCash < 0 },
    { label: t("hi.monthSale"), value: `৳${monthSale}`, sub: t("hi.monthSaleSub", { exp: monthExp, sal: monthSalPaid, extra: monthChar > 0 ? t("hi.charPart", { amt: monthChar }) : "" }) },
    { label: t("hi.profit"), value: `৳${monthProfit}`, sub: t("hi.profitSub", { due: monthDue }), hot: monthProfit < 0 },
  ];

  return (
    <div>
      <h2 className="text-xl font-black mb-1">{t("hi.title")}</h2>
      <p className="text-xs text-muted mb-6">{t("hi.sub")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className={`bg-card-bg border rounded-lg p-5 ${c.hot ? "border-red-500/40" : "border-card-border"}`}>
            <p className="text-xs text-muted font-bold uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-black mt-1 ${c.hot ? "text-red-500" : "text-text-main"}`}>{c.value}</p>
            <p className="text-xs text-muted mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-lg p-5 mb-4">
        <h3 className="font-black text-sm mb-3">{t("hi.staffDue", { m })}</h3>
        <div className="space-y-2 text-sm">
          {staff.map((s) => {
            const pay = monthPayable(s, att);
            const paid = salary.filter((p) => p.staffId === s._id).reduce((x, p) => x + p.amount, 0);
            return (
              <div key={s._id} className="flex justify-between">
                <span>{s.name}</span>
                <span className="text-muted">{t("hi.paoa", { a: pay })} • {t("hi.deya", { b: paid })} • <b className={pay - paid > 0 ? "text-red-500" : "text-accent"}>{t("hi.baki", { c: pay - paid })}</b></span>
              </div>
            );
          })}
          {staff.length === 0 && <p className="text-xs text-muted">{t("hi.noStaff")}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/staff"><Button variant="secondary" className="text-xs">{t("hi.staffKhata")}</Button></Link>
        <Link href="/admin/attendance"><Button variant="secondary" className="text-xs">{t("hi.hajira")}</Button></Link>
        <Link href="/admin/expenses"><Button variant="secondary" className="text-xs">{t("hi.khoroc")}</Button></Link>
      </div>
    </div>
  );
}
