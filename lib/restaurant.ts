import type { DayHours, RestaurantConfig } from "@/types";

/**
 * SINGLE SMALL HOTEL — no super admin, no online ordering, no table/QR.
 * 1 copy = 1 dokan. Real shop info/hours backend /api/config theke ase
 * (RestaurantContext); nicher gulo first-paint / fetch-fail default.
 */

/** ৭ দিনের ডিফল্ট সময়সূচি — index = JS getDay() (0 = রবিবার)। */
export const DEFAULT_HOURS: DayHours[] = [
  { open: "09:00", close: "22:00" }, // রবি
  { open: "09:00", close: "22:00" }, // সোম
  { open: "09:00", close: "22:00" }, // মঙ্গল
  { open: "09:00", close: "22:00" }, // বুধ
  { open: "09:00", close: "22:00" }, // বৃহস্পতি
  { open: "09:00", close: "23:00" }, // শুক্র (ভিড়ের দিন — ১ ঘণ্টা বেশি)
  { open: "09:00", close: "22:00" }, // শনি
];

export const RESTAURANT_DEFAULT: RestaurantConfig = {
  name: "Bhoj Bilash",
  slug: "bhoj-bilash",
  logo: "/logo.png",
  address: "Dhaka, Bangladesh",
  phone: "+880 1700-000001",
  hours: DEFAULT_HOURS,
};

/** "HH:MM" → minute-of-day. */
function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** এখন দোকান খোলা আছে কিনা — hours schedule + বর্তমান সময় থেকে live হিসাব। */
export function isOpenNow(hours?: DayHours[], now = new Date()): boolean {
  const list = hours && hours.length === 7 ? hours : DEFAULT_HOURS;
  const today = list[now.getDay()];
  if (!today || today.closed) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= toMin(today.open) && cur < toMin(today.close);
}
