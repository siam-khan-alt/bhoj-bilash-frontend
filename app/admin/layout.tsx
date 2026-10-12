"use client";

import { useAuth } from "@/context/AuthContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { useLang } from "@/context/LanguageContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  ReceiptText,
  Users,
  CalendarCheck,
  Receipt,
  Calculator,
  Package as PkgIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";

/**
 * Choto hotel guard:
 * - admin: sob page
 * - cashier: dashboard, pos, orders, attendance, expenses
 *   (NO foods, NO packages, NO staff, NO hisab)
 */
const CASHIER_BLOCKED = ["/admin/foods", "/admin/packages", "/admin/staff", "/admin/hisab", "/admin/settings"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { config } = useRestaurant();
  const { t } = useLang();
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
        <p className="text-muted font-bold">{t("c.checking")}</p>
      </div>
    );
  }

  const isCashier = user.role === "cashier";

  return (
    <DashboardShell
      eyebrow={isCashier ? t("shell.cashierPanel") : t("shell.adminPanel")}
      title={config.name}
      subtitle={isCashier ? t("shell.cashierSub") : t("shell.adminSub")}
      accent="brand"
      sections={[
        {
          title: "",
          items: [{ href: "/admin" as const, label: t("nav.dashboard"), icon: LayoutDashboard }],
        },
        {
          title: t("sec.shop"),
          items: [
            ...(isCashier
              ? []
              : [
                  { href: "/admin/foods" as const, label: t("nav.foods"), icon: UtensilsCrossed },
                  { href: "/admin/packages" as const, label: t("nav.packages"), icon: PkgIcon },
                ]),
            { href: "/admin/orders" as const, label: t("nav.orders"), icon: ClipboardList },
          ],
        },
        {
          title: t("sec.ops"),
          items: [
            { href: "/admin/pos" as const, label: t("nav.pos"), icon: ReceiptText, badge: "LIVE" },
            { href: "/admin/attendance" as const, label: t("nav.hajira"), icon: CalendarCheck },
            { href: "/admin/expenses" as const, label: t("nav.expense"), icon: Receipt },
          ],
        },
        ...(isCashier
          ? []
          : [
              {
                title: t("sec.khata"),
                items: [
                  { href: "/admin/staff" as const, label: t("nav.staff"), icon: Users },
                  { href: "/admin/hisab" as const, label: t("nav.hisab"), icon: Calculator, badge: "NEW" },
                  { href: "/admin/settings" as const, label: t("nav.settings"), icon: SettingsIcon },
                ],
              },
            ]),
      ]}
    >
      {children}
    </DashboardShell>
  );
}
