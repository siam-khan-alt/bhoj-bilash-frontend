import type { Attendance, AttendanceStatus } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

export const todayBD = () => new Date().toISOString().slice(0, 10);

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  return apiFetchAll<Attendance>(`/attendance?date=${date}`);
}

export async function getAttendanceByMonth(month: string): Promise<Attendance[]> {
  return apiFetchAll<Attendance>(`/attendance?month=${month}`);
}

export async function markAttendance(
  staffId: string,
  date: string,
  status: AttendanceStatus,
  opts?: { inTime?: string; outTime?: string; note?: string }
): Promise<Attendance> {
  return apiFetch<Attendance>("/attendance/mark", {
    method: "POST",
    body: JSON.stringify({ staffId, date, status, ...opts }),
  });
}

export async function updateAttendanceTimes(
  staffId: string,
  date: string,
  patch: { inTime?: string; outTime?: string; note?: string; status?: AttendanceStatus }
): Promise<Attendance> {
  return apiFetch<Attendance>("/attendance/times", {
    method: "POST",
    body: JSON.stringify({ staffId, date, ...patch }),
  });
}

export async function getAttendanceByMonthDetailed(month: string): Promise<Attendance[]> {
  return getAttendanceByMonth(month);
}

/** "09:30" - "18:15" => 8.5 (ghonta). Na parle null */
export function workHours(inTime?: string, outTime?: string): number | null {
  if (!inTime || !outTime) return null;
  const p = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };
  const a = p(inTime);
  const b = p(outTime);
  if (a === null || b === null || b < a) return null;
  return Math.round(((b - a) / 60) * 10) / 10;
}
