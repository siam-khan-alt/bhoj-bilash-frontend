import { apiFetch } from "./client";

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

/** Server-computed month summary — 1 call, DB aggregates. */
export async function getHisabSummary(month: string): Promise<HisabSummary> {
  return apiFetch<HisabSummary>(`/hisab/summary?month=${month}`);
}
