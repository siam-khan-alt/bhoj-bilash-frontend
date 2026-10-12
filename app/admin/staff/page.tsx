"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getStaff, addStaff, updateStaff, deleteStaff } from "@/lib/api/staff";
import { getSalaryPayments, paySalary } from "@/lib/api/salary";
import { getAttendanceByMonth } from "@/lib/api/attendance";
import { getOptions, optionLabel } from "@/lib/api/options";
import { monthPayable, countByStatus } from "@/lib/salary";
import type { StaffMember, SalaryPayment, Attendance, OptionItem } from "@/types";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { showSuccess, showError, showConfirm } from "@/components/common/Toast";
import { useLang } from "@/context/LanguageContext";
import { Plus, Trash2, Wallet, Eye } from "lucide-react";
import Link from "next/link";

const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function StaffPage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [jobOpts, setJobOpts] = useState<OptionItem[]>([]);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", job: "helper", phone: "", monthlySalary: "" });
  const [paying, setPaying] = useState<StaffMember | null>(null);
  const [payAmt, setPayAmt] = useState("");
  const [payNote, setPayNote] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/admin/pos");
  }, [user, router]);

  const fetchAll = async () => {
    const [s, p, a] = await Promise.all([getStaff(), getSalaryPayments(month), getAttendanceByMonth(month)]);
    setStaff(s);
    setPayments(p);
    setAttendance(a);
  };

  useEffect(() => {
    fetchAll();
    getOptions("staff_job", true).then((rows) => {
      setJobOpts(rows);
      setForm((f) => (rows.some((r) => r.value === f.job) ? f : { ...f, job: rows[0]?.value ?? f.job }));
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  if (user?.role !== "admin") return <p className="text-muted font-bold">{t("c.noAccess")}</p>;

  const paidFor = (id: string) => payments.filter((p) => p.staffId === id).reduce((s, p) => s + p.amount, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStaff({ name: form.name, job: form.job, phone: form.phone, monthlySalary: Number(form.monthlySalary) });
      showSuccess(t("staff.added"));
      setShowForm(false);
      setForm({ name: "", job: "helper", phone: "", monthlySalary: "" });
      fetchAll();
    } catch (err) {
      showError(t((err as Error).message));
    }
  };

  const handlePay = async () => {
    if (!paying) return;
    try {
      await paySalary({ staffId: paying._id, month, amount: Number(payAmt), note: payNote });
      showSuccess(t("staff.paidTo", { name: paying.name, amt: payAmt }));
      setPaying(null);
      setPayAmt("");
      setPayNote("");
      fetchAll();
    } catch (err) {
      showError(t((err as Error).message));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <h2 className="text-xl font-black">{t("staff.title")}</h2>
        <div className="flex gap-2 items-center">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 rounded-md border border-card-border bg-bg-main text-sm" />
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>{t("staff.addBtn")}</Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card-bg border border-card-border rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label={t("staff.name")} name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted">{t("staff.job")}</label>
            <select value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-md bg-bg-main border border-card-border outline-none">
              {jobOpts.map((j) => (
                <option key={j._id} value={j.value}>{optionLabel(jobOpts, j.value, lang)}</option>
              ))}
            </select>
          </div>
          <Input label={t("staff.phone")} name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label={t("staff.salary")} type="number" name="monthlySalary" value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} required />
          <div className="sm:col-span-2 flex gap-3">
            <Button type="submit" variant="primary">{t("c.save")}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>{t("c.cancel")}</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {staff.filter((s) => s.active).map((s) => {
          const payable = monthPayable(s, attendance);
          const paid = paidFor(s._id);
          const due = payable - paid;
          const c = countByStatus(attendance, s._id);
          return (
            <div key={s._id} className="bg-card-bg border border-card-border rounded-lg p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-black">{s.name}</p>
                  <p className="text-xs text-muted">{optionLabel(jobOpts, s.job, lang)} • {s.phone} • {t("staff.beton")} ৳{s.monthlySalary}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => showConfirm(t("staff.archConfirm", { name: s.name }), async () => { await updateStaff(s._id, { active: false }); fetchAll(); })} className="text-xs text-muted hover:text-red-500 px-2 py-1">{t("c.off")}</button>
                  <button onClick={() => showConfirm(t("staff.deleteConfirm", { name: s.name }), async () => { await deleteStaff(s._id); showSuccess(t("staff.deleted")); fetchAll(); })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-xs text-muted mb-3">{t("staff.hajira")}: P:{c.present} H:{c.half} A:{c.absent} L:{c.leave} → {t("staff.paoa")}: <b className="text-text-main">৳{payable}</b> • {t("staff.deya")}: <b className="text-accent">৳{paid}</b> • {t("staff.baki")}: <b className={due > 0 ? "text-red-500" : "text-accent"}>৳{due}</b>{due < 0 ? <span className="text-accent"> {t("staff.advance")}</span> : ""}</p>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 justify-center text-xs" icon={<Wallet className="w-3.5 h-3.5" />} onClick={() => { setPaying(s); setPayAmt(String(Math.max(due, 0))); setPayNote(""); }}>
                  {t("staff.payBtn")}
                </Button>
                <Link href={`/admin/staff/${s._id}?month=${month}`}>
                  <Button variant="secondary" className="justify-center text-xs" icon={<Eye className="w-3.5 h-3.5" />}>
                    {t("staff.details")}
                  </Button>
                </Link>
              </div>
              {payments.filter((p) => p.staffId === s._id).length > 0 && (
                <div className="mt-3 text-xs space-y-1">
                  {payments.filter((p) => p.staffId === s._id).map((p) => (
                    <p key={p._id} className="text-muted">৳{p.amount} — {p.date} {p.note ? `• ${p.note}` : ""}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {staff.filter((s) => s.active).length === 0 && <p className="text-muted text-center mt-8">{t("staff.empty")}</p>}

      {paying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setPaying(null)}>
          <div className="w-full max-w-sm bg-card-bg border border-card-border rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black mb-1">{t("staff.payTitle", { name: paying.name })}</h3>
            <p className="text-xs text-muted mb-4">{t("staff.payMonth", { month })}</p>
            <Input label={t("staff.payAmt")} type="number" name="amt" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} required />
            <Input label={t("staff.payNote")} name="note" value={payNote} onChange={(e) => setPayNote(e.target.value)} />
            <div className="flex gap-2 mt-4">
              <Button variant="primary" className="flex-1 justify-center" onClick={handlePay}>{t("c.confirm")}</Button>
              <Button variant="secondary" onClick={() => setPaying(null)}>{t("c.cancel")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
