import type { Food, Order, OrderStatus, OrderType, CustomerDetails, User } from "@/types";
import { seedOrders } from "@/lib/mocks/orders";
import { getFoodById } from "./food";
import { mockUsers } from "@/lib/mocks/users";
import { apiFetch, isRealApi, unwrapList } from "./client";

const STORAGE_KEY = "mock_orders";
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [...seedOrders];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...seedOrders];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedOrders));
  return [...seedOrders];
}

function setStoredOrders(orders: Order[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

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
  if (isRealApi()) {
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
  await delay();
  const orders = getStoredOrders();
  let subtotal = 0;
  const orderItems = items.map((it) => {
    const food = getFoodById(it.foodItemId);
    if (food) {
      subtotal += food.price * it.quantity;
      return { foodItem: food, quantity: it.quantity, price: food.price };
    }
    // package line — menu te nai, POS theke nam+dam asbe (package venge dekhabo na)
    if (!it.label || it.price === undefined) throw new Error(`Item ${it.foodItemId} not found`);
    const price = Math.max(0, Number(it.price));
    const pseudo: Food = { _id: it.foodItemId, name: it.label, category: "Package", price, image: "", available: true };
    subtotal += price * it.quantity;
    return { foodItem: pseudo, quantity: it.quantity, price };
  });
  // total e char — 0 theke subtotal porjonto
  const discount = Math.min(Math.max(0, Number(opts?.discount) || 0), subtotal);

  const order: Order = {
    _id: `order_${Date.now()}`,
    customer,
    items: orderItems,
    totalAmount: subtotal - discount,
    discount,
    orderStatus: opts?.orderStatus || "placed",
    paymentStatus: "paid",
    orderType: opts?.orderType || "dine_in",
    createdAt: new Date().toISOString(),
  };
  const updated = [...orders, order];
  setStoredOrders(updated);
  return { order };
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  if (isRealApi()) {
    const all = await getAllOrders();
    return all.filter((o) => o.customer._id === userId);
  }
  await delay();
  return getStoredOrders().filter((o) => o.customer._id === userId);
}

export async function getOrderById(orderId: string, requesterId?: string, requesterRole?: string): Promise<Order> {
  if (isRealApi()) {
    return apiFetch<Order>(`/orders/${orderId}`);
  }
  await delay();
  const order = getStoredOrders().find((o) => o._id === orderId);
  if (!order) throw new Error("Order not found");
  if (requesterRole !== "admin" && requesterId && order.customer._id !== requesterId) {
    throw new Error("Order not found");
  }
  return order;
}

export async function getAllOrders(): Promise<Order[]> {
  if (isRealApi()) {
    const data = await apiFetch<unknown>("/orders");
    return unwrapList<Order>(data);
  }
  await delay();
  return getStoredOrders();
}

export async function getCustomerOrders(customerId: string): Promise<CustomerDetails> {
  if (isRealApi()) {
    // customerId phone o hote pare, pos-local email o hote pare — phone e normalize koro
    let phone = customerId;
    if (customerId.includes("@")) phone = customerId.split("@")[0];
    if (customerId.startsWith("Walk-in")) phone = phoneOf({ _id: customerId, name: customerId, email: "" });
    return apiFetch<CustomerDetails>(`/orders/by-phone?phone=${encodeURIComponent(phone)}`);
  }
  await delay();
  const orders = getStoredOrders().filter((o) => o.customer._id === customerId);
  const users = (() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mock_users");
      if (saved) {
        try {
          return JSON.parse(saved) as (User & { password: string })[];
        } catch {}
      }
    }
    return mockUsers;
  })();
  const user = users.find((u) => u._id === customerId);
  if (!user) throw new Error("Customer not found");
  const totalOrders = orders.length;
  const totalSpent = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.totalAmount, 0);
  return {
    customer: { name: user.name, email: user.email, createdAt: user.createdAt },
    totalOrders,
    totalSpent,
    orders,
  };
}

export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<Order> {
  if (isRealApi()) {
    return apiFetch<Order>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ orderStatus }),
    });
  }
  await delay();
  const allowed: OrderStatus[] = ["placed", "preparing", "delivered", "cancelled"];
  if (!allowed.includes(orderStatus)) throw new Error("Invalid order status");
  const orders = getStoredOrders();
  const idx = orders.findIndex((o) => o._id === orderId);
  if (idx === -1) throw new Error("Order not found");
  orders[idx] = { ...orders[idx], orderStatus };
  setStoredOrders(orders);
  return orders[idx];
}
