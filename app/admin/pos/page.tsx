"use client";

import { useState, useEffect } from "react";
import { getFoods } from "@/lib/api/food";
import { createOrder } from "@/lib/api/orders";
import { getPackages, effectivePrice } from "@/lib/api/packages";
import { useRestaurant } from "@/context/RestaurantContext";
import BillReceipt from "@/components/pos/BillReceipt";
import type { Food, Package, Order } from "@/types";
import Button from "@/components/common/Button";
import { showSuccess, showError } from "@/components/common/Toast";
import { Plus, Trash2, UtensilsCrossed, ShoppingBag, Check, Minus, Package as PkgIcon, Printer, X, Search } from "lucide-react";

export default function POSPage() {
  const { config } = useRestaurant();
  const [foods, setFoods] = useState<Food[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  type CartLine =
    | { kind: "food"; key: string; food: Food; qty: number }
    | { kind: "package"; key: string; pkgId: string; name: string; detail: string; unitPrice: number; qty: number };

  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [dineIn, setDineIn] = useState(true);
  const [parcel, setParcel] = useState(false);
  const [discount, setDiscount] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [menuUrl, setMenuUrl] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const orderType = dineIn && parcel ? "both" : parcel ? "parcel" : "dine_in";

  useEffect(() => {
    getFoods().then(setFoods);
    getPackages(true).then(setPackages);
  }, []);

  const foodById = (id: string) => foods.find((f) => f._id === id);

  const addPackage = (p: Package) => {
    // package vangbe na — cart e 1 line: package nam + dam
    // sesh item thakle bad diye janano hobe
    const missing = p.items.filter((it) => foodById(it.foodId)?.available === false).map((it) => foodById(it.foodId)?.name || "item");
    if (missing.length === p.items.length) return showError(`${p.name} ekhon deya jabe na (${missing.join(", ")} sesh)`);
    const detail = p.items.map((it) => `${foodById(it.foodId)?.name || "item"} x${it.qty}`).join(" + ");
    const price = effectivePrice(p);
    setCart((prev) => {
      const ex = prev.find((x) => x.kind === "package" && x.pkgId === p._id);
      if (ex) return prev.map((x) => (x.kind === "package" && x.pkgId === p._id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { kind: "package", key: `pkg_${p._id}`, pkgId: p._id, name: p.name, detail, unitPrice: price, qty: 1 } as CartLine];
    });
    showSuccess(`${p.name} add — ৳${price}${missing.length > 0 ? ` (${missing.join(", ")} sesh!)` : ""}`);
  };

  const addToCart = (f: Food) => {
    setCart((prev) => {
      const ex = prev.find((x) => x.kind === "food" && x.food._id === f._id);
      if (ex) return prev.map((x) => (x.kind === "food" && x.food._id === f._id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { kind: "food", key: `food_${f._id}`, food: { ...f }, qty: 1 } as CartLine];
    });
  };

  const setQty = (key: string, d: number) => {
    setCart((prev) =>
      prev
        .map((x) => (x.key === key ? { ...x, qty: x.qty + d } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const lineTotal = (l: CartLine) => (l.kind === "food" ? l.food.price : l.unitPrice) * l.qty;
  const subtotal = cart.reduce((s, l) => s + lineTotal(l), 0);
  const discountAmt = Math.min(Math.max(0, Number(discount) || 0), subtotal);
  const total = subtotal - discountAmt;

  const handlePlace = async () => {
    if (cart.length === 0) return showError("Cart empty");
    const items = cart.map((l) =>
      l.kind === "food"
        ? { foodItemId: l.food._id, quantity: l.qty }
        : { foodItemId: `pkgline_${l.pkgId}`, quantity: l.qty, label: l.name, price: l.unitPrice }
    );
    const typeLabel = orderType === "both" ? "Ekhane+Parcel" : orderType === "parcel" ? "Parcel" : "Ekhane khabe";
    const customer = { _id: `pos_${Date.now()}`, name: `Walk-in ${customerPhone || "customer"} (${typeLabel})`, email: `${customerPhone || "walkin"}@pos.local` };
    try {
      const { order } = await createOrder(items, customer, { orderType, discount: discountAmt });
      setLastOrder(order);
      setMenuUrl(`${window.location.origin}/menu`);
      setCart([]);
      setCustomerPhone("");
      setDiscount("");
    } catch (e) {
      showError((e as Error).message);
    }
  };

  const availFoods = foods.filter((f) => f.available !== false);
  const cats = ["All", ...Array.from(new Set(availFoods.map((f) => f.category || "Onno")))];
  const q = query.trim().toLowerCase();
  const visibleFoods = availFoods.filter(
    (f) => (cat === "All" || (f.category || "Onno") === cat) && (!q || f.name.toLowerCase().includes(q))
  );
  const qtyOf = (id: string) => cart.find((x) => x.kind === "food" && x.food._id === id)?.qty || 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-195px)] lg:min-h-[540px]">
      {/* ---- LEFT: menu (sob item ek screen e, scroll chara) ---- */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
          <h2 className="text-xl font-black mr-auto">POS — Walk-in Order</h2>
          <div className="flex items-center gap-2 rounded-md border border-card-border bg-card-bg px-3 py-2 w-full sm:w-64">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Khabar khujun... (nam likhun)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="text-muted hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {cats.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 shrink-0 scrollbar-hide">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black border whitespace-nowrap transition ${
                  cat === c ? "bg-brand text-white border-brand" : "bg-card-bg border-card-border text-muted hover:border-brand/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {packages.length > 0 && (
          <div className="mb-2 shrink-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-muted mb-1.5">Package — 1 tap e full set</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-0.5">
              {packages.map((p) => {
                const hasOffer = p.offerPrice && Number(p.offerPrice) > 0;
                return (
                  <button key={p._id} onClick={() => addPackage(p)} className="bg-gradient-to-br from-brand/10 to-transparent border border-brand/30 rounded-md px-2.5 py-2 text-left hover:border-brand/60 active:scale-[0.99] transition">
                    <div className="flex items-center gap-1.5">
                      <PkgIcon className="w-3.5 h-3.5 text-brand shrink-0" />
                      <p className="font-black text-[13px] flex-1 truncate">{p.name}</p>
                      {hasOffer && p.offerNote && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white uppercase shrink-0">{p.offerNote}</span>
                      )}
                      <span className="text-brand font-black text-[13px] shrink-0">৳{effectivePrice(p)}</span>
                    </div>
                    <p className="text-[10px] text-muted truncate mt-0.5">{p.items.map((it) => `${foodById(it.foodId)?.name || "item"} x${it.qty}`).join(" + ")}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-muted">Menu — tap korlei add</p>
          <p className="text-[11px] font-bold text-muted">{visibleFoods.length}/{availFoods.length} items</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1 pb-1">
          {visibleFoods.map((f) => {
            const qty = qtyOf(f._id);
            const active = qty > 0;
            return (
              <div
                key={f._id}
                onClick={() => addToCart(f)}
                className={`group relative overflow-hidden rounded-md border text-left transition-all duration-200 cursor-pointer active:scale-[0.98] min-h-[86px] flex flex-col justify-end shadow-sm hover:shadow-md ${
                  active ? "border-brand ring-2 ring-brand/40" : "border-card-border hover:border-brand/60"
                }`}
              >
                <img
                  src={f.image || "/placeholder-food.png"}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                {f.category && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase tracking-wide text-white/90 bg-black/45 backdrop-blur-sm px-1.5 py-0.5 rounded-full z-10">
                    {f.category}
                  </span>
                )}
                <div className="relative p-2 pt-5">
                  <p className="font-bold text-[13px] leading-tight truncate text-white drop-shadow">{f.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white font-black text-[15px] drop-shadow">৳{f.price}</span>
                    {active ? (
                      <span className="flex items-center gap-1 bg-white rounded-full pl-0.5 pr-1 py-0.5 shadow z-10" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setQty(`food_${f._id}`, -1)}
                          aria-label="Komao"
                          className="w-5 h-5 rounded-full bg-bg-main border border-card-border flex items-center justify-center text-text-main hover:border-brand"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[11px] font-black text-text-main min-w-4 text-center">{qty}</span>
                        <button
                          onClick={() => addToCart(f)}
                          aria-label="Barao"
                          className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-hover"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-white bg-brand px-2 py-1 rounded-full flex items-center gap-0.5 shadow group-hover:bg-brand-hover transition">
                        <Plus className="w-3 h-3" />ADD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {visibleFoods.length === 0 && (
          <p className="text-xs text-muted text-center py-8 shrink-0">
            {q || cat !== "All" ? "Mil pai nai — search/category bodlan." : "Menu khali — Foods page theke item add korun."}
          </p>
        )}
      </div>

      {/* ---- RIGHT: cart (fixed footer, lines scroll) ---- */}
      <div className="w-full lg:w-80 shrink-0 bg-card-bg border border-card-border rounded-lg p-5 lg:h-full lg:min-h-0 flex flex-col lg:overflow-hidden">
        <h3 className="font-black mb-3 shrink-0">Cart ({cart.length})</h3>
        <div className="space-y-2 mb-4 max-h-48 lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto lg:pr-1">
          {cart.map((l) => (
            <div key={l.key} className={`flex justify-between items-center gap-2 text-sm border rounded-md px-2.5 py-2 ${l.kind === "package" ? "border-brand/40 bg-brand/5" : "border-card-border bg-bg-main"}`}>
              <span className="flex-1 min-w-0">
                <span className="font-bold block truncate">{l.kind === "food" ? l.food.name : l.name}</span>
                {l.kind === "package" && <span className="text-[10px] text-muted block truncate">{l.detail}</span>}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <button onClick={() => setQty(l.key, -1)} className="w-6 h-6 rounded-md border border-card-border flex items-center justify-center">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-black w-5 text-center">{l.qty}</span>
                <button onClick={() => setQty(l.key, 1)} className="w-6 h-6 rounded-md border border-card-border flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </button>
              </span>
              <span className="font-black text-xs whitespace-nowrap">৳{lineTotal(l)}</span>
              <button onClick={() => setCart((prev) => prev.filter((x) => x.key !== l.key))} className="text-red-500 p-1 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {cart.length === 0 && <p className="text-xs text-muted text-center py-4">Cart khali — Menu theke khabar add korun</p>}
        </div>

        <div className="shrink-0 lg:overflow-y-auto">
        <div className="space-y-3 mb-4">
          <input placeholder="Customer Phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-3 py-2 rounded-md border border-card-border bg-bg-main text-sm" />
          <div className="flex gap-2">
            <button
              onClick={() => setDineIn(!dineIn)}
              className={`flex-1 py-2 rounded-md font-bold text-xs border flex items-center justify-center gap-1.5 ${dineIn ? "bg-brand text-white border-brand" : "bg-bg-main border-card-border text-muted"}`}
            >
              <span className={`w-4 h-4 rounded-md flex items-center justify-center border ${dineIn ? "bg-white border-white" : "border-card-border"}`}>
                {dineIn && <Check className="w-3 h-3 text-brand" />}
              </span>
              <UtensilsCrossed className="w-3.5 h-3.5" /> Ekhane khabe
            </button>
            <button
              onClick={() => setParcel(!parcel)}
              className={`flex-1 py-2 rounded-md font-bold text-xs border flex items-center justify-center gap-1.5 ${parcel ? "bg-brand text-white border-brand" : "bg-bg-main border-card-border text-muted"}`}
            >
              <span className={`w-4 h-4 rounded-md flex items-center justify-center border ${parcel ? "bg-white border-white" : "border-card-border"}`}>
                {parcel && <Check className="w-3 h-3 text-brand" />}
              </span>
              <ShoppingBag className="w-3.5 h-3.5" /> Parcel nibe
            </button>
          </div>
          {!dineIn && !parcel && <p className="text-[11px] text-amber-500 font-bold">Ekta o tick nai — Ekhane khabe dhore neya hobe.</p>}
          <div className="flex gap-2">
            <button onClick={() => setPayment("cash")} className={`flex-1 py-2 rounded-md font-bold text-xs border ${payment === "cash" ? "bg-brand text-white border-brand" : "bg-bg-main border-card-border"}`}>
              Cash
            </button>
            <button onClick={() => setPayment("card")} className={`flex-1 py-2 rounded-md font-bold text-xs border ${payment === "card" ? "bg-brand text-white border-brand" : "bg-bg-main border-card-border"}`}>
              Card
            </button>
          </div>
        </div>

        <div className="flex justify-between text-sm text-muted mb-1">
          <span>Subtotal</span>
          <span className="font-bold text-text-main">৳{subtotal}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs font-black text-muted whitespace-nowrap">Char (৳)</label>
          <input
            type="number"
            min={0}
            max={subtotal}
            placeholder="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-card-border bg-bg-main text-sm font-black outline-none focus:border-brand/50"
          />
        </div>
        <div className="flex justify-between font-black text-lg mb-4">
          <span>Total</span>
          <span className="text-brand">৳{total}</span>
        </div>

        <Button variant="primary" className="w-full justify-center" onClick={handlePlace}>
          Place Order — {payment === "cash" ? "Cash" : "Card"}
        </Button>
        <p className="text-xs text-muted mt-2 text-center">Bill + QR receipt print hobe.</p>
        </div>
      </div>

      {lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-sm">
            <div className="bg-card-bg border border-card-border rounded-lg p-4 mb-3 flex gap-2">
              <Button variant="primary" className="flex-1 justify-center" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                Print Bill
              </Button>
              <Button variant="secondary" icon={<X className="w-4 h-4" />} onClick={() => setLastOrder(null)}>
                Close
              </Button>
            </div>
            <BillReceipt order={lastOrder} shop={config} menuUrl={menuUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
