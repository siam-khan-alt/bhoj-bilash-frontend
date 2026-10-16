import type { Expense, ExpenseCategory } from "@/types";
import { mockExpenses } from "@/lib/mocks/staff";
import { apiFetch, isRealApi, unwrapList } from "./client";

const KEY = "mock_expenses";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function getStored(): Expense[] {
  if (typeof window === "undefined") return [...mockExpenses];
  const saved = localStorage.getItem(KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...mockExpenses];
    }
  }
  localStorage.setItem(KEY, JSON.stringify(mockExpenses));
  return [...mockExpenses];
}

function setStored(list: Expense[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}

export async function getExpenses(): Promise<Expense[]> {
  if (isRealApi()) return unwrapList<Expense>(await apiFetch<unknown>("/expenses"));
  await delay();
  return [...getStored()].reverse();
}

export async function addExpense(data: { date: string; category: ExpenseCategory; note: string; amount: number; by: string }): Promise<Expense> {
  if (isRealApi()) {
    return apiFetch<Expense>("/expenses", { method: "POST", body: JSON.stringify(data) });
  }
  await delay();
  if (!data.amount || Number(data.amount) <= 0) throw new Error("err.amountInvalid");
  const list = getStored();
  const item: Expense = {
    _id: `exp_${Date.now()}`,
    date: data.date || new Date().toISOString().slice(0, 10),
    category: data.category,
    note: data.note.trim() || data.category,
    amount: Number(data.amount),
    by: data.by || "admin",
    createdAt: new Date().toISOString(),
  };
  setStored([...list, item]);
  return item;
}

export async function deleteExpense(id: string): Promise<void> {
  if (isRealApi()) {
    await apiFetch(`/expenses/${id}`, { method: "DELETE" });
    return;
  }
  await delay();
  setStored(getStored().filter((e) => e._id !== id));
}

export async function updateExpense(id: string, patch: Partial<Pick<Expense, "date" | "category" | "note" | "amount">>): Promise<Expense> {
  if (isRealApi()) {
    return apiFetch<Expense>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  }
  await delay();
  const list = getStored();
  const idx = list.findIndex((e) => e._id === id);
  if (idx === -1) throw new Error("exp.notFound");
  list[idx] = {
    ...list[idx],
    ...patch,
    ...(patch.amount !== undefined ? { amount: Number(patch.amount) } : {}),
  };
  setStored(list);
  return list[idx];
}
