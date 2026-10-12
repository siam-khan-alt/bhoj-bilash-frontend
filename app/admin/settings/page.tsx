"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Copy } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { DEFAULT_HOURS } from "@/lib/restaurant";
import { showSuccess } from "@/components/common/Toast";
import Button from "@/components/common/Button";
import type { DayHours } from "@/types";

/** Admin only — dokan info + 7 diner kholar somoy. Save → home page live update. */
export default function SettingsPage() {
  const { t, lang } = useLang();
  const { config, updateConfig } = useRestaurant();

  const [name, setName] = useState(config.name);
  const [address, setAddress] = useState(config.address ?? "");
  const [phone, setPhone] = useState(config.phone ?? "");
  const [hours, setHours] = useState<DayHours[]>(
    config.hours && config.hours.length === 7 ? config.hours : DEFAULT_HOURS
  );

  const locale = lang === "bn" ? "bn-BD" : "en-US";
  const order = [1, 2, 3, 4, 5, 6, 0]; // সোম–রবি
  const dayName = (dayIdx: number) =>
    new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(2024, 0, 7 + dayIdx));

  const patchDay = (dayIdx: number, patch: Partial<DayHours>) =>
    setHours((prev) => prev.map((h, i) => (i === dayIdx ? { ...h, ...patch } : h)));

  const copyMondayToAll = () => {
    const mon = hours[1];
    setHours((prev) => prev.map(() => ({ ...mon })));
  };

  const save = () => {
    updateConfig({ name: name.trim() || config.name, address, phone, hours });
    showSuccess(t("set.saved"));
  };

  const inputCls =
    "w-full bg-bg-main border border-card-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-brand/60";

  return (
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-brand/20 mb-3">
        <SettingsIcon className="w-4 h-4" /> {t("nav.settings")}
      </p>
      <h1 className="text-2xl font-black">{t("set.title")}</h1>
      <p className="text-muted text-sm mt-1 mb-6">{t("set.sub")}</p>

      {/* dokan info */}
      <div className="bg-card-bg border border-card-border rounded-lg p-5 mb-4">
        <p className="font-black mb-4">{t("set.shop")}</p>
        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-1.5">
          {t("set.name")}
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mb-3`} />
        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-1.5">
          {t("set.addr")}
        </label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputCls} mb-3`} />
        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-1.5">
          {t("set.phone")}
        </label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
      </div>

      {/* hours */}
      <div className="bg-card-bg border border-card-border rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <p className="font-black">{t("set.hours")}</p>
          <button
            onClick={copyMondayToAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {t("set.copyAll")}
          </button>
        </div>
        <div className="space-y-2">
          {order.map((d) => {
            const h = hours[d];
            return (
              <div
                key={d}
                className="flex items-center gap-3 border border-card-border rounded-md px-3 py-2.5"
              >
                <span className="font-bold text-sm w-20 shrink-0">{dayName(d)}</span>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={!h.closed}
                    onChange={(e) => patchDay(d, { closed: !e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                  {h.closed ? t("set.closed") : t("set.open")}
                </label>
                {!h.closed && (
                  <span className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) => patchDay(d, { open: e.target.value })}
                      className="bg-bg-main border border-card-border rounded-md px-2 py-1.5 text-sm outline-none focus:border-brand/60"
                    />
                    <span className="text-muted text-xs">–</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) => patchDay(d, { close: e.target.value })}
                      className="bg-bg-main border border-card-border rounded-md px-2 py-1.5 text-sm outline-none focus:border-brand/60"
                    />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button variant="primary" onClick={save} icon={<Save className="w-4 h-4" />} className="w-full sm:w-auto">
        {t("c.save")}
      </Button>
    </div>
  );
}
