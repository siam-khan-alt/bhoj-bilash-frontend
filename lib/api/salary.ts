import type { SalaryPayment } from "@/types";
import { apiFetch, isRealApi, unwrapList } from "./client";

const KEY = "mock_salary";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function getStored(): SalaryPayment[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

function setStored(list: SalaryPayment[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}

export async function getSalaryPayments(month?: string): Promise<SalaryPayment[]> {
  if (isRealApi()) {
    return unwrapList<SalaryPayment>(await apiFetch<unknown>(`/salary${month ? `?month=${month}` : ""}`));
  }
  await delay();
  const list = getStored();
  if (month) return list.filter((p) => p.month === month).reverse();
  return [...list].reverse();
}

export async function paySalary(data: { staffId: string; month: string; amount: number; note: string }): Promise<SalaryPayment> {
  if (isRealApi()) {
    return apiFetch<SalaryPayment>("/salary/pay", { method: "POST", body: JSON.stringify(data) });
  }
  await delay();
  if (!data.amount || Number(data.amount) <= 0) throw new Error("err.amountInvalid");
  if (!data.month) throw new Error("err.monthRequired");
  const list = getStored();
  const item: SalaryPayment = {
    _id: `sal_${Date.now()}`,
    staffId: data.staffId,
    month: data.month,
    amount: Number(data.amount),
    note: data.note.trim(),
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  setStored([...list, item]);
  return item;
}
