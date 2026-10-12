"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Bell,
  Menu,
  X,
  Store,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { showConfirm } from "@/components/common/Toast";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface DashboardNavSection {
  title: string;
  items: DashboardNavItem[];
}

interface DashboardShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  tenantName?: string;
  tenantMeta?: string;
  accent?: "brand" | "violet";
  sections: DashboardNavSection[];
  children: React.ReactNode;
}

/**
 * Standard isolated dashboard shell — no shop Navbar/Footer.
 * Sidebar follows theme: light in light mode, dark in dark mode.
 */
export default function DashboardShell({
  eyebrow,
  title,
  subtitle,
  accent = "brand",
  sections,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  const activeCls =
    accent === "brand"
      ? "bg-brand text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.7)]"
      : "bg-violet-600 text-white shadow-[0_8px_24px_-8px_rgba(124,58,237,0.7)]";

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    showConfirm("Logout from dashboard?", () => {
      logout();
      router.push("/login");
    });
  };

  const sidebar = (
    <div className={`flex h-full flex-col transition-colors ${isDark ? "bg-[#100d0c] text-white" : "bg-white text-text-main border-r border-card-border"}`}>
      {/* brand */}
      <div className="relative overflow-hidden px-5 pt-6 pb-5">
        <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full blur-[70px] pointer-events-none ${isDark ? "bg-brand/20" : "bg-brand/10"}`} />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-amber-500/10 blur-[70px] pointer-events-none" />
        <Link href="/" className="relative flex items-center gap-3">
          <img src="/logo.png" alt="Bhoj Bilash" className="h-10 w-10 object-contain" />
          <div>
            <p className="text-lg font-black leading-none tracking-tight">
              Bhoj <span className={accent === "brand" ? "text-brand" : "text-violet-500"}>Bilash</span>
            </p>
            <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-white/50" : "text-muted"}`}>
              {eyebrow}
            </p>
          </div>
        </Link>
      </div>

      {/* nav */}
      <nav className="mt-3 flex-1 space-y-6 overflow-y-auto px-3 pb-4 scrollbar-hide">
        {sections.map((sec) => (
          <div key={sec.title || "untitled"}>
            {sec.title ? (
            <p className={`px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-muted"}`}>
              {sec.title}
            </p>
            ) : null}
            <div className="space-y-1">
              {sec.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-bold transition-all ${
                      active ? activeCls : isDark ? "text-white/70 hover:bg-white/[0.06] hover:text-white" : "text-muted hover:bg-bg-main hover:text-text-main"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? "bg-white/20 text-white" : isDark ? "bg-white/10 text-white/60" : "bg-bg-main border border-card-border text-muted"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className={`space-y-2 border-t p-3 ${isDark ? "border-white/10" : "border-card-border"}`}>
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-bold transition ${isDark ? "text-white/70 hover:bg-white/[0.06] hover:text-white" : "text-muted hover:bg-bg-main hover:text-text-main"}`}
        >
          <Store className="h-4 w-4" /> View storefront
        </Link>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-bold transition ${isDark ? "text-white/70 hover:bg-red-500/15 hover:text-red-300" : "text-muted hover:bg-red-50 hover:text-red-600"}`}
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg-main text-text-main">
      {/* desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 hidden w-72 lg:block ${isDark ? "" : "shadow-[1px_0_0_0_var(--color-card-border)]"}`}>{sidebar}</aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-hidden rounded-r-lg">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className={`absolute right-3 top-3 z-10 rounded-lg p-1.5 ${isDark ? "bg-white/10 text-white" : "bg-black/10 text-text-main"}`}
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* main column */}
      <div className="lg:pl-72">
        {/* topbar */}
        <header className="sticky top-0 z-30 border-b border-card-border bg-bg-main/85 glass-effect">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-md border border-card-border bg-card-bg p-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Bhoj Bilash <span className="mx-1">/</span> {eyebrow}
              </p>
              <h1 className="truncate text-lg font-black sm:text-xl">{title}</h1>
              <p className="hidden truncate text-xs text-muted sm:block">{subtitle}</p>
            </div>
            <div className="hidden min-w-0 flex-1 max-w-xs items-center gap-2 rounded-md border border-card-border bg-card-bg px-3 py-2 md:flex">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                placeholder="Search orders, foods..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
              <kbd className="rounded-md border border-card-border bg-bg-main px-1.5 py-0.5 text-[10px] font-bold text-muted">
                /
              </kbd>
            </div>
            <span className="hidden text-xs font-bold text-muted xl:block">{today}</span>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md border border-card-border bg-card-bg p-2.5 transition hover:border-brand/40"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
            <button aria-label="Notifications" className="relative rounded-md border border-card-border bg-card-bg p-2.5 transition hover:border-brand/40">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-black text-white">
                3
              </span>
            </button>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md font-black text-white ${accent === "brand" ? "bg-gradient-to-br from-brand to-orange-600" : "bg-gradient-to-br from-violet-600 to-indigo-600"}`}>
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
