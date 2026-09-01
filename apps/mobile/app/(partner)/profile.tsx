import { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Btn } from "../../src/ui/Btn";
import { Toggle } from "../../src/ui/Toggle";
import { Mono, Lbl } from "../../src/ui/Text";
import { c, font } from "../../src/ui/tokens";
import { useDir, useLocaleStore } from "../../src/state/locale";
import { useSession } from "../../src/state/session";

const RATING_BARS = [
  { n: 5, pct: 82 },
  { n: 4, pct: 12 },
  { n: 3, pct: 4 },
  { n: 2, pct: 1 },
  { n: 1, pct: 1 },
];

/** 4d — partner profile, rating breakdown, and notification settings
 * (mirrors the prototype's `partnerSettings` toggles). */
export default function PartnerProfile() {
  const { row, locale } = useDir();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const [settings, setSettings] = useState({ tenders: true, status: true, afterHours: true });

  return (
    <Screen titleAr="الملف الشخصي" titleEn="Profile">
      <View style={{ alignItems: "center", gap: 6 }}>
        <Mono style={{ width: 60, height: 60, borderWidth: 1, borderColor: c.divider, textAlign: "center", textAlignVertical: "center", fontSize: 18, fontWeight: "600" }}>
          {(user?.nameEn ?? "?").slice(0, 2).toUpperCase()}
        </Mono>
        <T ar={user?.nameAr ?? ""} en={user?.nameEn ?? ""} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 18 }} />
        <Mono style={{ fontSize: 11, color: c.textMuted55 }}>★ {user?.ratingAvg.toFixed(1)} · {user?.ratingCount} RATINGS</Mono>
      </View>

      <View style={{ borderWidth: 1, borderColor: c.divider, padding: 14, gap: 8 }}>
        <Lbl>
          <T ar="توزيع التقييمات" en="Rating breakdown" />
        </Lbl>
        {RATING_BARS.map((b) => (
          <View key={b.n} style={{ flexDirection: row, alignItems: "center", gap: 8 }}>
            <Mono style={{ width: 12, fontSize: 11 }}>{b.n}★</Mono>
            <View style={{ flex: 1, height: 6, backgroundColor: c.neutral200 }}>
              <View style={{ width: `${b.pct}%`, height: "100%", backgroundColor: c.accent }} />
            </View>
            <Mono style={{ width: 30, fontSize: 10, color: c.textMuted55, textAlign: "right" }}>{b.pct}%</Mono>
          </View>
        ))}
      </View>

      <View style={{ borderWidth: 1, borderColor: c.divider }}>
        {[
          { ar: "إشعارات المناقصات الجديدة", en: "New tender alerts", key: "tenders" as const },
          { ar: "إشعارات تحديث الحالة", en: "Status update alerts", key: "status" as const },
          { ar: "الاستقبال خارج ساعات العمل", en: "Receive outside working hours", key: "afterHours" as const },
        ].map((s, i, arr) => (
          <View key={s.key} style={{ flexDirection: row, alignItems: "center", gap: 10, padding: 13, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: c.divider }}>
            <T ar={s.ar} en={s.en} style={{ flex: 1, fontSize: 13.5, fontWeight: "500" }} />
            <Toggle on={settings[s.key]} onPress={() => setSettings((v) => ({ ...v, [s.key]: !v[s.key] }))} />
          </View>
        ))}
        <Pressable
          onPress={() => setLocale(locale === "ar" ? "en" : "ar")}
          style={{ flexDirection: row, alignItems: "center", gap: 10, padding: 13, borderTopWidth: 1, borderTopColor: c.divider }}
        >
          <T ar="اللغة" en="Language" style={{ flex: 1, fontSize: 13.5, fontWeight: "500" }} />
          <Mono style={{ fontSize: 12, color: c.accent700 }}>{locale === "ar" ? "العربية" : "ENGLISH"}</Mono>
        </Pressable>
      </View>

      <Btn variant="secondary" ar="تسجيل الخروج" en="Sign out" onPress={() => { signOut(); router.replace("/(auth)/welcome"); }} />
    </Screen>
  );
}
