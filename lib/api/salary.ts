import type { SalaryPayment } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

export async function getSalaryPayments(month?: string): Promise<SalaryPayment[]> {
  return apiFetchAll<SalaryPayment>(`/salary${month ? `?month=${month}` : ""}`);
}

export async function paySalary(data: { staffId: string; month: string; amount: number; note: string }): Promise<SalaryPayment> {
  return apiFetch<SalaryPayment>("/salary/pay", { method: "POST", body: JSON.stringify(data) });
}
