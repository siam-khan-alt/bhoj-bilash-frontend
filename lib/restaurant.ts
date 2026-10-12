import type { RestaurantConfig } from "@/types";

/**
 * SINGLE SMALL HOTEL — no super admin, no online ordering, no table/QR.
 * 1 copy = 1 dokan. Name/address/phone change kore deploy.
 */

export const RESTAURANT_DEFAULT: RestaurantConfig = {
  name: "Bhoj Bilash",
  slug: "bhoj-bilash",
  logo: "/logo.png",
  address: "Dhaka, Bangladesh",
  phone: "+880 1700-000001",
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
