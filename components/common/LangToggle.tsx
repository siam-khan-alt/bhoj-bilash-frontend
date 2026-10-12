"use client";

import { useLang } from "@/context/LanguageContext";

/** BN | EN segmented toggle — navbar + dashboard topbar e use hoy. */
export default function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  const btn = (active: boolean) =>
    `px-2.5 ${compact ? "py-1" : "py-1.5"} text-[11px] font-black rounded-md transition ${
      active ? "bg-brand text-white shadow" : "text-muted hover:text-text-main"
    }`;
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-card-border bg-card-bg p-0.5" role="group" aria-label="Language">
      <button onClick={() => setLang("bn")} className={btn(lang === "bn")} aria-pressed={lang === "bn"}>
        বাংলা
      </button>
      <button onClick={() => setLang("en")} className={btn(lang === "en")} aria-pressed={lang === "en"}>
        EN
      </button>
    </div>
  );
}
