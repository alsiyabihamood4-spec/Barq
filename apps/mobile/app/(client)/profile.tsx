import { useState } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Lbl, Mono } from "../../src/ui/Text";
import { Btn } from "../../src/ui/Btn";
import { Input } from "../../src/ui/Input";
import { Chip } from "../../src/ui/Chip";
import { Toggle } from "../../src/ui/Toggle";
import { c, font } from "../../src/ui/tokens";
import { useDir, useLocaleStore } from "../../src/state/locale";
import { useSession } from "../../src/state/session";
import { useApi } from "../../src/lib/useApi";
import { apiFetch } from "../../src/lib/api";

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

const ROLE_OPTIONS = [
  { key: "OPERATIONS · CAN BID", ar: "عمليات · يمكنه المزايدة", en: "Operations · Can bid" },
  { key: "FINANCE · CAN PAY", ar: "مالية · يمكنه الدفع", en: "Finance · Can pay" },
  { key: "VIEWER · READ ONLY", ar: "مشاهدة فقط", en: "Viewer · Read only" },
];

/** 3h — company profile, sub-account management, and settings (including
 * the language switch — the prototype's own AR/EN toggle lives here as a
 * settings row, not floating on every screen). */
export default function Profile() {
  const { row, locale } = useDir();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const user = useSession((s) => s.user);
  const token = useSession((s) => s.token);
  const signOut = useSession((s) => s.signOut);
  const { data: company, loading: companyLoading } = useApi<CompanyDto>(user?.companyId ? `/companies/${user.companyId}` : null, [user?.companyId]);
  const { data: subs, reload: reloadSubs } = useApi<SubAccountDto[]>(user?.companyId ? `/companies/${user.companyId}/sub-accounts` : null, [user?.companyId]);

  const [showAdd, setShowAdd] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]!.key);
  const [saving, setSaving] = useState(false);

  async function addSubAccount() {
    if (!user?.companyId || !nameAr || !nameEn) return;
    setSaving(true);
    try {
      await apiFetch(`/companies/${user.companyId}/sub-accounts`, token, {
        method: "POST",
        body: JSON.stringify({ nameAr, nameEn, role }),
      });
      setNameAr("");
      setNameEn("");
      setShowAdd(false);
      reloadSubs();
    } finally {
      setSaving(false);
    }
  }

  async function toggleSubAccount(sub: SubAccountDto) {
    if (!user?.companyId) return;
    await apiFetch(`/companies/${user.companyId}/sub-accounts/${sub.id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ active: !sub.active }),
    });
    reloadSubs();
  }

  async function removeSubAccount(sub: SubAccountDto) {
    if (!user?.companyId) return;
    await apiFetch(`/companies/${user.companyId}/sub-accounts/${sub.id}`, token, { method: "DELETE" });
    reloadSubs();
  }

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

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: row, alignItems: "center", justifyContent: "space-between" }}>
          <Lbl>
            <T ar="الحسابات الفرعية" en="Sub-accounts" />
          </Lbl>
          <T
            ar={showAdd ? "إلغاء" : "+ إضافة"}
            en={showAdd ? "Cancel" : "+ Add"}
            onPress={() => setShowAdd((v) => !v)}
            style={{ fontSize: 12, color: c.accent700, fontWeight: "600" }}
          />
        </View>

        {(subs ?? []).map((s) => (
          <View key={s.id} style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.divider, padding: 11, opacity: s.active ? 1 : 0.55 }}>
            <View style={{ flex: 1 }}>
              <T ar={s.nameAr} en={s.nameEn} style={{ fontWeight: "500", fontSize: 13 }} />
              <Mono style={{ fontSize: 9.5, color: c.textMuted48, marginTop: 2 }}>{s.role}</Mono>
            </View>
            <Toggle on={s.active} onPress={() => toggleSubAccount(s)} />
            <Pressable onPress={() => removeSubAccount(s)} hitSlop={8}>
              <Mono style={{ fontSize: 14, color: c.textMuted48 }}>×</Mono>
            </Pressable>
          </View>
        ))}

        {showAdd && (
          <View style={{ borderWidth: 1, borderColor: c.accent400, backgroundColor: c.accent100, padding: 12, gap: 10 }}>
            <Input labelAr="الاسم (عربي)" labelEn="Name (Arabic)" value={nameAr} onChangeText={setNameAr} />
            <Input labelAr="الاسم (إنجليزي)" labelEn="Name (English)" value={nameEn} onChangeText={setNameEn} />
            <View style={{ gap: 6 }}>
              <Lbl style={{ fontSize: 9 }}>
                <T ar="الصلاحية" en="Permission" />
              </Lbl>
              <View style={{ flexDirection: row, gap: 6 }}>
                {ROLE_OPTIONS.map((r) => (
                  <Chip key={r.key} ar={r.ar} en={r.en} on={role === r.key} onPress={() => setRole(r.key)} />
                ))}
              </View>
            </View>
            <Btn ar="إضافة" en="Add" onPress={addSubAccount} loading={saving} disabled={!nameAr || !nameEn} />
          </View>
        )}
      </View>

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
