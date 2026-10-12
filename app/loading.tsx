"use client";

import { useLang } from "@/context/LanguageContext";

export default function Loading() {
  const { t } = useLang();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-muted font-bold">{t("c.loading")}</p>
    </div>
  );
}
