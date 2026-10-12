"use client";

import { useAuth } from "@/context/AuthContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  ShoppingCart,
  Users,
  CalendarCheck,
  Receipt,
  Calculator,
  Package as PkgIcon,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";

/**
 * Choto hotel guard:
 * - admin: sob page
 * - cashier: dashboard, pos, orders, attendance, expenses
 *   (NO foods, NO packages, NO staff, NO hisab)
 */
const CASHIER_BLOCKED = ["/admin/foods", "/admin/packages", "/admin/staff", "/admin/hisab"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { config } = useRestaurant();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin" && user.role !== "cashier") router.push("/");
    else if (user.role === "cashier" && CASHIER_BLOCKED.some((p) => pathname.startsWith(p)))
      router.push("/admin/pos");
  }, [user, pathname, router]);

  if (!user || (user.role !== "admin" && user.role !== "cashier")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <p className="text-muted font-bold">Checking access...</p>
      </div>
    );
  }

  const isCashier = user.role === "cashier";

  return (
    <DashboardShell
      eyebrow={isCashier ? "Cashier Panel" : "Restaurant Admin"}
      title={config.name}
      subtitle={isCashier ? "Walk-in order + hajira — simple kaj" : "Dokaner sob hisab ekhane"}
      accent="brand"
      sections={[
        {
          title: "",
          items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
        },
        {
          title: "Dokan",
          items: [
            ...(isCashier
              ? []
              : [
                  { href: "/admin/foods" as const, label: "Manage Foods", icon: UtensilsCrossed },
                  { href: "/admin/packages" as const, label: "Package + Offer", icon: PkgIcon },
                ]),
            { href: "/admin/orders" as const, label: "Manage Orders", icon: ClipboardList },
          ],
        },
        {
          title: "Operations",
          items: [
            { href: "/admin/pos" as const, label: "POS Terminal", icon: ShoppingCart, badge: "LIVE" },
            { href: "/admin/attendance" as const, label: "Hajira", icon: CalendarCheck },
            { href: "/admin/expenses" as const, label: "Khoroc", icon: Receipt },
          ],
        },
        ...(isCashier
          ? []
          : [
              {
                title: "Khata",
                items: [
                  { href: "/admin/staff" as const, label: "Staff + Beton", icon: Users },
                  { href: "/admin/hisab" as const, label: "Hisab Nikash", icon: Calculator, badge: "NEW" },
                ],
              },
            ]),
      ]}
    >
      {children}
    </DashboardShell>
  );
}
