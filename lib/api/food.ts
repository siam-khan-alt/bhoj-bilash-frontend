import type { Food } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

export async function getFoods(): Promise<Food[]> {
  return apiFetchAll<Food>("/foods");
}

export async function addFood(data: { name: string; category: string; price: string | number; image: string }): Promise<Food> {
  return apiFetch<Food>("/foods", { method: "POST", body: JSON.stringify({ ...data, price: Number(data.price) }) });
}

export async function updateFood(id: string, data: { name?: string; category?: string; price?: string | number; image?: string; available?: boolean }): Promise<Food> {
  const body = { ...data, ...(data.price !== undefined ? { price: Number(data.price) } : {}) };
  return apiFetch<Food>(`/foods/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteFood(id: string): Promise<void> {
  await apiFetch(`/foods/${id}`, { method: "DELETE" });
}
