import type { Review } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

export async function getReviews(): Promise<Review[]> {
  return apiFetchAll<Review>("/reviews");
}

export async function addReview(data: { name: string; rating: number; text: string }): Promise<Review> {
  return apiFetch<Review>("/reviews", { method: "POST", body: JSON.stringify(data) });
}
