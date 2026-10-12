"use client";
import { getAllOrders } from "@/lib/api/orders";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

import CustomerDetailsModal from "@/components/admin/CustomerDetailsModal";
import { useLang } from "@/context/LanguageContext";
import { showError } from "@/components/common/Toast";

const filterOptions = ["all", "placed", "preparing", "delivered", "cancelled", "dine_in", "parcel"] as const;



const statusStyle = (s?: string) =>
  s === "delivered"
    ? "bg-accent/10 text-accent"
    : s === "preparing"
    ? "bg-blue-500/10 text-blue-500"
    : s === "cancelled"
    ? "bg-red-500/10 text-red-500"
    : "bg-amber-500/10 text-amber-500";

// type filter inclusive: "Ekhane khabe" chip e both-o asbe, "Parcel" chip e both-o asbe
const matchType = (t: string | undefined, f: "dine_in" | "parcel") => {
  const v = t || "dine_in";
  return v === f || v === "both";
};

export default function ManageOrders() {
  const { t } = useLang();
  const typeLabel = (v?: string) => (v === "both" ? t("ord.typeBoth") : v === "parcel" ? t("ord.typeParcel") : t("ord.typeDine"));
  const [orders, setOrders] = useState<import('@/types').Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders([...data].reverse());
    } catch (err) {
      showError(t("ord.loadFail"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-muted font-bold">{t("ord.loading")}</p>;

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "dine_in" || filter === "parcel") return matchType(o.orderType, filter);
    return o.orderStatus === filter;
  });
  const count = (f: (typeof filterOptions)[number]) =>
    f === "all" ? orders.length
    : f === "dine_in" || f === "parcel" ? orders.filter((o) => matchType(o.orderType, f)).length
    : orders.filter((o) => o.orderStatus === f).length;

  return (
    <div>
      <h2 className="text-xl font-black text-text-main mb-4">{t("ord.title")}</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-black border ${filter === f ? "bg-brand text-white border-brand" : "bg-card-bg border-card-border text-muted"}`}
          >
            {f === "all" ? `${t("ord.all")} (${count(f)})` : f === "dine_in" ? `${t("ord.dineIn")} (${count(f)})` : f === "parcel" ? `${t("ord.parcel")} (${count(f)})` : `${f} (${count(f)})`}
          </button>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-bg-main text-muted text-left">
            <tr>
              <th className="p-3">{t("ord.thId")}</th>
              <th className="p-3">{t("ord.thCus")}</th>
              <th className="p-3">{t("ord.thType")}</th>
              <th className="p-3">{t("ord.thTotal")}</th>
              <th className="p-3">{t("ord.thPay")}</th>
              <th className="p-3">{t("ord.thStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order._id} className="border-t border-card-border">
                <td className="p-3 font-bold text-text-main">#{order._id.slice(-8)}</td>

                <td className="p-3">
                  <button
                    onClick={() => setSelectedCustomerId(order.customer?._id)}
                    className="flex items-center gap-1.5 hover:text-brand transition group"
                  >
                    <div className="text-left">
                      <p className="font-bold text-text-main group-hover:text-brand transition">
                        {order.customer?.name}
                      </p>
                      <p className="text-xs text-muted">{order.customer?.email}</p>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-muted group-hover:text-brand transition" />
                  </button>
                </td>

                <td className="p-3">
                  <span className={`text-[11px] font-black px-2 py-1 rounded-full whitespace-nowrap ${(order.orderType || "dine_in") === "parcel" ? "bg-blue-500/10 text-blue-500" : (order.orderType || "dine_in") === "both" ? "bg-violet-500/10 text-violet-500" : "bg-accent/10 text-accent"}`}>
                    {typeLabel(order.orderType)}
                  </span>
                </td>

                <td className="p-3">
                  <p className="font-bold text-brand">৳{order.totalAmount}</p>
                  {(order.discount || 0) > 0 && (
                    <p className="text-[11px] font-bold text-amber-500">{t("ord.char", { amt: order.discount })}</p>
                  )}
                </td>

                <td className="p-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${
                      order.paymentStatus === "paid"
                        ? "bg-accent/10 text-accent"
                        : order.paymentStatus === "failed"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {t(`ord.pay.${order.paymentStatus}`)}
                  </span>
                </td>

                <td className="p-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${statusStyle(order.orderStatus)}`}>
                    {t(`ord.st.${order.orderStatus}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted py-8 text-sm">{t("ord.empty")}</p>}
      </div>

      <CustomerDetailsModal
        customerId={selectedCustomerId}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
}