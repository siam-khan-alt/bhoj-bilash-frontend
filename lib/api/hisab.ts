import { apiFetch, isRealApi } from "./client";

export interface HisabStaffRow {
  staffId: string;
  name: string;
  present: number;
  half: number;
  absent: number;
  leave: number;
  payable: number;
  paid: number;
  due: number;
}

export interface HisabSummary {
  month: string;
  sales: number;
  expenses: number;
  salaryPaid: number;
  cash: number;
  payableTotal: number;
  dueTotal: number;
  dueByStaff: HisabStaffRow[];
  today: { date: string; sales: number; expenses: number; salaryPaid: number; cash: number };
}

/** Real backend: 1 call-e sob (mock mode-e null — page purono 5-call flow use korbe). */
export async function getHisabSummary(month: string): Promise<HisabSummary | null> {
  if (!isRealApi()) return null;
  return apiFetch<HisabSummary>(`/hisab/summary?month=${month}`);
}
