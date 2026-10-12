import type { Food } from "@/types";
import { mockFoods } from "@/lib/mocks/foods";

const STORAGE_KEY = "mock_foods";
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** Purono seed name → notun size-wala name. Sudhu untouched item-e apply hobe (admin edit korle skip). */
const LEGACY_FIX: Record<string, { from: string; name: string; price: number }> = {
  food_013: { from: "Mineral Water", name: "Mineral Water 500ml", price: 20 },
  food_014: { from: "Coca-Cola", name: "Coca-Cola 500ml", price: 40 },
  food_015: { from: "Mojo", name: "Mojo 500ml", price: 40 },
  food_016: { from: "SevenUp", name: "SevenUp 500ml", price: 40 },
  food_017: { from: "Fanta", name: "Fanta 500ml", price: 45 },
};

function getStoredFoods(): Food[] {
  if (typeof window === "undefined") return [...mockFoods];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      let list = JSON.parse(saved) as Food[];
      let changed = false;
      // 1) legacy rename — admin na bodlale size-wala name + dam bosbe
      list = list.map((f) => {
        const fix = LEGACY_FIX[f._id];
        if (fix && f.name === fix.from) {
          changed = true;
          return { ...f, name: fix.name, price: fix.price };
        }
        return f;
      });
      // 2) seed migration — notun item (jemon 250ml) purono browser-eo dhukbe
      const ids = new Set(list.map((f) => f._id));
      const missing = mockFoods.filter((f) => !ids.has(f._id));
      let merged = list;
      if (missing.length > 0) {
        merged = [...list, ...missing];
        changed = true;
      }
      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch {
      return [...mockFoods];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockFoods));
  return [...mockFoods];
}

function setStoredFoods(foods: Food[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

export async function getFoods(): Promise<Food[]> {
  await delay();
  return getStoredFoods();
}

export async function addFood(data: { name: string; category: string; price: string | number; image: string }): Promise<Food> {
  await delay();
  const foods = getStoredFoods();
  const newFood: Food = {
    _id: `food_${Date.now()}`,
    name: data.name,
    category: data.category,
    price: Number(data.price),
    image: data.image || "/placeholder-food.png",
    available: true,
    createdAt: new Date().toISOString(),
  };
  const updated = [...foods, newFood];
  setStoredFoods(updated);
  return newFood;
}

export async function updateFood(id: string, data: { name?: string; category?: string; price?: string | number; image?: string; available?: boolean }): Promise<Food> {
  await delay();
  const foods = getStoredFoods();
  const idx = foods.findIndex((f) => f._id === id);
  if (idx === -1) throw new Error("err.foodNotFound");
  const updated: Food = {
    ...foods[idx],
    name: data.name ?? foods[idx].name,
    category: data.category ?? foods[idx].category,
    price: data.price !== undefined ? Number(data.price) : foods[idx].price,
    image: data.image ?? foods[idx].image,
    available: data.available ?? (foods[idx].available !== false),
  };
  foods[idx] = updated;
  setStoredFoods(foods);
  return updated;
}

export async function deleteFood(id: string): Promise<void> {
  await delay();
  const foods = getStoredFoods();
  const filtered = foods.filter((f) => f._id !== id);
  if (filtered.length === foods.length) throw new Error("err.foodNotFound");
  setStoredFoods(filtered);
}

export function getFoodById(id: string): Food | undefined {
  return getStoredFoods().find((f) => f._id === id);
}
