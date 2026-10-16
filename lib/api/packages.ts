import type { Package, PackageItem } from "@/types";
import { mockPackages } from "@/lib/mocks/packages";
import { apiFetch, isRealApi, unwrapList } from "./client";

const KEY = "mock_packages";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function getStored(): Package[] {
  if (typeof window === "undefined") return [...mockPackages];
  const saved = localStorage.getItem(KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...mockPackages];
    }
  }
  localStorage.setItem(KEY, JSON.stringify(mockPackages));
  return [...mockPackages];
}

function setStored(list: Package[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}

/** Offer thakle offer dam, na thakle package dam */
export function effectivePrice(p: Package) {
  return p.offerPrice && Number(p.offerPrice) > 0 ? Number(p.offerPrice) : p.price;
}

export async function getPackages(activeOnly = false): Promise<Package[]> {
  if (isRealApi()) {
    const data = await apiFetch<unknown>(`/packages${activeOnly ? "?active=1" : ""}`);
    return unwrapList<Package>(data);
  }
  await delay();
  const list = getStored();
  return activeOnly ? list.filter((p) => p.active) : list;
}

export async function addPackage(data: { name: string; items: PackageItem[]; price: number; offerPrice?: number; offerNote?: string; image?: string }): Promise<Package> {
  if (isRealApi()) {
    return apiFetch<Package>("/packages", { method: "POST", body: JSON.stringify(data) });
  }
  await delay();
  if (!data.name.trim()) throw new Error("err.pkgName");
  if (!data.items.length) throw new Error("err.pkgItem");
  if (!data.price || Number(data.price) <= 0) throw new Error("err.priceInvalid");
  const list = getStored();
  const item: Package = {
    _id: `pkg_${Date.now()}`,
    name: data.name.trim(),
    items: data.items,
    price: Number(data.price),
    offerPrice: data.offerPrice ? Number(data.offerPrice) : undefined,
    offerNote: data.offerNote?.trim() || undefined,
    image: data.image?.trim() || undefined,
    active: true,
    createdAt: new Date().toISOString(),
  };
  setStored([...list, item]);
  return item;
}

export async function updatePackage(id: string, patch: Partial<Pick<Package, "name" | "items" | "price" | "offerPrice" | "offerNote" | "image" | "active">>): Promise<Package> {
  if (isRealApi()) {
    return apiFetch<Package>(`/packages/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  }
  await delay();
  const list = getStored();
  const idx = list.findIndex((p) => p._id === id);
  if (idx === -1) throw new Error("err.pkgNotFound");
  list[idx] = { ...list[idx], ...patch };
  setStored(list);
  return list[idx];
}

export async function deletePackage(id: string): Promise<void> {
  if (isRealApi()) {
    await apiFetch(`/packages/${id}`, { method: "DELETE" });
    return;
  }
  await delay();
  setStored(getStored().filter((p) => p._id !== id));
}
