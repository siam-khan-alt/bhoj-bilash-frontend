"use client";
import { useState, useEffect } from "react";
import { Mail, Calendar, ShoppingBag, DollarSign } from "lucide-react";
import { getCustomerOrders } from "@/lib/api/orders";
import type { CustomerDetails } from "@/types";
import Modal from "@/components/common/Modal";
import { useLang } from "@/context/LanguageContext";

export default function CustomerDetailsModal({ customerId, isOpen, onClose }: { customerId: string | null; isOpen: boolean; onClose: () => void }) {
  const [data, setData] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    if (isOpen && customerId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await getCustomerOrders(customerId!);
          setData(res);
        } catch (err) {
          console.error((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, customerId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("cm.title")}>
      {loading ? (
        <p className="text-muted text-center py-6">{t("cm.loading")}</p>
      ) : !data ? (
        <p className="text-muted text-center py-6">{t("cm.noData")}</p>
      ) : (
        <div className="space-y-5">

          <div className="bg-bg-main rounded-md p-4 space-y-2">
            <h4 className="font-black text-text-main text-lg">{data.customer.name}</h4>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Mail className="w-3.5 h-3.5" />
              <span>{data.customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {t("cm.joined", { date: new Date(data.customer.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric"
                }) })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand/10 rounded-md p-3 text-center">
              <ShoppingBag className="w-5 h-5 text-brand mx-auto mb-1" />
              <p className="font-black text-text-main">{data.totalOrders}</p>
              <p className="text-xs text-muted">{t("cm.orders")}</p>
            </div>
            <div className="bg-accent/10 rounded-md p-3 text-center">
              <DollarSign className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-black text-text-main">৳{data.totalSpent}</p>
              <p className="text-xs text-muted">{t("cm.spent")}</p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-text-main text-sm mb-3">{t("cm.history")}</h5>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.orders.map((order) => (
                <div key={order._id} className="bg-bg-main rounded-md p-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-bold text-text-main">#{order._id.slice(-8)}</p>
                    <p className="text-xs text-muted">{t(`ord.st.${order.orderStatus}`)}{(order.discount || 0) > 0 ? ` • ${t("cm.char", { amt: order.discount })}` : ""}</p>
                  </div>
                  <p className="font-black text-brand">৳{order.totalAmount}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </Modal>
  );
}