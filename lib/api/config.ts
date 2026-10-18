import type { RestaurantConfig } from "@/types";
import { apiFetch } from "./client";

export interface RemoteConfig extends RestaurantConfig {
  isOpenNow?: boolean;
}

/** GET /api/config (public) — dokan info + 7-din hours. */
export async function getRemoteConfig(): Promise<RemoteConfig> {
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
