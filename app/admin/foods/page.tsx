"use client";
import { getFoods, addFood, updateFood, deleteFood } from "@/lib/api/food";
import { getOptions, addOption } from "@/lib/api/options";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import CategorySelector from "@/components/admin/CategorySelector";
import { showSuccess, showError, showConfirm } from "@/components/common/Toast";
import { useLang } from "@/context/LanguageContext";

export default function ManageFoods() {
  const { t } = useLang();
  const [foods, setFoods] = useState<import('@/types').Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<import('@/types').Food | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "", price: "", image: "" });
  const [optCats, setOptCats] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>(["250ml", "500ml", "1L"]);

  useEffect(() => {
    fetchFoods();
    getOptions("food_category", true).then((rows) => setOptCats(rows.map((r) => r.value))).catch(() => {});
    getOptions("drink_size", true).then((rows) => {
      const v = rows.map((r) => r.value);
      if (v.length > 0) setSizes(v);
    }).catch(() => {});
  }, []);

  const fetchFoods = async () => {
    try {
      const data = await getFoods();
      setFoods(data);
    } catch (err) {
      showError(t("foods.loadFail"));
    } finally {
      setLoading(false);
    }
  };

  const existingCategories = [...new Set([...optCats, ...foods.map((food) => food.category)])];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category });
  };

  const openAddForm = () => {
    setEditingFood(null);
    setFormData({ name: "", category: "", price: "", image: "" });
    setShowForm(true);
  };

  const openEditForm = (food: import('@/types').Food) => {
    setEditingFood(food);
    setFormData({ name: food.name, category: food.category, price: String(food.price), image: food.image || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      showError(t("foods.needCat"));
      return;
    }

    try {
      if (editingFood) {
        await updateFood(editingFood._id, formData);
        showSuccess(t("foods.updated"));
      } else {
        await addFood(formData);
        showSuccess(t("foods.added"));
      }
      setShowForm(false);
      fetchFoods();
    } catch (err) {
      showError(t((err as Error).message) || t("foods.opFail"));
    }
  };

  const handleDelete = (food: import('@/types').Food) => {
    showConfirm(t("foods.deleteConfirm", { name: food.name }), async () => {
      try {
        await deleteFood(food._id);
        showSuccess(t("foods.deleted"));
        fetchFoods();
      } catch (err) {
        showError(t("foods.deleteFail"));
      }
    });
  };

  if (loading) return <p className="text-muted font-bold">{t("c.loading")}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-text-main">{t("foods.title")}</h2>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openAddForm}>
          {t("foods.addBtn")}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card-bg border border-card-border rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Input label={t("foods.name")} name="name" value={formData.name} onChange={handleChange} required />

          <CategorySelector
            categories={existingCategories}
            value={formData.category}
            onChange={handleCategoryChange}
            onAddNew={(v) => {
              addOption("food_category", { value: v }).then(() =>
                getOptions("food_category", true).then((rows) => setOptCats(rows.map((r) => r.value))).catch(() => {})
              ).catch(() => {});
            }}
          />

          {formData.category === "Drinks" && (
            <div className="sm:col-span-2">
              <p className="text-xs font-black text-muted uppercase tracking-widest mb-1.5">
                {t("foods.size")}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const active = new RegExp(`\\b${s}$`, "i").test(formData.name.trim());
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const base = formData.name.replace(/\s*\d+\s?(ml|l)\s*$/i, "").trim();
                        setFormData({ ...formData, name: base ? `${base} ${s}` : s });
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-black border cursor-pointer ${
                        active
                          ? "bg-brand text-white border-brand"
                          : "bg-bg-main border-card-border text-muted hover:border-brand/50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Input label={t("foods.price")} type="number" name="price" value={formData.price} onChange={handleChange} required />
          <Input label={t("foods.img")} name="image" value={formData.image} onChange={handleChange} />

          <div className="sm:col-span-2 flex gap-3">
            <Button type="submit" variant="primary">
              {editingFood ? t("foods.updateFood") : t("foods.addFood")}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              {t("c.cancel")}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-main text-muted text-left">
            <tr>
              <th className="p-3">{t("foods.thImg")}</th>
              <th className="p-3">{t("foods.thName")}</th>
              <th className="p-3">{t("foods.thCat")}</th>
              <th className="p-3">{t("foods.thPrice")}</th>
              <th className="p-3">{t("foods.thAct")}</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food._id} className="border-t border-card-border">
                <td className="p-3">
                  <img
                    src={food.image || "/placeholder-food.png"}
                    alt={food.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-food.png"; }}
                  />
                </td>
                <td className="p-3 font-bold text-text-main">{food.name}</td>
                <td className="p-3 text-muted">{food.category}</td>
                <td className="p-3 font-bold text-brand">৳{food.price}</td>
                <td className="p-3">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={async () => {
                        try {
                          await updateFood(food._id, { available: food.available === false });
                          showSuccess(food.available === false ? t("foods.nowAvail", { name: food.name }) : t("foods.nowOut", { name: food.name }));
                          fetchFoods();
                        } catch (err) {
                          showError(t("foods.updateFail"));
                        }
                      }}
                      className={`text-[11px] font-black px-2.5 py-1.5 rounded-full border ${food.available === false ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-accent/10 text-accent border-accent/30"}`}
                    >
                      {food.available === false ? t("foods.out") : t("foods.avail")}
                    </button>
                    <button onClick={() => openEditForm(food)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(food)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}