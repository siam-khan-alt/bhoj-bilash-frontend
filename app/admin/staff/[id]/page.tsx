"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getStaff, updateStaff } from "@/lib/api/staff";
import { getSalaryPayments, paySalary } from "@/lib/api/salary";
import { getAttendanceByMonth, workHours } from "@/lib/api/attendance";
import { getOptions, optionLabel } from "@/lib/api/options";
import { monthPayable, countByStatus, perDaySalary } from "@/lib/salary";
import type { StaffMember, SalaryPayment, Attendance, AttendanceStatus, OptionItem } from "@/types";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { showSuccess, showError } from "@/components/common/Toast";
import { useLang } from "@/context/LanguageContext";
import {
  ArrowLeft,
  Wallet,
  Banknote,
  CalendarCheck,
  Clock,
  Phone,
  Briefcase,
  Pencil,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  half: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  leave: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  absent: "bg-red-500/10 text-red-500 border-red-500/20",
};

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  half: "bg-amber-500",
  leave: "bg-blue-500",
  absent: "bg-red-500",
};

const JOB_STYLE: Record<string, string> = {
  baburchi: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  helper: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  cashier: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  other: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export default function StaffDetailsPage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [month, setMonth] = useState(search.get("month") || currentMonth());
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [jobOpts, setJobOpts] = useState<OptionItem[]>([]);
  const [monthAtt, setMonthAtt] = useState<Attendance[]>([]);
  const [monthPay, setMonthPay] = useState<SalaryPayment[]>([]);
  const [allPay, setAllPay] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const [payAmt, setPayAmt] = useState("");
  const [payNote, setPayNote] = useState("");
  const [paying, setPaying] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", monthlySalary: "", job: "" });

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/admin/pos");
  }, [user, router]);

  const fetchAll = async (m: string) => {
    setLoading(true);
    try {
      const [list, att, mp, ap] = await Promise.all([
        getStaff(),
        getAttendanceByMonth(m),
        getSalaryPayments(m),
        getSalaryPayments(),
      ]);
      const found = list.find((s) => s._id === id) || null;
      setStaff(found);
      setMonthAtt(att);
      setMonthPay(mp);
      setAllPay(ap);
      if (found) setEditForm({ phone: found.phone, monthlySalary: String(found.monthlySalary), job: found.job });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(month);
    getOptions("staff_job", true).then(setJobOpts).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, month]);

  const data = useMemo(() => {
    if (!staff) return null;
    const c = countByStatus(monthAtt, staff._id);
    const payable = monthPayable(staff, monthAtt);
    const paid = monthPay.reduce((s, p) => s + (p.staffId === staff._id ? p.amount : 0), 0);
    const due = payable - paid;
    const perDay = Math.round(perDaySalary(staff.monthlySalary));
    const effective = c.present + c.half * 0.5;
    const mine = monthAtt
      .filter((a) => a.staffId === staff._id && a.date.startsWith(month))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    const history = allPay.filter((p) => p.staffId === staff._id).sort((a, b) => (a.date < b.date ? 1 : -1));
    const totalPaidAll = history.reduce((s, p) => s + p.amount, 0);
    let totH = 0;
    let hDays = 0;
    mine.forEach((a) => {
      const h = workHours(a.inTime, a.outTime);
      if (h !== null) {
        totH += h;
        hDays += 1;
      }
    });
    return { c, payable, paid, due, perDay, effective, mine, history, totalPaidAll, totH, hDays };
  }, [staff, monthAtt, monthPay, allPay, month]);

  // ---- calendar grid ----
  const calendar = useMemo(() => {
    const [yy, mm] = month.split("-").map(Number);
    if (!yy || !mm) return null;
    const daysInMonth = new Date(yy, mm, 0).getDate();
    const firstWeekday = new Date(yy, mm - 1, 1).getDay(); // 0=Sun
    const byDate: Record<string, Attendance | undefined> = {};
    data?.mine.forEach((a) => {
      byDate[a.date] = a;
    });
    const cells: ({ day: number | null; date: string | null } | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${month}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date });
    }
    return { daysInMonth, firstWeekday, byDate, cells };
  }, [month, data]);

  if (user?.role !== "admin") return <p className="text-muted font-bold">{t("c.noAccess")}</p>;

  if (loading)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-card-bg rounded-md" />
        <div className="h-40 bg-card-bg border border-card-border rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card-bg border border-card-border rounded-lg" />
          ))}
        </div>
      </div>
    );

  if (!staff || !data)
    return (
      <div className="text-center py-16">
        <p className="font-black text-lg mb-2">{t("sd.notFound")}</p>
        <p className="text-sm text-muted mb-6">{t("sd.notFoundSub")}</p>
        <Link href="/admin/staff">
          <Button variant="secondary" className="text-xs">{t("sd.backList")}</Button>
        </Link>
      </div>
    );

  const { c, payable, paid, due, perDay, effective, mine, history, totalPaidAll, totH, hDays } = data;
  const totalDays = c.present + c.half + c.absent + c.leave;
  const attendanceRate = calendar ? Math.round(((c.present + c.half * 0.5) / calendar.daysInMonth) * 100) : 0;

  const handlePay = async () => {
    try {
      setPaying(true);
      await paySalary({ staffId: staff._id, month, amount: Number(payAmt), note: payNote });
      showSuccess(t("staff.paidTo", { name: staff.name, amt: payAmt }));
      setPayAmt("");
      setPayNote("");
      fetchAll(month);
    } catch (err) {
      showError(t((err as Error).message));
    } finally {
      setPaying(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateStaff(staff._id, {
        phone: editForm.phone.trim(),
        job: editForm.job.trim() || staff.job,
        monthlySalary: Number(editForm.monthlySalary),
      });
      setStaff(updated);
      setEditing(false);
      showSuccess(t("staff.saved"));
      fetchAll(month);
    } catch (err) {
      showError(t((err as Error).message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* breadcrumb */}
      <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
        <div className="flex items-center gap-2 text-xs text-muted font-bold">
          <Link href="/admin/staff" className="flex items-center gap-1 hover:text-brand transition">
            <ArrowLeft className="w-3.5 h-3.5" /> {t("sd.back")}
          </Link>
          <span>/</span>
          <span className="text-text-main">{staff.name}</span>
          <span className="hidden sm:inline">• {month}</span>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="px-3 py-2 rounded-md border border-card-border bg-card-bg text-sm font-bold outline-none"
        />
      </div>

      {/* profile header */}
      <section className="bg-card-bg border border-card-border rounded-lg p-5 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-brand/10 text-brand font-black flex items-center justify-center text-2xl shrink-0">
            {staff.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black">{staff.name}</h1>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${JOB_STYLE[staff.job] || JOB_STYLE.other}`}>
                {optionLabel(jobOpts, staff.job, lang)}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${staff.active ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                {staff.active ? t("c.active") : t("c.off")}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted font-bold">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {staff.phone || "—"}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {t("sd.betonMonth", { amt: staff.monthlySalary })}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t("sd.perDay", { amt: perDay })}</span>
              <span>{t("sd.joined", { date: staff.createdAt.slice(0, 10) })}</span>
            </div>
          </div>
          <Button variant="secondary" className="text-xs shrink-0" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setEditing(!editing)}>
            {editing ? t("sd.editClose") : t("sd.edit")}
          </Button>
        </div>

        {editing && (
          <form onSubmit={handleEdit} className="mt-4 pt-4 border-t border-card-border grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input label={t("staff.phone")} name="phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <div>
              <label className="text-sm font-bold text-text-main block mb-1.5">{t("staff.job")}</label>
              <select value={editForm.job} onChange={(e) => setEditForm({ ...editForm, job: e.target.value })} className="w-full px-4 py-3 rounded-md bg-bg-main border border-card-border outline-none text-sm">
                {jobOpts.map((j) => (
                  <option key={j._id} value={j.value}>{optionLabel(jobOpts, j.value, lang)}</option>
                ))}
              </select>
            </div>
            <Input label={t("staff.salary")} type="number" name="monthlySalary" value={editForm.monthlySalary} onChange={(e) => setEditForm({ ...editForm, monthlySalary: e.target.value })} required />
            <div className="flex items-end">
              <Button type="submit" variant="primary" className="w-full justify-center text-xs">{t("c.save")}</Button>
            </div>
          </form>
        )}
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Wallet className="w-4 h-4" />
            <p className="text-[11px] font-black uppercase tracking-wide">{t("sd.kPaoa")} ({month})</p>
          </div>
          <p className="text-2xl font-black">৳{payable}</p>
          <p className="text-[11px] text-muted font-bold mt-1">{t("sd.effLine", { n: effective, per: perDay })}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Banknote className="w-4 h-4" />
            <p className="text-[11px] font-black uppercase tracking-wide">{t("sd.kDeya")}</p>
          </div>
          <p className="text-2xl font-black text-accent">৳{paid}</p>
          <p className="text-[11px] text-muted font-bold mt-1">{t("sd.allMonth", { amt: totalPaidAll })}</p>
        </div>
        <div className={`bg-card-bg border rounded-lg p-4 sm:p-5 ${due > 0 ? "border-red-500/40" : "border-card-border"}`}>
          <div className="flex items-center gap-2 text-muted mb-1">
            {due > 0 ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-accent" />}
            <p className="text-[11px] font-black uppercase tracking-wide">{t("sd.kBaki")}</p>
          </div>
          <p className={`text-2xl font-black ${due > 0 ? "text-red-500" : "text-accent"}`}>৳{due}</p>
          <p className="text-[11px] text-muted font-bold mt-1">{due > 0 ? t("sd.bakiDue") : due < 0 ? t("sd.bakiAdv") : t("sd.clear")}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted mb-1">
            <CalendarCheck className="w-4 h-4" />
            <p className="text-[11px] font-black uppercase tracking-wide">{t("sd.kRate")}</p>
          </div>
          <p className="text-2xl font-black">{attendanceRate}%</p>
          <p className="text-[11px] text-muted font-bold mt-1">{t("sd.countLine", { p: c.present, h: c.half, a: c.absent, l: c.leave })}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* left: calendar + table */}
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-card-bg border border-card-border rounded-lg p-5">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
              <h2 className="font-black text-sm">{t("sd.cal", { month })}</h2>
              <span className="text-[11px] text-muted font-bold">{t("sd.entryCount", { a: totalDays, b: calendar?.daysInMonth || 0 })} {hDays > 0 && `• ${t("sd.dutyTot", { h: Math.round(totH * 10) / 10, n: hDays })}`}</span>
            </div>
            <div className="h-2 rounded-full bg-bg-main overflow-hidden flex mb-4">
              <div className="bg-emerald-500 h-full" style={{ width: `${calendar ? (c.present / calendar.daysInMonth) * 100 : 0}%` }} />
              <div className="bg-amber-500 h-full" style={{ width: `${calendar ? (c.half / calendar.daysInMonth) * 100 : 0}%` }} />
              <div className="bg-blue-500 h-full" style={{ width: `${calendar ? (c.leave / calendar.daysInMonth) * 100 : 0}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${calendar ? (c.absent / calendar.daysInMonth) * 100 : 0}%` }} />
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <p key={d} className="text-center text-[10px] font-black uppercase text-muted">{d}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendar?.cells.map((cell, i) => {
                if (!cell || !cell.date) return <div key={i} />;
                const a = calendar.byDate[cell.date];
                return (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${a ? `${t(`st.${a.status}`)}${a.inTime ? ` (${a.inTime}→${a.outTime || "…"})` : ""}` : t("sd.noEntryTip")}`}
                    className={`rounded-md border p-1.5 min-h-[52px] flex flex-col justify-between transition ${a ? STATUS_STYLE[a.status] : "bg-bg-main border-card-border"}`}
                  >
                    <span className={`text-[11px] font-black ${a ? "" : "text-muted/50"}`}>{cell.day}</span>
                    {a && <span className={`w-2 h-2 rounded-full ${STATUS_DOT[a.status]}`} />}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-[11px] font-bold text-muted">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {t("st.optPresent")}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> {t("st.optHalf")}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> {t("st.optLeave")}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {t("st.optAbsent")}</span>
            </div>
          </section>

          <section className="bg-card-bg border border-card-border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-5 pt-4 pb-2">
              <h2 className="font-black text-sm">{t("sd.log", { n: mine.length })}</h2>
              <Link href="/admin/attendance" className="text-[11px] font-black text-brand hover:underline">{t("sd.hajiraLink")}</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-bg-main text-muted text-left">
                  <tr>
                    <th className="p-3 text-xs">{t("sd.thDate")}</th>
                    <th className="p-3 text-xs">{t("sd.thStatus")}</th>
                    <th className="p-3 text-xs">{t("sd.thIn")}</th>
                    <th className="p-3 text-xs">{t("sd.thOut")}</th>
                    <th className="p-3 text-xs text-right">{t("sd.thDuty")}</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((a) => {
                    const h = workHours(a.inTime, a.outTime);
                    return (
                      <tr key={a._id} className="border-t border-card-border">
                        <td className="p-3 font-bold text-xs">{a.date}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${STATUS_STYLE[a.status]}`}>{t(`st.${a.status}`)}</span>
                        </td>
                        <td className="p-3 font-bold text-xs">{a.inTime || "—"}</td>
                        <td className="p-3 font-bold text-xs">{a.outTime || "—"}</td>
                        <td className="p-3 text-xs font-bold text-muted text-right">{h !== null ? `${h}h` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {mine.length === 0 && <p className="text-center text-muted py-8 text-xs">{t("sd.noHajira")}</p>}
            </div>
          </section>
        </div>

        {/* right: pay + history */}
        <div className="space-y-4">
          <section className="bg-card-bg border border-card-border rounded-lg p-5">
            <h2 className="font-black text-sm mb-1">{t("sd.payTitle")}</h2>
            <p className="text-[11px] text-muted mb-3">{t("sd.paySub", { month, due })}</p>
            <div className="space-y-3">
              <Input label={t("sd.payAmt")} type="number" name="amt" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} placeholder={String(Math.max(due, 0))} />
              <Input label={t("sd.payNote")} name="note" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder={t("sd.payNotePh")} />
              <Button variant="primary" className="w-full justify-center text-xs" disabled={paying} onClick={handlePay}>
                {paying ? t("sd.paying") : t("sd.payConfirm")}
              </Button>
              <div className="flex gap-2">
                {[1000, 2000, 5000].map((v) => (
                  <button key={v} onClick={() => setPayAmt(String(v))} className="flex-1 text-[11px] font-black py-2 rounded-md border border-card-border bg-bg-main hover:border-brand/40 transition">
                    ৳{v}
                  </button>
                ))}
                <button onClick={() => setPayAmt(String(Math.max(due, 0)))} className="flex-1 text-[11px] font-black py-2 rounded-md border border-brand/30 bg-brand/5 text-brand transition">
                  {t("sd.fullDue")}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-card-bg border border-card-border rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-sm">{t("sd.payHist", { n: history.length })}</h2>
              <span className="text-[11px] font-black text-accent">{t("sd.totalPaid", { amt: totalPaidAll })}</span>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {history.length === 0 && <p className="text-[11px] text-muted">{t("sd.noPay")}</p>}
              {history.map((p) => (
                <div key={p._id} className="rounded-md bg-bg-main border border-card-border p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-black text-sm">৳{p.amount}</p>
                    <p className="text-[11px] text-muted font-bold">{p.date}</p>
                  </div>
                  <p className="text-[11px] text-muted font-bold mt-0.5">{p.month} {p.note ? `• ${p.note}` : ""}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-bg-main border border-card-border rounded-lg p-4">
            <p className="text-[11px] font-black uppercase text-muted mb-1">{t("sd.ruleTitle")}</p>
            <p className="text-[11px] text-muted leading-relaxed">
              {t("sd.ruleBody")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
