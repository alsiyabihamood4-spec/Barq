import { useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { OtpKeypad } from "../../src/ui/OtpKeypad";
import { c } from "../../src/ui/tokens";
import { useSession } from "../../src/state/session";
import type { Role } from "@BARQ/types";

/** 3b — OTP verification, reused for both sign-up and 6b's sign-in hop-off.
 * Demo code is 482715, exactly like the prototype. */
export default function Otp() {
  const { mobile, role, companyId, nameAr, nameEn } = useLocalSearchParams<{
    mobile: string;
    role?: string;
    companyId?: string;
    nameAr?: string;
    nameEn?: string;
  }>();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const verifyOtp = useSession((s) => s.verifyOtp);

  const full = code.length === 6;

  const message = useMemo(() => {
    if (!full) return { ar: "أدخل الرمز المرسل إليك", en: "ENTER THE CODE WE SENT YOU", color: c.textMuted50 };
    if (error) return { ar: "رمز غير صحيح", en: "INVALID CODE", color: c.neutral700 };
    return { ar: "تم التحقق — جارٍ تجهيز حسابك", en: "VERIFIED — SETTING UP YOUR ACCOUNT", color: c.accent700 };
  }, [full, error]);

  async function handleChange(v: string) {
    setCode(v);
    setError(false);
    if (v.length === 6) {
      setLoading(true);
      try {
        const session = await verifyOtp(mobile, v, (role as Role) ?? "client", { companyId, nameAr, nameEn });
        router.replace(session.user.role === "client" ? "/(client)/home" : "/(partner)/feed");
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Screen titleAr="رمز التحقق" titleEn="Verification code" subtitle={mobile}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <T
          ar="أدخل الرمز المكوّن من ستة أرقام المُرسل عبر رسالة نصية. الرمز التجريبي 482715."
          en="Enter the six-digit code sent by SMS. The demo code is 482715."
          style={{ fontSize: 12.5, lineHeight: 20, color: c.textMuted58, textAlign: "center" }}
        />
      </View>
      <OtpKeypad value={code} onChange={handleChange} />
      <T ar={message.ar} en={message.en} style={{ textAlign: "center", fontSize: 11.5, fontWeight: "600", color: message.color }} />
    </Screen>
  );
}
