import type { Lang } from "@/lib/i18n/dict";
import type { OptionItem, OptionListKey } from "@/types";
import { apiFetch, isRealApi } from "./client";

const STORAGE_KEY = "mock_options";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

type Seed = { key: OptionListKey; value: string; bn: string; en: string };

const SEEDS: Seed[] = [
  { key: "food_category", value: "Burger", bn: "বার্গার", en: "Burger" },
  { key: "food_category", value: "Pizza", bn: "পিজ্জা", en: "Pizza" },
  { key: "food_category", value: "Biryani", bn: "বিরিয়ানি", en: "Biryani" },
  { key: "food_category", value: "Dessert", bn: "ডেজার্ট", en: "Dessert" },
  { key: "food_category", value: "Drinks", bn: "পানীয়", en: "Drinks" },
  { key: "food_category", value: "Juice", bn: "জুস", en: "Juice" },
  { key: "staff_job", value: "baburchi", bn: "বাবুর্চি", en: "Baburchi" },
  { key: "staff_job", value: "helper", bn: "হেলপার", en: "Helper" },
  { key: "staff_job", value: "cashier", bn: "ক্যাশিয়ার", en: "Cashier" },
  { key: "staff_job", value: "other", bn: "অন্য", en: "Other" },
  { key: "expense_head", value: "bazar", bn: "বাজার (কাঁচামাল)", en: "Bazar (raw market)" },
  { key: "expense_head", value: "salary", bn: "বেতন / অগ্রিম", en: "Salary / Advance" },
  { key: "expense_head", value: "rent", bn: "দোকান ভাড়া", en: "Shop rent" },
  { key: "expense_head", value: "utility", bn: "কারেন্ট / গ্যাস / পানি", en: "Power / Gas / Water" },
  { key: "expense_head", value: "other", bn: "অন্য", en: "Other" },
  { key: "payment_method", value: "cash", bn: "ক্যাশ", en: "Cash" },
  { key: "payment_method", value: "card", bn: "কার্ড", en: "Card" },
  { key: "drink_size", value: "250ml", bn: "২৫০ মিলি", en: "250ml" },
  { key: "drink_size", value: "500ml", bn: "৫০০ মিলি", en: "500ml" },
  { key: "drink_size", value: "1L", bn: "১ লিটার", en: "1L" },
];

function seedRows(): OptionItem[] {
  const counters = new Map<OptionListKey, number>();
  return SEEDS.map((s, i) => {
    const n = (counters.get(s.key) ?? 0) + 1;
    counters.set(s.key, n);
    return {
      _id: `opt_${s.key}_${i}`,
      key: s.key,
      value: s.value,
      label_bn: s.bn,
      label_en: s.en,
      sort: n,
      active: true,
      createdAt: new Date().toISOString(),
    };
  });
}

function getStored(): OptionItem[] {
  if (typeof window === "undefined") return seedRows();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const list = JSON.parse(saved) as OptionItem[];
      // seed merge — notun default list (jemon bkash pore add hole) purono browser-eo dhukbe
      const ids = new Set(list.map((o) => o._id));
      const missing = seedRows().filter((s) => !ids.has(s._id));
      if (missing.length > 0) {
        const merged = [...list, ...missing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return list;
    } catch {
      return seedRows();
    }
  }
  const rows = seedRows();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  return rows;
}

function setStored(list: OptionItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const bySort = (a: OptionItem, b: OptionItem) => a.sort - b.sort;

export async function getOptions(key: OptionListKey, activeOnly = false): Promise<OptionItem[]> {
  if (isRealApi()) {
    return apiFetch<OptionItem[]>(`/options?key=${key}`);
  }
  await delay();
  const rows = getStored().filter((o) => o.key === key);
  return (activeOnly ? rows.filter((o) => o.active) : rows).sort(bySort);
}

export async function addOption(
  key: OptionListKey,
  data: { value: string; label_bn?: string; label_en?: string }
): Promise<OptionItem> {
  if (isRealApi()) {
    return apiFetch<OptionItem>("/options", {
      method: "POST",
      body: JSON.stringify({ key, ...data }),
    });
  }
  await delay();
  const value = data.value.trim();
  if (!value) throw new Error("opt.empty");
  const list = getStored();
  if (list.some((o) => o.key === key && o.value.toLowerCase() === value.toLowerCase())) {
    throw new Error("opt.duplicate");
  }
  const maxSort = list.filter((o) => o.key === key).reduce((m, o) => Math.max(m, o.sort), 0);
  const item: OptionItem = {
    _id: `opt_${Date.now()}`,
    key,
    value,
    label_bn: data.label_bn?.trim() || value,
    label_en: data.label_en?.trim() || value,
    sort: maxSort + 1,
    active: true,
    createdAt: new Date().toISOString(),
  };
  setStored([...list, item]);
  return item;
}

export async function updateOption(
  id: string,
  patch: Partial<Pick<OptionItem, "value" | "label_bn" | "label_en" | "sort" | "active">>
): Promise<OptionItem> {
  if (isRealApi()) {
    return apiFetch<OptionItem>(`/options/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  }
  await delay();
  const list = getStored();
  const idx = list.findIndex((o) => o._id === id);
  if (idx === -1) throw new Error("opt.notFound");
  if (patch.value !== undefined) {
    const value = patch.value.trim();
    if (!value) throw new Error("opt.empty");
    if (
      list.some(
        (o) => o._id !== id && o.key === list[idx].key && o.value.toLowerCase() === value.toLowerCase()
      )
    ) {
      throw new Error("opt.duplicate");
    }
    list[idx] = { ...list[idx], value };
  }
  if (patch.label_bn !== undefined) list[idx] = { ...list[idx], label_bn: patch.label_bn.trim() || list[idx].value };
  if (patch.label_en !== undefined) list[idx] = { ...list[idx], label_en: patch.label_en.trim() || list[idx].value };
  if (patch.sort !== undefined) list[idx] = { ...list[idx], sort: patch.sort };
  if (patch.active !== undefined) list[idx] = { ...list[idx], active: patch.active };
  setStored(list);
  return list[idx];
}

export async function deleteOption(id: string): Promise<void> {
  if (isRealApi()) {
    await apiFetch(`/options/${id}`, { method: "DELETE" });
    return;
  }
  await delay();
  setStored(getStored().filter((o) => o._id !== id));
}

/** Structural values — label bodlano jabe, kintu value rename/delete lock (logic nirvor: hisab-e "salary", bestseller-e "Drinks"/"Juice"). */
export const LOCKED_VALUES: Partial<Record<OptionListKey, string[]>> = {
  expense_head: ["salary"],
  food_category: ["Drinks", "Juice"],
};

/** Row label — lang onujayi, na pele value capitalize fallback (dict key missing holeo UI bhangbe na). */
export function optionLabel(rows: OptionItem[], value: string, lang: Lang): string {
  const hit = rows.find((r) => r.value === value);
  if (hit) return lang === "bn" ? hit.label_bn : hit.label_en;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
