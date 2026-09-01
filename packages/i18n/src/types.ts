export type Locale = "ar" | "en";
export type Dir = "rtl" | "ltr";

export const dirOf = (locale: Locale): Dir => (locale === "ar" ? "rtl" : "ltr");
export const otherLocale = (locale: Locale): Locale => (locale === "ar" ? "en" : "ar");

/** A bilingual string pair, mirroring the prototype's <span class="ar">/<span class="en">. */
export interface Bi {
  ar: string;
  en: string;
}

export const t = (bi: Bi, locale: Locale): string => bi[locale];
