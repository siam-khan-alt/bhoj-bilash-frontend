import type { Review } from "@/types";
import { mockReviews } from "@/lib/mocks/reviews";

const STORAGE_KEY = "mock_reviews";
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function getStoredReviews(): Review[] {
  if (typeof window === "undefined") return [...mockReviews];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...mockReviews];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReviews));
  return [...mockReviews];
}

function setStoredReviews(reviews: Review[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export async function getReviews(): Promise<Review[]> {
  await delay();
  return getStoredReviews().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addReview(data: { name: string; rating: number; text: string }): Promise<Review> {
  await delay();
  const name = data.name.trim();
  const text = data.text.trim();
  const rating = Math.min(5, Math.max(1, Math.round(Number(data.rating) || 5)));
  if (!name || !text) throw new Error("rev.need");
  const review: Review = {
    _id: `rev_${Date.now()}`,
    name,
    rating,
    text,
    createdAt: new Date().toISOString(),
  };
  const updated = [review, ...getStoredReviews()];
  setStoredReviews(updated);
  return review;
}
