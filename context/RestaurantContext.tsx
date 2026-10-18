"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { RestaurantConfig } from "@/types";
import { RESTAURANT_DEFAULT } from "@/lib/restaurant";
import { getRemoteConfig, patchRemoteConfig } from "@/lib/api/config";

interface RestaurantContextType {
  config: RestaurantConfig;
  updateConfig: (patch: Partial<RestaurantConfig>) => Promise<void>;
  refresh: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<RestaurantConfig>(() => ({ ...RESTAURANT_DEFAULT }));

  const refresh = useCallback(() => {
    getRemoteConfig().then(setConfig).catch(() => {});
  }, []);

  const updateConfig = async (patch: Partial<RestaurantConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch })); // optimistic
    try {
      const next = await patchRemoteConfig(patch);
      setConfig(next);
    } catch (e) {
      refresh(); // fail hole server truth e rollback
      throw e;
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <RestaurantContext.Provider value={{ config, updateConfig, refresh }}>{children}</RestaurantContext.Provider>;
}

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within a RestaurantProvider");
  return ctx;
};
