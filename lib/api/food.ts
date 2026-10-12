import type { Food } from "@/types";
import { mockFoods } from "@/lib/mocks/foods";

const STORAGE_KEY = "mock_foods";
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function getStoredFoods(): Food[] {
  if (typeof window === "undefined") return [...mockFoods];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
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
