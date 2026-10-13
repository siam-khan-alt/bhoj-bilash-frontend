"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getPackages, addPackage, updatePackage, deletePackage, effectivePrice } from "@/lib/api/packages";
import { getFoods } from "@/lib/api/food";
import type { Package, Food, PackageItem } from "@/types";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { showSuccess, showError, showConfirm } from "@/components/common/Toast";
import { useLang } from "@/context/LanguageContext";
import { Plus, Trash2, Pencil, Package as PkgIcon } from "lucide-react";

export default function PackagesPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [list, setList] = useState<Package[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [image, setImage] = useState("");
  const [items, setItems] = useState<PackageItem[]>([]);

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/admin/pos");
  }, [user, router]);

  const fetchAll = async () => {
    const [p, f] = await Promise.all([getPackages(), getFoods()]);
    setList(p);
    setFoods(f);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user?.role !== "admin") return <p className="text-muted font-bold">{t("c.noAccess")}</p>;

  const foodName = (id: string) => foods.find((f) => f._id === id)?.name || id;
  const foodPrice = (id: string) => foods.find((f) => f._id === id)?.price || 0;
  const menuTotal = items.reduce((s, it) => s + foodPrice(it.foodId) * it.qty, 0);

  const reset = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setOfferPrice("");
    setOfferNote("");
    setImage("");
    setItems([]);
    setShowForm(false);
  };

  const openEdit = (p: Package) => {
    setEditing(p);
    setName(p.name);
    setPrice(String(p.price));
    setOfferPrice(p.offerPrice ? String(p.offerPrice) : "");
    setOfferNote(p.offerNote || "");
    setImage(p.image || "");
    setItems([...p.items]);
    setShowForm(true);
  };

  const toggleFood = (id: string) => {
    setItems((prev) => {
      const ex = prev.find((x) => x.foodId === id);
      if (ex) return prev.filter((x) => x.foodId !== id);
      return [...prev, { foodId: id, qty: 1 }];
    });
  };

  const stepQty = (id: string, d: number) => {
    setItems((prev) =>
      prev
        .map((x) => (x.foodId === id ? { ...x, qty: x.qty + d } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name,
        items,
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : undefined,
        offerNote,
        image: image.trim() || undefined,
      };
      if (editing) {
        await updatePackage(editing._id, data);
        showSuccess(t("pkg.updated"));
      } else {
        await addPackage(data);
        showSuccess(t("pkg.added"));
      }
      reset();
      fetchAll();
    } catch (err) {
      showError(t((err as Error).message));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black">{t("pkg.title")}</h2>
          <p className="text-xs text-muted">{t("pkg.sub")}</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { reset(); setShowForm(true); }}>{t("pkg.new")}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-card-bg border border-card-border rounded-lg p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t("pkg.name")} name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div>
              <Input label={t("pkg.price")} type="number" name="price" value={price} onChange={(e) => setPrice(e.target.value)} required />
              {items.length > 0 && (
                <p className="text-[11px] font-bold mt-1.5">
                  <span className="text-muted">{t("pkg.menuPrice", { amt: menuTotal })}</span>
                  {" → "}
                  {Number(price) > 0 ? (
                    Number(price) < menuTotal ? (
                      <span className="text-accent">{t("pkg.saveHint", { amt: menuTotal - Number(price) })}</span>
                    ) : Number(price) === menuTotal ? (
                      <span className="text-muted">{t("pkg.sameHint")}</span>
                    ) : (
                      <span className="text-red-500">{t("pkg.overHint")}</span>
                    )
                  ) : (
                    <span className="text-amber-500">{t("pkg.emptyPriceHint")}</span>
                  )}
                </p>
              )}
            </div>
            <Input label={t("pkg.offerPrice")} type="number" name="offerPrice" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
            <Input label={t("pkg.offerNote")} name="offerNote" value={offerNote} onChange={(e) => setOfferNote(e.target.value)} />
            <div className="sm:col-span-2">
              <Input label={t("pkg.image")} name="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
              {image.trim() && (
                <img
                  src={image.trim()}
                  alt=""
                  className="w-24 h-24 rounded-lg object-cover border border-card-border mt-2"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-food.png"; }}
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted">
              {t("pkg.pick", { n: items.length, total: menuTotal })}
            </label>
            {foods.length === 0 ? (
              <p className="text-xs text-amber-500 font-bold mt-2">{t("pkg.needFoods")}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-56 overflow-y-auto">
                {foods.map((f) => {
                  const sel = items.find((x) => x.foodId === f._id);
                  return (
                    <div key={f._id} className={`border rounded-md p-2 transition ${sel ? "border-brand/60 bg-brand/5" : "border-card-border bg-bg-main"}`}>
                      <button type="button" onClick={() => toggleFood(f._id)} className="w-full text-left">
                        <p className="font-bold text-xs truncate">{sel ? "☑ " : "☐ "}{f.name}</p>
                        <p className="text-[11px] text-muted">৳{f.price}</p>
                      </button>
                      {sel && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <button type="button" onClick={() => stepQty(f._id, -1)} className="w-6 h-6 rounded-lg border border-card-border flex items-center justify-center text-sm font-black">−</button>
                          <span className="text-xs font-black">x{sel.qty}</span>
                          <button type="button" onClick={() => stepQty(f._id, 1)} className="w-6 h-6 rounded-lg border border-card-border flex items-center justify-center text-sm font-black">+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary">{editing ? t("pkg.updatePkg") : t("pkg.savePkg")}</Button>
            <Button type="button" variant="secondary" onClick={reset}>{t("c.cancel")}</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.map((p) => (
          <div key={p._id} className={`bg-card-bg border rounded-lg p-5 ${p.active ? "border-card-border" : "border-card-border opacity-60"}`}>
            <div className="flex justify-between items-start mb-1 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={p.image || "/placeholder-food.png"}
                  alt={p.name}
                  className="w-12 h-12 rounded-lg object-cover border border-card-border shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-food.png"; }}
                />
                <div className="min-w-0">
                  <p className="font-black flex items-center gap-1.5 truncate"><PkgIcon className="w-4 h-4 text-brand shrink-0" />{p.name}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => showConfirm(t("pkg.deleteConfirm", { name: p.name }), async () => { await deletePackage(p._id); showSuccess(t("pkg.deleted")); fetchAll(); })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-xs text-muted mb-2">{p.items.map((it) => `${foodName(it.foodId)} x${it.qty}`).join(" + ")}</p>
            <div className="flex items-center gap-2 mb-3">
              {p.offerPrice && Number(p.offerPrice) > 0 ? (
                <>
                  <span className="text-sm text-muted line-through">৳{p.price}</span>
                  <span className="font-black text-brand text-lg">৳{effectivePrice(p)}</span>
                  {p.offerNote && <span className="text-[10px] font-black px-2 py-1 rounded-full bg-red-500/10 text-red-500 uppercase">{p.offerNote}</span>}
                </>
              ) : (
                <span className="font-black text-brand text-lg">৳{p.price}</span>
              )}
            </div>
            <button
              onClick={async () => { await updatePackage(p._id, { active: !p.active }); fetchAll(); }}
              className={`w-full py-2 rounded-md text-xs font-black border ${p.active ? "bg-accent/10 text-accent border-accent/30" : "bg-bg-main border-card-border text-muted"}`}
            >
              {p.active ? t("pkg.active") : t("pkg.inactive")}
            </button>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-muted text-center mt-8">{t("pkg.empty")}</p>}
    </div>
  );
}
