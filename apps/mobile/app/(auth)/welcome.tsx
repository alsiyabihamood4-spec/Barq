import { useState } from "react";
import { View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "../../src/ui/T";
import { Mono, Lbl } from "../../src/ui/Text";
import { Btn } from "../../src/ui/Btn";
import { PickCard } from "../../src/ui/PickCard";
import { Blueprint } from "../../src/ui/Blueprint";
import { c, font } from "../../src/ui/tokens";
import { roles, brand } from "@tanafus/i18n";
import type { Role } from "@tanafus/types";

/** 6a — welcome & role choice. Picking a role decides where sign-in/sign-up
 * routes to (client's company registration vs. partner's provider KYC). */
export default function Welcome() {
  const [role, setRole] = useState<"client" | "partner">("client");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        <View style={{ gap: 16 }}>
          <Mono style={{ fontSize: 10, backgroundColor: c.accent, color: c.bg, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, letterSpacing: 1.4 }}>
            {brand.name}
          </Mono>
          <Blueprint style={{ height: 196, alignItems: "center", justifyContent: "center" }}>
            <View style={{ alignItems: "center", gap: 9 }}>
              <View style={{ width: 66, height: 66, borderWidth: 1, borderColor: c.accent, alignItems: "center", justifyContent: "center" }}>
                <View style={{ width: 34, height: 34, backgroundColor: c.accent }} />
              </View>
              <Mono style={{ fontSize: 9, letterSpacing: 1.2, color: c.textMuted48 }}>BRAND MARK PLACEHOLDER</Mono>
            </View>
          </Blueprint>
          <View style={{ gap: 9 }}>
            <T ar={brand.tagline.ar} en={brand.tagline.en} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 30, lineHeight: 33 }} />
            <T ar={brand.pitch.ar} en={brand.pitch.en} style={{ fontSize: 13, lineHeight: 22, color: c.textMuted58 }} />
          </View>
        </View>

        <View style={{ gap: 11 }}>
          <Lbl>
            <T ar="ادخل بصفتك" en="Continue as" />
          </Lbl>
          {(["client", "partner"] as const).map((k) => {
            const r = roles[k];
            return (
              <PickCard
                key={k}
                code={r.code}
                ar={r.ar}
                en={r.en}
                noteAr={r.noteAr}
                noteEn={r.noteEn}
                on={role === k}
                onPress={() => setRole(k)}
              />
            );
          })}
          <Btn
            ar={`المتابعة — ${roles[role].labelAr}`}
            en={`CONTINUE — ${roles[role].labelEn}`}
            onPress={() => router.push({ pathname: "/(auth)/register", params: { role } })}
            style={{ marginTop: 3 }}
          />
          <Btn
            variant="ghost"
            ar="لديك حساب؟ تسجيل الدخول"
            en="Already registered? Sign in"
            onPress={() => router.push({ pathname: "/(auth)/sign-in", params: { role } })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
