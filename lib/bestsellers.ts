import type { Food, Order } from "@/types";

export interface BestSeller {
  food: Food;
  sold: number;
}

/** Panio category — Most Sold (khabar) e jabe na, alada Popular Drinks section e jabe. */
export const BEVERAGE_CATS = ["Drinks", "Juice"];

/** Plain pani — sudhu Create Bill (POS) e dekhabe. Menu, gallery, cover — kothau na. */
export const isPlainWater = (f: Food) => /water/i.test(f.name);

/**
 * Order history theke per-food total qty ber kore top N sort kore.
 * Cancelled order + package line + panio (Drinks/Juice) bad — sudhu khabar.
 * Order kom thakle khali slot available khabar diye fill hobe (sold: 0).
 */
export function getBestSellers(foods: Food[], orders: Order[], limit = 8): BestSeller[] {
  const available = foods.filter((f) => f.available !== false);
  const pool = available.length > 0 ? available : foods;
  // panio bad — sudhu khabar
  const base = pool.filter((f) => !BEVERAGE_CATS.includes(f.category));

  const qtyById = new Map<string, number>();
  for (const o of orders) {
    if (o.orderStatus === "cancelled") continue;
    for (const it of o.items ?? []) {
      const id = it.foodItem?._id;
      if (!id) continue;
      // package pseudo-line (category Package) bad — sudhu real menu item
      if (it.foodItem?.category === "Package") continue;
      qtyById.set(id, (qtyById.get(id) ?? 0) + (it.quantity || 0));
    }
  }

  const foodById = new Map(base.map((f) => [f._id, f]));
  const ranked: BestSeller[] = [];
  const used = new Set<string>();

  // 1) sell howa item age — sold desc
  [...qtyById.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, sold]) => {
      const food = foodById.get(id);
      if (food && !used.has(id)) {
        ranked.push({ food, sold });
        used.add(id);
      }
    });

  // 2) baki slot — ekhono sell na howa available khabar diye fill
  for (const f of base) {
    if (ranked.length >= limit) break;
    if (!used.has(f._id)) {
      ranked.push({ food: f, sold: 0 });
      used.add(f._id);
    }
  }

  return ranked.slice(0, limit);
}

/**
 * Sobceye beshi bikri juice — plain pani bad (Juice-e pani nei, tobu guard).
 * Order kom thakle Juice diye fill hobe (sold: 0). Soft-drinks (Drinks) ekhane asbe na.
 */
export function getPopularDrinks(foods: Food[], orders: Order[], limit = 4): BestSeller[] {
  const available = foods.filter((f) => f.available !== false);
  const pool = available.length > 0 ? available : foods;
  const base = pool.filter((f) => f.category === "Juice" && !isPlainWater(f));
  if (base.length === 0) return [];

  const qtyById = new Map<string, number>();
  for (const o of orders) {
    if (o.orderStatus === "cancelled") continue;
    for (const it of o.items ?? []) {
      const id = it.foodItem?._id;
      if (!id) continue;
      qtyById.set(id, (qtyById.get(id) ?? 0) + (it.quantity || 0));
    }
  }

  const foodById = new Map(base.map((f) => [f._id, f]));
  const ranked: BestSeller[] = [];
  const used = new Set<string>();

  [...qtyById.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, sold]) => {
      const food = foodById.get(id);
      if (food && !used.has(id)) {
        ranked.push({ food, sold });
        used.add(id);
      }
    });

  for (const f of base) {
    if (ranked.length >= limit) break;
    if (!used.has(f._id)) {
      ranked.push({ food: f, sold: 0 });
      used.add(f._id);
    }
  }

  return ranked.slice(0, limit);
}
