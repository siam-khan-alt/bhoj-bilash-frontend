"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  getOptions,
  addOption,
  updateOption,
  deleteOption,
  optionLabel,
  LOCKED_VALUES,
} from "@/lib/api/options";
import { showSuccess, showError, showConfirm } from "@/components/common/Toast";
import type { OptionItem, OptionListKey } from "@/types";

interface Props {
  listKey: OptionListKey;
  /** value → koyta record-e use hocche (delete guard) */
  usage: Record<string, number>;
  /** value rename hole related record cascade-update (food/staff/expense). Na dile sudhu option bodlabe. */
  onRename?: (oldValue: string, newValue: string) => Promise<void>;
}

/** Ekta option list-er full CRUD editor: add / rename / on-off / delete (guard soho). */
export default function OptionListEditor({ listKey, usage, onRename }: Props) {
  const { t, lang } = useLang();
  const [rows, setRows] = useState<OptionItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { value: string; bn: string; en: string }>>({});
  const [nv, setNv] = useState({ value: "", bn: "", en: "" });

  const load = async () => {
    const list = await getOptions(listKey);
    setRows(list);
    setDrafts(
      Object.fromEntries(list.map((r) => [r._id, { value: r.value, bn: r.label_bn, en: r.label_en }]))
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);

  const err = (e: unknown) => showError(t(e instanceof Error ? e.message : "foods.opFail"));

  const handleAdd = async () => {
    try {
      await addOption(listKey, { value: nv.value, label_bn: nv.bn, label_en: nv.en });
      setNv({ value: "", bn: "", en: "" });
      await load();
      showSuccess(t("opt.added"));
    } catch (e) {
      err(e);
    }
  };

  const handleSave = async (row: OptionItem) => {
    const d = drafts[row._id];
    if (!d) return;
    try {
      const valueChanged = d.value.trim() && d.value.trim() !== row.value;
      if (valueChanged && onRename) {
        const used = usage[row.value] ?? 0;
        const go = async () => {
          await onRename(row.value, d.value.trim());
          await updateOption(row._id, { value: d.value.trim(), label_bn: d.bn, label_en: d.en });
          await load();
          showSuccess(t("opt.updated"));
        };
        if (used > 0) {
          showConfirm(t("opt.cascade", { n: used }), go);
          return;
        }
        await go();
        return;
      }
      await updateOption(row._id, { value: d.value, label_bn: d.bn, label_en: d.en });
      await load();
      showSuccess(t("opt.updated"));
    } catch (e) {
      err(e);
    }
  };

  const handleToggle = async (row: OptionItem) => {
    try {
      await updateOption(row._id, { active: !row.active });
      await load();
    } catch (e) {
      err(e);
    }
  };

  const handleDelete = async (row: OptionItem) => {
    if ((LOCKED_VALUES[listKey] ?? []).includes(row.value) || (usage[row.value] ?? 0) > 0) {
      showError(t("opt.blocked"));
      return;
    }
    showConfirm(t("opt.deleteConfirm", { v: optionLabel(rows, row.value, lang) }), async () => {
      try {
        await deleteOption(row._id);
        await load();
        showSuccess(t("opt.deleted"));
      } catch (e) {
        err(e);
      }
    });
  };

  const inputCls =
    "bg-bg-main border border-card-border rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-brand/60 w-full min-w-0";

  return (
    <div className="border border-card-border rounded-lg overflow-hidden">
      <div className="divide-y divide-card-border">
        {rows.map((r) => {
          const used = usage[r.value] ?? 0;
          const locked = (LOCKED_VALUES[listKey] ?? []).includes(r.value);
          const d = drafts[r._id] ?? { value: r.value, bn: r.label_bn, en: r.label_en };
          return (
            <div key={r._id} className="px-4 py-2.5 flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer" title={t("opt.active")}>
                <input
                  type="checkbox"
                  checked={r.active}
                  onChange={() => handleToggle(r)}
                  className="w-4 h-4 accent-red-600"
                />
              </label>
              <input
                value={d.value}
                disabled={locked}
                title={locked ? t("opt.locked") : undefined}
                onChange={(e) => setDrafts((p) => ({ ...p, [r._id]: { ...d, value: e.target.value } }))}
                className={`${inputCls} flex-1 basis-24 font-mono ${locked ? "opacity-50" : ""}`}
              />
              <input
                value={d.bn}
                onChange={(e) => setDrafts((p) => ({ ...p, [r._id]: { ...d, bn: e.target.value } }))}
                className={`${inputCls} flex-1 basis-24`}
              />
              <input
                value={d.en}
                onChange={(e) => setDrafts((p) => ({ ...p, [r._id]: { ...d, en: e.target.value } }))}
                className={`${inputCls} flex-1 basis-24`}
              />
              {used > 0 && (
                <span className="text-[10px] font-black text-amber-500 whitespace-nowrap">
                  {t("opt.inUse", { n: used })}
                </span>
              )}
              <span className="flex gap-1 ml-auto">
                <button onClick={() => handleSave(r)} aria-label={t("c.save")} className="p-1.5 text-accent hover:bg-accent/10 rounded-md cursor-pointer">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(r)} aria-label={t("c.delete")} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 flex flex-wrap gap-2 bg-bg-main/50">
        <input value={nv.value} onChange={(e) => setNv({ ...nv, value: e.target.value })} placeholder={t("opt.value")} className={`${inputCls} flex-1 basis-24 font-mono`} />
        <input value={nv.bn} onChange={(e) => setNv({ ...nv, bn: e.target.value })} placeholder={t("opt.bn")} className={`${inputCls} flex-1 basis-24`} />
        <input value={nv.en} onChange={(e) => setNv({ ...nv, en: e.target.value })} placeholder={t("opt.en")} className={`${inputCls} flex-1 basis-24`} />
        <button onClick={handleAdd} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand text-white text-xs font-black hover:bg-brand-hover cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> {t("opt.add")}
        </button>
      </div>
    </div>
  );
}
