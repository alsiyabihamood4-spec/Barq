"use client";

import { useLocale } from "./LocaleProvider";

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex border border-divider text-[11px] font-semibold">
      <button
        onClick={() => setLocale("ar")}
        className={`px-2.5 py-1.5 font-arabic ${locale === "ar" ? "bg-accent text-bg" : "text-ink/70"}`}
      >
        العربية
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1.5 tracking-wide ${locale === "en" ? "bg-accent text-bg" : "text-ink/70"}`}
      >
        EN
      </button>
    </div>
  );
}
