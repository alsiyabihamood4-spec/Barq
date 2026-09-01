"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dirOf, type Locale } from "@tanafus/i18n";

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: "ar",
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem("tanafus-locale") as Locale | null;
    if (stored === "ar" || stored === "en") setLocale(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dir = dirOf(locale);
    document.documentElement.lang = locale;
    document.documentElement.dataset.lang = locale;
    window.localStorage.setItem("tanafus-locale", locale);
  }, [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}
