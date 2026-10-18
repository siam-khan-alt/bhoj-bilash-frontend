import type { StaffMember } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

export async function getStaff(): Promise<StaffMember[]> {
  return apiFetchAll<StaffMember>("/staff");
}

export async function addStaff(data: { name: string; job: string; phone: string; monthlySalary: number }): Promise<StaffMember> {
  return apiFetch<StaffMember>("/staff", { method: "POST", body: JSON.stringify(data) });
}

export async function updateStaff(id: string, patch: Partial<Pick<StaffMember, "name" | "job" | "phone" | "monthlySalary" | "active">>): Promise<StaffMember> {
  return apiFetch<StaffMember>(`/staff/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function deleteStaff(id: string): Promise<void> {
  await apiFetch(`/staff/${id}`, { method: "DELETE" }); // default archive
}
