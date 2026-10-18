import type { Order, OrderStatus, OrderType, CustomerDetails, User } from "@/types";
import { apiFetch, apiFetchAll } from "./client";

/** POS customer theke phone ber koro — backend phone diye group kore (id diye na). */
function phoneOf(customer: Pick<User, "_id" | "name" | "email">): string {
  const email = customer.email || "";
  if (email.endsWith("@pos.local")) return email.split("@")[0];
  const m = customer.name.match(/Walk-in\s+(\S+)/);
  if (m && m[1] !== "customer") return m[1].replace(/[()]/g, "");
  return "";
}

export async function createOrder(
  items: { foodItemId: string; quantity: number; label?: string; price?: number }[],
  customer: Pick<User, "_id" | "name" | "email">,
  opts?: { orderStatus?: OrderStatus; orderType?: OrderType; discount?: number }
): Promise<{ order: Order }> {
  return apiFetch<{ order: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      items,
      customerPhone: phoneOf(customer),
      customer,
      orderType: opts?.orderType || "dine_in",
      discount: opts?.discount || 0,
    }),
  });
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  const all = await getAllOrders();
  return all.filter((o) => o.customer._id === userId);
}

export async function getOrderById(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`);
}

export async function getAllOrders(): Promise<Order[]> {
  return apiFetchAll<Order>("/orders");
}

export async function getCustomerOrders(customerId: string): Promise<CustomerDetails> {
  // customerId phone o hote pare, pos-local email o hote pare — phone e normalize koro
  let phone = customerId;
  if (customerId.includes("@")) phone = customerId.split("@")[0];
  if (customerId.startsWith("Walk-in")) phone = phoneOf({ _id: customerId, name: customerId, email: "" });
  return apiFetch<CustomerDetails>(`/orders/by-phone?phone=${encodeURIComponent(phone)}`);
}

export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus }),
  });
}
