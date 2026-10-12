import type { Attendance, AttendanceStatus } from "@/types";

const KEY = "mock_attendance";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const todayBD = () => new Date().toISOString().slice(0, 10);

function getStored(): Attendance[] {
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

function setStored(list: Attendance[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  await delay();
  return getStored().filter((a) => a.date === date);
}

export async function getAttendanceByMonth(month: string): Promise<Attendance[]> {
  await delay();
  return getStored().filter((a) => a.date.startsWith(month));
}

export async function markAttendance(
  staffId: string,
  date: string,
  status: AttendanceStatus,
  opts?: { inTime?: string; outTime?: string; note?: string }
): Promise<Attendance> {
  await delay();
  const list = getStored();
  const idx = list.findIndex((a) => a.staffId === staffId && a.date === date);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      status,
      ...(opts?.inTime !== undefined ? { inTime: opts.inTime } : {}),
      ...(opts?.outTime !== undefined ? { outTime: opts.outTime } : {}),
      ...(opts?.note !== undefined ? { note: opts.note } : {}),
    };
    setStored(list);
    return list[idx];
  }
  const item: Attendance = {
    _id: `att_${Date.now()}_${staffId}`,
    staffId,
    date,
    status,
    inTime: opts?.inTime || "",
    outTime: opts?.outTime || "",
    note: opts?.note || "",
    createdAt: new Date().toISOString(),
  };
  setStored([...list, item]);
  return item;
}

export async function updateAttendanceTimes(
  staffId: string,
  date: string,
  patch: { inTime?: string; outTime?: string; note?: string; status?: AttendanceStatus }
): Promise<Attendance> {
  await delay();
  const list = getStored();
  const idx = list.findIndex((a) => a.staffId === staffId && a.date === date);
  if (idx === -1) throw new Error("err.hajiraFirst");
  list[idx] = { ...list[idx], ...patch };
  setStored(list);
  return list[idx];
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
