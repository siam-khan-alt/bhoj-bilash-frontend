import type { RestaurantConfig } from "@/types";
import { apiFetch, isRealApi } from "./client";

export interface RemoteConfig extends RestaurantConfig {
  isOpenNow?: boolean;
}

/** Real backend: GET /api/config (public). Mock mode-e null. */
export async function getRemoteConfig(): Promise<RemoteConfig | null> {
  if (!isRealApi()) return null;
  return apiFetch<RemoteConfig>("/config");
}

export async function patchRemoteConfig(patch: {
  name?: string;
  address?: string;
  phone?: string;
  logo?: string;
  hours?: { open: string; close: string; closed?: boolean }[];
}): Promise<RemoteConfig> {
  return apiFetch<RemoteConfig>("/config", { method: "PATCH", body: JSON.stringify(patch) });
}
