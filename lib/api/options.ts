import type { Lang } from "@/lib/i18n/dict";
import type { OptionItem, OptionListKey } from "@/types";
import { apiFetch } from "./client";

const bySort = (a: OptionItem, b: OptionItem) => a.sort - b.sort;

export async function getOptions(key: OptionListKey, activeOnly = false): Promise<OptionItem[]> {
  const q = activeOnly ? "&active=1" : "";
  const rows = await apiFetch<OptionItem[]>(`/options?key=${key}${q}`);
  return [...rows].sort(bySort);
}

export async function addOption(
  key: OptionListKey,
  data: { value: string; label_bn?: string; label_en?: string }
): Promise<OptionItem> {
  return apiFetch<OptionItem>("/options", {
    method: "POST",
    body: JSON.stringify({ key, ...data }),
  });
}

export async function updateOption(
  id: string,
  patch: Partial<Pick<OptionItem, "value" | "label_bn" | "label_en" | "sort" | "active">>
): Promise<OptionItem> {
  return apiFetch<OptionItem>(`/options/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function deleteOption(id: string): Promise<void> {
  await apiFetch(`/options/${id}`, { method: "DELETE" });
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
