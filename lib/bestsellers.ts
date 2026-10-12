import type { Food, Order } from "@/types";

export interface BestSeller {
  food: Food;
  sold: number;
}

/**
 * Order history theke per-food total qty ber kore top N sort kore.
 * Cancelled order bad — baki sob (paid/pending) count hobe.
 * Order kom thakle khali slot available food diye fill hobe (sold: 0),
 * jate home page sobsomoy 8 ta card dekhate pare.
 */
export function getBestSellers(foods: Food[], orders: Order[], limit = 8): BestSeller[] {
  const available = foods.filter((f) => f.available !== false);
  const base: Food[] = available.length > 0 ? available : foods;

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

  // 2) baki slot — ekhono sell na howa available food diye fill
  for (const f of base) {
    if (ranked.length >= limit) break;
    if (!used.has(f._id)) {
      ranked.push({ food: f, sold: 0 });
      used.add(f._id);
    }
  }

  return ranked.slice(0, limit);
}
