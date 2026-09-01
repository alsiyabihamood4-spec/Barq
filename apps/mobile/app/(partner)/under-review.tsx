import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Btn } from "../../src/ui/Btn";
import { Mono } from "../../src/ui/Text";
import { Blueprint } from "../../src/ui/Blueprint";
import { c, font } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";

const STEPS = [
  { ar: "استلام الطلب", en: "Application received", done: true },
  { ar: "تدقيق الهوية والسجل", en: "ID and registration checked", done: true },
  { ar: "مطابقة البطاقة المهنية", en: "Professional licence match", done: false },
  { ar: "تفعيل الحساب", en: "Account activation", done: false },
];

/** 4a — account under review: tenders stay hidden until an admin approves
 * the KYC application (apps/admin's KYC queue, section A-02). */
export default function UnderReview() {
  const { row } = useDir();
  return (
    <Screen titleAr="حسابك قيد التدقيق" titleEn="Your account is under review" back={false}>
      <View style={{ alignItems: "center", gap: 14, paddingTop: 10 }}>
        <View style={{ width: 74, height: 74, borderWidth: 1, borderColor: c.accent, alignItems: "center", justifyContent: "center" }}>
          <Mono style={{ fontSize: 28, color: c.accent700 }}>◔</Mono>
        </View>
        <T
          ar="تُراجع الإدارة وثائقك خلال 24-48 ساعة. لن تظهر لك المناقصات قبل التفعيل."
          en="Our team reviews your documents within 24-48 hours. Tenders stay hidden until activation."
          style={{ fontSize: 12.5, lineHeight: 20, color: c.textMuted58, textAlign: "center", maxWidth: 300 }}
        />
      </View>

      <Blueprint style={{ padding: 0 }}>
        {STEPS.map((s, i) => (
          <View key={s.ar} style={{ flexDirection: row, alignItems: "center", gap: 11, paddingVertical: 12, paddingHorizontal: 13, borderBottomWidth: i < STEPS.length - 1 ? 1 : 0, borderBottomColor: c.divider }}>
            <View style={{ width: 15, height: 15, borderWidth: 1, borderColor: s.done ? c.accent : c.neutral400, backgroundColor: s.done ? c.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
              {s.done && <Mono style={{ fontSize: 9, color: c.bg }}>✓</Mono>}
            </View>
            <T ar={s.ar} en={s.en} style={{ flex: 1, fontSize: 12.5, color: s.done ? c.text : c.textMuted55 }} />
          </View>
        ))}
      </Blueprint>

      <Btn variant="secondary" ar="تحديث الحالة" en="Refresh status" onPress={() => router.replace("/")} />
    </Screen>
  );
}
