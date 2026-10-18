import type { Package, PackageItem } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

/** Offer thakle offer dam, na thakle package dam */
export function effectivePrice(p: Package) {
  return p.offerPrice && Number(p.offerPrice) > 0 ? Number(p.offerPrice) : p.price;
}

export async function getPackages(activeOnly = false): Promise<Package[]> {
  const q = activeOnly ? "?active=1" : "";
  return apiFetchAll<Package>(`/packages${q}`);
}

export async function addPackage(data: { name: string; items: PackageItem[]; price: number; offerPrice?: number; offerNote?: string; image?: string }): Promise<Package> {
  return apiFetch<Package>("/packages", { method: "POST", body: JSON.stringify(data) });
}

export async function updatePackage(id: string, patch: Partial<Pick<Package, "name" | "items" | "price" | "offerPrice" | "offerNote" | "image" | "active">>): Promise<Package> {
  return apiFetch<Package>(`/packages/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function deletePackage(id: string): Promise<void> {
  await apiFetch(`/packages/${id}`, { method: "DELETE" });
}
