import type { Expense, ExpenseCategory } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

export async function getExpenses(): Promise<Expense[]> {
  return apiFetchAll<Expense>("/expenses");
}

export async function addExpense(data: { date: string; category: ExpenseCategory; note: string; amount: number; by: string }): Promise<Expense> {
  return apiFetch<Expense>("/expenses", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteExpense(id: string): Promise<void> {
  await apiFetch(`/expenses/${id}`, { method: "DELETE" });
}

export async function updateExpense(id: string, patch: Partial<Pick<Expense, "date" | "category" | "note" | "amount">>): Promise<Expense> {
  return apiFetch<Expense>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
