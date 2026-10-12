"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import CustomSelect from "@/components/common/CustomSelect";
import { useLang } from "@/context/LanguageContext";

export default function CategorySelector({ categories, value, onChange, onAddNew }: { categories: string[]; value: string; onChange: (v: string) => void; onAddNew?: (v: string) => void }) {
  const { t } = useLang();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const categoryOptions = categories.map((cat) => ({ value: cat, label: cat }));

  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setNewCategory("");
  };

  const handleConfirmNew = () => {
    if (newCategory.trim()) {
      onChange(newCategory.trim());
      onAddNew?.(newCategory.trim());
      setIsAddingNew(false);
    }
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewCategory("");
  };

  if (isAddingNew) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-text-main block">{t("cs.label")}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t("cs.newPh")}
            autoFocus
            className="flex-1 px-4 py-3 rounded-md bg-card-bg border border-card-border text-text-main placeholder-muted focus:outline-none focus:border-brand/50 transition"
          />
          <button
            type="button"
            onClick={handleConfirmNew}
            className="px-4 py-3 rounded-md bg-brand text-white font-bold text-sm hover:bg-brand-hover transition"
          >
            {t("cs.add")}
          </button>
          <button
            type="button"
            onClick={handleCancelNew}
            className="px-3 py-3 rounded-md bg-card-bg border border-card-border text-muted hover:text-brand transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-text-main block">{t("cs.label")}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <CustomSelect
            value={value}
            options={categoryOptions}
            onChange={handleSelectChange}
            placeholder={t("cs.selectPh")}
          />
        </div>
        <button
          type="button"
          onClick={handleAddNewClick}
          className="px-4 py-3 rounded-md bg-card-bg border border-card-border text-brand hover:border-brand/40 transition flex items-center gap-1.5 font-bold text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {t("cs.new")}
        </button>
      </div>
    </div>
  );
}