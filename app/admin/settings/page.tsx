"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Copy, Store, Clock, ListChecks } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { DEFAULT_HOURS } from "@/lib/restaurant";
import { getFoods, updateFood } from "@/lib/api/food";
import { getStaff, updateStaff } from "@/lib/api/staff";
import { getExpenses, updateExpense } from "@/lib/api/expenses";
import { showSuccess } from "@/components/common/Toast";
import Button from "@/components/common/Button";
import OptionListEditor from "@/components/admin/OptionListEditor";
import type { DayHours, OptionListKey } from "@/types";

/** Admin only — dokan info + hours + option lists. Save → home page live update. */
export default function SettingsPage() {
  const { t, lang } = useLang();
  const { config, updateConfig } = useRestaurant();

  const [name, setName] = useState(config.name);
  const [address, setAddress] = useState(config.address ?? "");
  const [phone, setPhone] = useState(config.phone ?? "");
  const [hours, setHours] = useState<DayHours[]>(
    config.hours && config.hours.length === 7 ? config.hours : DEFAULT_HOURS
  );
  const [usage, setUsage] = useState<Record<OptionListKey, Record<string, number>>>({
    food_category: {},
    staff_job: {},
    expense_head: {},
    payment_method: {},
    drink_size: {},
  });
  const [tab, setTab] = useState<"shop" | "hours" | "options">("shop");
  const [optTab, setOptTab] = useState<OptionListKey>("food_category");

  const loadUsage = async () => {
    const [foods, staff, expenses] = await Promise.all([getFoods(), getStaff(), getExpenses()]);
    const count = (values: string[]) => {
      const m: Record<string, number> = {};
      for (const v of values) {
        if (v) m[v] = (m[v] ?? 0) + 1;
      }
      return m;
    };
    setUsage({
      food_category: count(foods.map((f) => f.category)),
      staff_job: count(staff.map((s) => s.job)),
      expense_head: count(expenses.map((e) => e.category)),
      payment_method: {},
      drink_size: {},
    });
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const cascadeFood = async (oldV: string, newV: string) => {
    const foods = await getFoods();
    await Promise.all(foods.filter((f) => f.category === oldV).map((f) => updateFood(f._id, { category: newV })));
    await loadUsage();
  };

  const cascadeStaff = async (oldV: string, newV: string) => {
    const staff = await getStaff();
    await Promise.all(staff.filter((s) => s.job === oldV).map((s) => updateStaff(s._id, { job: newV })));
    await loadUsage();
  };

  const cascadeExpense = async (oldV: string, newV: string) => {
    const list = await getExpenses();
    await Promise.all(list.filter((e) => e.category === oldV).map((e) => updateExpense(e._id, { category: newV })));
    await loadUsage();
  };

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

  const tabs = [
    { id: "shop" as const, label: t("set.shop"), icon: Store },
    { id: "hours" as const, label: t("set.hours"), icon: Clock },
    { id: "options" as const, label: t("set.opts"), icon: ListChecks },
  ];

  const optTabs: OptionListKey[] = ["food_category", "staff_job", "expense_head", "payment_method", "drink_size"];
  const cascades: Partial<Record<OptionListKey, (o: string, n: string) => Promise<void>>> = {
    food_category: cascadeFood,
    staff_job: cascadeStaff,
    expense_head: cascadeExpense,
  };

  return (
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-brand/20 mb-3">
        <SettingsIcon className="w-4 h-4" /> {t("nav.settings")}
      </p>
      <h1 className="text-2xl font-black">{t("set.title")}</h1>
      <p className="text-muted text-sm mt-1 mb-5">{t("set.sub")}</p>

      {/* main tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-bg-main border border-card-border mb-4">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-black transition cursor-pointer ${
              tab === tb.id ? "bg-card-bg text-brand shadow-sm border border-card-border" : "text-muted hover:text-text-main"
            }`}
          >
            <tb.icon className="w-4 h-4" />
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "shop" && (
        <>
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
          <Button variant="primary" onClick={save} icon={<Save className="w-4 h-4" />} className="w-full sm:w-auto">
            {t("c.save")}
          </Button>
        </>
      )}

      {tab === "hours" && (
        <>
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
        </>
      )}

      {tab === "options" && (
        <div className="bg-card-bg border border-card-border rounded-lg p-5">
          <p className="text-muted text-xs mb-4">{t("set.optsSub")}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {optTabs.map((k) => (
              <button
                key={k}
                onClick={() => setOptTab(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-black border cursor-pointer transition ${
                  optTab === k ? "bg-brand text-white border-brand" : "bg-bg-main border-card-border text-muted hover:border-brand/40"
                }`}
              >
                {t(`optk.${k}`)}
              </button>
            ))}
          </div>
          <OptionListEditor listKey={optTab} usage={usage[optTab]} onRename={cascades[optTab]} />
        </div>
      )}
    </div>
  );
}
