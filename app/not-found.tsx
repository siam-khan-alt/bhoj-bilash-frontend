"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h2 className="text-2xl font-black text-text-main mb-2">{t("nf.title")}</h2>
      <p className="text-muted mb-6">{t("nf.sub")}</p>
      <Link href="/" className="text-brand font-bold hover:underline">
        {t("nf.home")}
      </Link>
    </div>
  );
}
