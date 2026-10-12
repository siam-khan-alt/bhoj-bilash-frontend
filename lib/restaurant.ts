import type { DayHours, RestaurantConfig } from "@/types";

/**
 * SINGLE SMALL HOTEL — no super admin, no online ordering, no table/QR.
 * 1 copy = 1 dokan. Name/address/phone change kore deploy.
 */

/** ৭ দিনের ডিফল্ট সময়সূচি — index = JS getDay() (0 = রবিবার)। মালিক এখানে বদলে দিলেই home-এ আপডেট। */
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

const STORAGE_KEY = "restaurant_config";

// Purono name (Hotel Ruposhi / BiteBox) thakle auto migrate → Bhoj Bilash
const LEGACY_NAMES = ["Hotel Ruposhi", "BiteBox", "BiteBox OS"];

export function getRestaurantConfig(): RestaurantConfig {
  if (typeof window === "undefined") return { ...RESTAURANT_DEFAULT };
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as RestaurantConfig;
      if (parsed.name && LEGACY_NAMES.includes(parsed.name)) {
        const migrated = { ...RESTAURANT_DEFAULT, ...parsed, name: RESTAURANT_DEFAULT.name, slug: RESTAURANT_DEFAULT.slug, logo: "/logo.png" };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return { ...RESTAURANT_DEFAULT, ...parsed, logo: "/logo.png" };
    } catch {
      return { ...RESTAURANT_DEFAULT };
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(RESTAURANT_DEFAULT));
  return { ...RESTAURANT_DEFAULT };
}

export function setRestaurantConfig(config: RestaurantConfig) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function updateRestaurantConfig(patch: Partial<RestaurantConfig>): RestaurantConfig {
  const next = { ...getRestaurantConfig(), ...patch };
  setRestaurantConfig(next);
  return next;
}

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
