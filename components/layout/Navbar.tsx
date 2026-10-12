"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { useLang } from "@/context/LanguageContext";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";
import Button from "@/components/common/Button";
import LangToggle from "@/components/common/LangToggle";
import { showConfirm } from "@/components/common/Toast";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { config } = useRestaurant();
  const { t } = useLang();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = (href: string) =>
    `relative text-sm font-bold transition py-1 flex items-center gap-1.5 ${
      pathname === href
        ? "text-brand after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand after:rounded-full"
        : "text-text-main hover:text-brand"
    }`;

  const NavItem = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className={navLinkClass(href)} onClick={() => setMobileMenuOpen(false)}>
      <span>{label}</span>
    </Link>
  );

  const isStaff = user?.role === "admin" || user?.role === "cashier";

  return (
    <header className="sticky top-0 z-50 bg-bg-main border-b border-card-border">
      <div className="container mx-auto px-6 lg:px-16 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
          <img src="/logo.png" alt="Bhoj Bilash" className="w-10 h-10 object-contain transform group-hover:rotate-6 transition-transform duration-300" />
          <span className="hidden sm:inline text-2xl font-black tracking-tight text-text-main">
            Bhoj<span className="text-brand">Bilash</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <NavItem href="/" label={t("nav.home")} />
          <NavItem href="/menu" label={t("nav.menu")} />
          {isStaff && <NavItem href="/admin" label={user?.role === "cashier" ? t("nav.cashier") : t("nav.admin")} />}
        </div>

        <div className="flex items-center space-x-3">
          <span className="hidden lg:block text-xs font-bold text-muted">{config.name}</span>
          <LangToggle compact />
          <Button
            variant="icon"
            onClick={toggleTheme}
            icon={theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            aria-label="Toggle theme"
          />
          {user ? (
            <Button
              variant="icon"
              onClick={() => showConfirm(t("nav.logoutConfirm"), logout)}
              icon={<LogOut className="w-5 h-5" />}
              className="hidden sm:flex"
              aria-label="Logout"
            />
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="primary" className="px-5 py-2.5">{t("nav.login")}</Button>
            </Link>
          )}
          <button className="md:hidden p-2 text-text-main" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden flex flex-col space-y-4 px-6 pb-4 border-t border-card-border pt-4">
          <NavItem href="/" label={t("nav.home")} />
          <NavItem href="/menu" label={t("nav.menu")} />
          {isStaff && <NavItem href="/admin" label={t("nav.admin")} />}
          {user ? (
            <Button
              variant="secondary"
              onClick={() => showConfirm(t("nav.logoutConfirm"), () => { logout(); setMobileMenuOpen(false); })}
              icon={<LogOut className="w-4 h-4" />}
              className="w-full justify-start px-4 py-2.5"
            >
              {t("nav.logout")}
            </Button>
          ) : (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full justify-center px-4 py-2.5">{t("nav.login")}</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
