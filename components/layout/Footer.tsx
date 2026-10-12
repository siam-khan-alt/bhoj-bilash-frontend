"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-card-bg border-t border-card-border mt-10">
      <div className="container mx-auto px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="Bhoj Bilash" className="w-9 h-9 object-contain" />
              <span className="text-xl font-black text-text-main">
                Bhoj<span className="text-brand">Bilash</span>
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">{t("foot.tagline")}</p>
          </div>

          <div>
            <h4 className="font-black text-text-main text-sm mb-4 uppercase tracking-wide">{t("foot.quick")}</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/" className="text-sm text-muted hover:text-brand transition">{t("nav.home")}</Link>
              <Link href="/menu" className="text-sm text-muted hover:text-brand transition">{t("nav.menu")}</Link>
              <Link href="/login" className="text-sm text-muted hover:text-brand transition">{t("nav.login")}</Link>
              <Link href="/register" className="text-sm text-muted hover:text-brand transition">{t("foot.register")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-black text-text-main text-sm mb-4 uppercase tracking-wide">{t("foot.contact")}</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone className="w-4 h-4 text-brand flex-shrink-0" />
                <span>+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Mail className="w-4 h-4 text-brand flex-shrink-0" />
                <span>hello@bhojbilash.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-black text-text-main text-sm mb-4 uppercase tracking-wide">{t("foot.follow")}</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-md bg-bg-main border border-card-border flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-md bg-bg-main border border-card-border flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-md bg-bg-main border border-card-border flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-card-border pt-6 text-center">
          <p className="text-xs text-muted">{t("foot.rights", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
