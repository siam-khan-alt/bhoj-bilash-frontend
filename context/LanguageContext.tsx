"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LANG_KEY, getStoredLang, translate, type Lang } from "@/lib/i18n/dict";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LangContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    setLangState(getStoredLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
};
