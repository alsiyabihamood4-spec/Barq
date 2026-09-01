import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Input } from "../../src/ui/Input";
import { Btn } from "../../src/ui/Btn";
import { BottomBar } from "../../src/ui/BottomBar";
import { c } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";
import { useSession } from "../../src/state/session";
import { API_URL } from "../../src/lib/api";

/** 3a — combined sign-in / new-company registration. The sign-in tab hops
 * to the same OTP screen as 6b; the sign-up tab creates the company record
 * first, then verifies the signatory's mobile to create + link the account. */
export default function Register() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { row } = useDir();
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const requestOtp = useSession((s) => s.requestOtp);

  const [tradeNameAr, setTradeNameAr] = useState("شركة الباطنة للتجارة ش.م.م");
  const [tradeNameEn, setTradeNameEn] = useState("Al Batinah Trading LLC");
  const [commercialReg, setCommercialReg] = useState("1234567");
  const [vatNumber, setVatNumber] = useState("OM100234567");
  const [signatoryName, setSignatoryName] = useState("خالد بن سعيد البوسعيدي");
  const [signatoryMobile, setSignatoryMobile] = useState("+968 9 142 8830");
  const [loginMobile, setLoginMobile] = useState("9 142 8830");

  async function submitSignup() {
    setLoading(true);
    try {
      const mobile = signatoryMobile.replace(/\s/g, "");
      const company = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tradeNameAr, tradeNameEn, commercialReg, vatNumber, signatoryName, signatoryMobile: mobile }),
      }).then((r) => r.json());
      await requestOtp(mobile);
      router.push({
        pathname: "/(auth)/otp",
        params: { mobile, role: "client", companyId: company.id, nameAr: signatoryName, nameEn: tradeNameEn },
      });
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin() {
    setLoading(true);
    try {
      const mobile = `+968${loginMobile.replace(/\s/g, "")}`;
      await requestOtp(mobile);
      router.push({ pathname: "/(auth)/otp", params: { mobile, role: role ?? "client" } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      titleAr="حساب شركة"
      titleEn="Company account"
      footer={
        <BottomBar>
          <Btn
            ar={tab === "login" ? "تسجيل الدخول" : "إنشاء الحساب والتحقق"}
            en={tab === "login" ? "SIGN IN" : "CREATE & VERIFY"}
            onPress={tab === "login" ? submitLogin : submitSignup}
            loading={loading}
          />
        </BottomBar>
      }
    >
      <View style={{ flexDirection: row, borderWidth: 1, borderColor: c.divider }}>
        {(["login", "signup"] as const).map((k) => (
          <T
            key={k}
            ar={k === "login" ? "تسجيل الدخول" : "حساب شركة جديد"}
            en={k === "login" ? "Sign in" : "New company"}
            onPress={() => setTab(k)}
            style={{
              flex: 1,
              textAlign: "center",
              paddingVertical: 10,
              fontSize: 12.5,
              fontWeight: "600",
              backgroundColor: tab === k ? c.accent : "transparent",
              color: tab === k ? c.bg : c.textMuted62,
            }}
          />
        ))}
      </View>

      {tab === "signup" ? (
        <View style={{ gap: 12 }}>
          <Input labelAr="الاسم التجاري" labelEn="Trade name" value={tradeNameAr} onChangeText={setTradeNameAr} />
          <Input labelAr="Trade name (EN)" labelEn="Trade name (EN)" value={tradeNameEn} onChangeText={setTradeNameEn} />
          <Input labelAr="رقم السجل التجاري" labelEn="Commercial registration" value={commercialReg} onChangeText={setCommercialReg} keyboardType="number-pad" />
          <Input labelAr="الرقم الضريبي" labelEn="VAT number" value={vatNumber} onChangeText={setVatNumber} />
          <Input labelAr="اسم المفوّض بالتوقيع" labelEn="Authorised signatory" value={signatoryName} onChangeText={setSignatoryName} />
          <Input labelAr="جوال المفوّض" labelEn="Signatory mobile" value={signatoryMobile} onChangeText={setSignatoryMobile} keyboardType="phone-pad" accentBorder />
        </View>
      ) : (
        <View style={{ gap: 5 }}>
          <Input labelAr="رقم الجوال" labelEn="Mobile number" value={loginMobile} onChangeText={setLoginMobile} keyboardType="phone-pad" accentBorder />
        </View>
      )}
    </Screen>
  );
}
