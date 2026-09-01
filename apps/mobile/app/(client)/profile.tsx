import { View, ActivityIndicator, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Lbl, Mono } from "../../src/ui/Text";
import { Btn } from "../../src/ui/Btn";
import { c, font } from "../../src/ui/tokens";
import { useDir, useLocaleStore } from "../../src/state/locale";
import { useSession } from "../../src/state/session";
import { useApi } from "../../src/lib/useApi";

interface CompanyDto {
  tradeNameAr: string;
  tradeNameEn: string;
  commercialReg: string;
  vatNumber: string;
  signatoryName: string;
  payoutIban: string | null;
}
interface SubAccountDto {
  id: string;
  nameAr: string;
  nameEn: string;
  role: string;
  active: boolean;
}

/** 3h — company profile, sub-account management, and settings (including
 * the language switch — the prototype's own AR/EN toggle lives here as a
 * settings row, not floating on every screen). */
export default function Profile() {
  const { row, locale } = useDir();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const { data: company, loading: companyLoading } = useApi<CompanyDto>(user?.companyId ? `/companies/${user.companyId}` : null, [user?.companyId]);
  const { data: subs } = useApi<SubAccountDto[]>(user?.companyId ? `/companies/${user.companyId}/sub-accounts` : null, [user?.companyId]);

  return (
    <Screen titleAr="الملف الشخصي" titleEn="Profile">
      <View style={{ alignItems: "center", gap: 6 }}>
        <Mono style={{ width: 60, height: 60, borderWidth: 1, borderColor: c.divider, textAlign: "center", textAlignVertical: "center", fontSize: 18, fontWeight: "600" }}>
          {(user?.nameEn ?? "?").slice(0, 2).toUpperCase()}
        </Mono>
        <T ar={user?.nameAr ?? ""} en={user?.nameEn ?? ""} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 18 }} />
        <Mono style={{ fontSize: 11, color: c.textMuted55 }}>{user?.mobile}</Mono>
      </View>

      {companyLoading && <ActivityIndicator color={c.accent} />}
      {company && (
        <View style={{ borderWidth: 1, borderColor: c.divider }}>
          <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: c.divider }}>
            <Lbl>
              <T ar="بيانات الشركة" en="Company details" />
            </Lbl>
          </View>
          {[
            { ar: "الاسم التجاري", en: "Trade name", v: company.tradeNameEn },
            { ar: "السجل التجاري", en: "Commercial reg.", v: company.commercialReg },
            { ar: "الرقم الضريبي", en: "VAT number", v: company.vatNumber },
            { ar: "المفوّض بالتوقيع", en: "Signatory", v: company.signatoryName },
          ].map((f, i, arr) => (
            <View key={f.ar} style={{ flexDirection: row, alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 13, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: c.divider }}>
              <T ar={f.ar} en={f.en} style={{ flex: 1, fontSize: 12.5, color: c.textMuted60 }} />
              <Mono style={{ fontSize: 12.5, fontWeight: "500" }}>{f.v}</Mono>
            </View>
          ))}
        </View>
      )}

      {subs && subs.length > 0 && (
        <View style={{ gap: 8 }}>
          <Lbl>
            <T ar="الحسابات الفرعية" en="Sub-accounts" />
          </Lbl>
          {subs.map((s) => (
            <View key={s.id} style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.divider, padding: 11 }}>
              <View style={{ flex: 1 }}>
                <T ar={s.nameAr} en={s.nameEn} style={{ fontWeight: "500", fontSize: 13 }} />
                <Mono style={{ fontSize: 9.5, color: c.textMuted48, marginTop: 2 }}>{s.role}</Mono>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ borderWidth: 1, borderColor: c.divider }}>
        <Pressable
          onPress={() => setLocale(locale === "ar" ? "en" : "ar")}
          style={{ flexDirection: row, alignItems: "center", gap: 10, padding: 13, borderBottomWidth: 1, borderBottomColor: c.divider }}
        >
          <T ar="اللغة" en="Language" style={{ flex: 1, fontSize: 13.5, fontWeight: "500" }} />
          <Mono style={{ fontSize: 12, color: c.accent700 }}>{locale === "ar" ? "العربية" : "ENGLISH"}</Mono>
        </Pressable>
        <View style={{ flexDirection: row, alignItems: "center", gap: 10, padding: 13 }}>
          <T ar="الإشعارات الفورية" en="Push notifications" style={{ flex: 1, fontSize: 13.5, fontWeight: "500" }} />
          <Mono style={{ fontSize: 11, color: c.accent700 }}>ON</Mono>
        </View>
      </View>

      <Btn variant="secondary" ar="تسجيل الخروج" en="Sign out" onPress={() => { signOut(); router.replace("/(auth)/welcome"); }} />
    </Screen>
  );
}
