import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Locale } from "@tanafus/i18n";
import { dirOf } from "@tanafus/i18n";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  hydrate: () => Promise<void>;
}

/**
 * The prototype flips `dir="{{ dir }}"` on the whole document the instant
 * the language switch is tapped — no reload. React Native's OS-level RTL
 * (I18nManager.forceRTL) needs an app restart to take effect, so instead we
 * mirror the prototype's approach: components read `locale` directly and
 * choose their own flex direction / text alignment via `useDir()` below.
 */
export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "ar",
  setLocale: (l) => {
    set({ locale: l });
    AsyncStorage.setItem("tanafus-locale", l).catch(() => {});
  },
  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem("tanafus-locale");
      if (stored === "ar" || stored === "en") set({ locale: stored });
    } catch {
      /* first run / storage unavailable — default stands */
    }
  },
}));

export function useDir() {
  const locale = useLocaleStore((s) => s.locale);
  const dir = dirOf(locale);
  const rtl = dir === "rtl";
  return {
    locale,
    dir,
    rtl,
    row: (rtl ? "row-reverse" : "row") as "row" | "row-reverse",
    textAlign: (rtl ? "right" : "left") as "right" | "left",
  };
}
