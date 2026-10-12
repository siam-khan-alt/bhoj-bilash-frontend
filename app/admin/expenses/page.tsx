"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getExpenses, addExpense, deleteExpense, EXPENSE_CATEGORIES } from "@/lib/api/expenses";
import type { Expense, ExpenseCategory } from "@/types";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { showSuccess, showError, showConfirm } from "@/components/common/Toast";
import { Plus, Trash2 } from "lucide-react";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: "bazar" as ExpenseCategory, note: "", amount: "" });

  const fetchAll = async () => setList(await getExpenses());

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = list.filter((e) => {
    if (filter === "today") return e.date === new Date().toISOString().slice(0, 10);
    if (filter === "month") return e.date.startsWith(new Date().toISOString().slice(0, 7));
    if (filter !== "all") return e.category === filter;
    return true;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExpense({ date: form.date, category: form.category, note: form.note, amount: Number(form.amount), by: user?.role || "admin" });
      showSuccess("Khoroc lekha hoise!");
      setShowForm(false);
      setForm({ date: new Date().toISOString().slice(0, 10), category: "bazar", note: "", amount: "" });
      fetchAll();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black">Khoroc Khata</h2>
          <p className="text-xs text-muted">Total: <b className="text-red-500">৳{total}</b> ({filtered.length} ta entry)</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>Khoroc likhun</Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card-bg border border-card-border rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted">Tarikh</label>
            <input type="date" value={form.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-md bg-bg-main border border-card-border outline-none" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted">Khat</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })} className="mt-2 w-full px-4 py-3 rounded-md bg-bg-main border border-card-border outline-none">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <Input label="Biboron (jemon: murgi 5kg)" name="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <Input label="Taka (৳)" type="number" name="amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <div className="sm:col-span-2 flex gap-3">
            <Button type="submit" variant="primary">Save</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "today", "month", "bazar", "salary", "rent", "utility", "other"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-black border ${filter === f ? "bg-brand text-white border-brand" : "bg-card-bg border-card-border text-muted"}`}>
            {f === "all" ? "Sob" : f === "today" ? "Ajke" : f === "month" ? "Ei mash" : f}
          </button>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-bg-main text-muted text-left">
            <tr>
              <th className="p-3">Tarikh</th>
              <th className="p-3">Khat</th>
              <th className="p-3">Biboron</th>
              <th className="p-3">Taka</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e._id} className="border-t border-card-border">
                <td className="p-3 text-muted">{e.date}</td>
                <td className="p-3"><span className="text-[11px] font-black px-2 py-1 rounded-full bg-brand/10 text-brand">{e.category}</span></td>
                <td className="p-3 font-bold">{e.note}</td>
                <td className="p-3 font-black text-red-500">৳{e.amount}</td>
                <td className="p-3">
                  {user?.role === "admin" && (
                    <button onClick={() => showConfirm("Entry delete?", async () => { await deleteExpense(e._id); fetchAll(); })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted py-8 text-sm">Kono khoroc nai.</p>}
      </div>
    </div>
  );
}
