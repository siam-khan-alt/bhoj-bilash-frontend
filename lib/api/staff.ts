import type { StaffMember } from "@/types";
import { mockStaff } from "@/lib/mocks/staff";

const KEY = "mock_staff";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function getStored(): StaffMember[] {
  if (typeof window === "undefined") return [...mockStaff];
  const saved = localStorage.getItem(KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...mockStaff];
    }
  }
  localStorage.setItem(KEY, JSON.stringify(mockStaff));
  return [...mockStaff];
}

function setStored(list: StaffMember[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}

export async function getStaff(): Promise<StaffMember[]> {
  await delay();
  return getStored();
}

export async function addStaff(data: { name: string; job: string; phone: string; monthlySalary: number }): Promise<StaffMember> {
  await delay();
  if (!data.name.trim()) throw new Error("err.nameRequired");
  if (!data.monthlySalary || Number(data.monthlySalary) <= 0) throw new Error("err.salaryInvalid");
  const list = getStored();
  const item: StaffMember = {
    _id: `staff_${Date.now()}`,
    name: data.name.trim(),
    job: data.job.trim() || "helper",
    phone: data.phone.trim(),
    monthlySalary: Number(data.monthlySalary),
    active: true,
    createdAt: new Date().toISOString(),
  };
  setStored([...list, item]);
  return item;
}

export async function updateStaff(id: string, patch: Partial<Pick<StaffMember, "name" | "job" | "phone" | "monthlySalary" | "active">>): Promise<StaffMember> {
  await delay();
  const list = getStored();
  const idx = list.findIndex((s) => s._id === id);
  if (idx === -1) throw new Error("err.staffNotFound");
  list[idx] = { ...list[idx], ...patch };
  setStored(list);
  return list[idx];
}

export async function deleteStaff(id: string): Promise<void> {
  await delay();
  setStored(getStored().filter((s) => s._id !== id));
}
