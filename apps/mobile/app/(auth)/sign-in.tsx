import { useState } from "react";
import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Lbl, Mono } from "../../src/ui/Text";
import { Btn } from "../../src/ui/Btn";
import { BottomBar } from "../../src/ui/BottomBar";
import { Blueprint } from "../../src/ui/Blueprint";
import { c, font } from "../../src/ui/tokens";
import { altSignins } from "@BARQ/i18n";
import { useSession } from "../../src/state/session";
import { useDir } from "../../src/state/locale";

/** 6b — dedicated sign-in: mobile + password (password is cosmetic — this
 * backend authenticates by SMS OTP only, matching the blueprint note below
 * that a code is sent on every sign-in from a new device). */
export default function SignIn() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { row } = useDir();
  const [mobile, setMobile] = useState("9 142 8830");
  const [pwShown, setPwShown] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const requestOtp = useSession((s) => s.requestOtp);

  async function submit() {
    setLoading(true);
    try {
      const fullMobile = `+968${mobile.replace(/\s/g, "")}`;
      await requestOtp(fullMobile);
      router.push({ pathname: "/(auth)/otp", params: { mobile: fullMobile, role: role ?? "client" } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      titleAr="تسجيل الدخول"
      titleEn="Sign in"
      subtitle={`${(role ?? "CLIENT").toString().toUpperCase()} ACCOUNT`}
      footer={
        <BottomBar>
          <Btn ar="تسجيل الدخول" en="SIGN IN" onPress={submit} loading={loading} />
          <Btn
            variant="ghost"
            ar="ليس لديك حساب؟ سجّل شركتك"
            en="No account? Register your company"
            onPress={() => router.push({ pathname: "/(auth)/register", params: { role } })}
          />
        </BottomBar>
      }
    >
      <View style={{ gap: 12 }}>
        <View style={{ gap: 5 }}>
          <Lbl>
            <T ar="رقم الجوال" en="Mobile number" />
          </Lbl>
          <View style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.accent, padding: 12 }}>
            <Mono style={{ fontSize: 12, color: c.accent700 }}>+968</Mono>
            <View style={{ width: 1, height: 16, backgroundColor: c.divider }} />
            <Mono style={{ flex: 1, fontSize: 16 }}>{mobile}</Mono>
          </View>
        </View>
        <View style={{ gap: 5 }}>
          <Lbl>
            <T ar="كلمة المرور" en="Password" />
          </Lbl>
          <View style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.divider, padding: 12 }}>
            <Mono style={{ flex: 1, fontSize: 16, letterSpacing: pwShown ? 0 : 4 }}>{pwShown ? "BARQ·2026" : "••••••••••"}</Mono>
            <Mono onPress={() => setPwShown((s) => !s)} style={{ fontSize: 10, color: c.accent700 }}>
              <T ar={pwShown ? "إخفاء" : "إظهار"} en={pwShown ? "HIDE" : "SHOW"} />
            </Mono>
          </View>
        </View>
        <View style={{ flexDirection: row, alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => setRemember((r) => !r)} style={{ flexDirection: row, alignItems: "center", gap: 9 }}>
            <View style={{ width: 15, height: 15, borderWidth: 1, borderColor: remember ? c.accent : c.neutral400, backgroundColor: remember ? c.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
              {remember && <Mono style={{ fontSize: 10, color: c.bg }}>✓</Mono>}
            </View>
            <T ar="تذكّرني" en="Remember me" style={{ fontSize: 12, color: c.textMuted60 }} />
          </Pressable>
          <T ar="نسيت كلمة المرور؟" en="Forgot password?" style={{ fontSize: 12, color: c.accent700 }} />
        </View>
      </View>

      <View style={{ flexDirection: row, alignItems: "center", gap: 11 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
        <Mono style={{ fontSize: 9.5, letterSpacing: 1.6, color: c.textMuted45 }}>
          <T ar="أو" en="OR" />
        </Mono>
        <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
      </View>

      <View style={{ gap: 8 }}>
        {altSignins.map((a) => (
          <View key={a.code} style={{ flexDirection: row, alignItems: "center", gap: 11, borderWidth: 1, borderColor: c.divider, padding: 13 }}>
            <Mono style={{ fontSize: 9.5, width: 68, color: c.accent700 }}>{a.code}</Mono>
            <T ar={a.ar} en={a.en} style={{ flex: 1, fontSize: 13, fontWeight: "500" }} />
            <Mono style={{ fontSize: 12, color: c.accent700 }}>{"›"}</Mono>
          </View>
        ))}
      </View>

      <Blueprint accent style={{ padding: 13 }}>
        <T
          ar="يُرسل رمز تحقق إلى جوال المفوّض عند كل دخول من جهاز جديد."
          en="A verification code is sent to the signatory's mobile on every sign-in from a new device."
          style={{ fontSize: 11.5, lineHeight: 18, color: c.accent900 }}
        />
      </Blueprint>
    </Screen>
  );
}
