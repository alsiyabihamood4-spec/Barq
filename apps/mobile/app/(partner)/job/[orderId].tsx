import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { OtpKeypad } from "../../../src/ui/OtpKeypad";
import { Mono, Lbl } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c, font } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useSession } from "../../../src/state/session";
import { useApi } from "../../../src/lib/useApi";
import { apiFetch } from "../../../src/lib/api";
import { clearanceSteps } from "@tanafus/i18n";
import type { Order } from "@tanafus/types";

/** 2c — active job execution. Clearance orders get the broker's quick
 * stage-update buttons; freight orders get the carrier's start-trip +
 * delivery-OTP flow. Which view shows is driven by the order's real
 * service type rather than the prototype's demo role switch. */
export default function Job() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { row } = useDir();
  const token = useSession((s) => s.token);
  const { data: order, loading, reload } = useApi<Order>(`/orders/${orderId}`);
  const [advancing, setAdvancing] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [delivering, setDelivering] = useState(false);

  async function advance() {
    setAdvancing(true);
    try {
      await apiFetch(`/orders/${orderId}/advance`, token, { method: "POST" });
      reload();
    } finally {
      setAdvancing(false);
    }
  }

  async function submitOtp(v: string) {
    setOtp(v);
    setOtpError(false);
    if (v.length === 6) {
      setDelivering(true);
      try {
        await apiFetch(`/orders/${orderId}/deliver`, token, { method: "POST", body: JSON.stringify({ otp: v }) });
        reload();
      } catch {
        setOtpError(true);
        setOtp("");
      } finally {
        setDelivering(false);
      }
    }
  }

  if (loading || !order) {
    return (
      <Screen titleAr="المهمة الجارية" titleEn="Active job">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  if (order.stage === "delivered") {
    return (
      <Screen titleAr="المهمة الجارية" titleEn="Active job">
        <View style={{ alignItems: "center", gap: 12, paddingTop: 30 }}>
          <T ar="تم إنهاء المهمة والإفراج عن الأجرة" en="Job closed, fare released" style={{ fontSize: 16, fontWeight: "600", textAlign: "center" }} />
          <Btn ar="عودة إلى الساحة" en="Back to the feed" onPress={() => router.replace("/(partner)/feed")} />
        </View>
      </Screen>
    );
  }

  const isCarrier = order.service === "freight";

  return (
    <Screen titleAr={order.code} titleEn={order.code} subtitle={`${order.portCode} · ${isCarrier ? "CARRIER" : "BROKER"}`}>
      {!isCarrier ? (
        <View style={{ gap: 10 }}>
          <Lbl>
            <T ar="تحديث حالة البيان" en="Update declaration status" />
          </Lbl>
          {clearanceSteps.map((s, i) => {
            const stageIdx = { assigned: 0, declaration: 1, inspection: 2, released: 3, in_transit: 3, delivered: 4 }[order.stage] ?? 0;
            const on = stageIdx === i;
            return (
              <View key={s.key} style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: on ? c.accent : c.divider, backgroundColor: on ? c.accent100 : "transparent", padding: 13 }}>
                <Mono style={{ fontSize: 9.5, color: on ? c.accent700 : c.textMuted45 }}>ST-0{i + 1}</Mono>
                <T ar={s.ar} en={s.en} style={{ flex: 1, fontFamily: font.heading, fontWeight: "600", fontSize: 14, color: on ? c.accent900 : c.text }} />
              </View>
            );
          })}
          <Btn variant="secondary" ar="تحديث إلى المرحلة التالية" en="Advance to next stage" onPress={advance} loading={advancing} />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {order.stage !== "in_transit" ? (
            <Btn ar="بدء الرحلة" en="Start trip" onPress={advance} loading={advancing} />
          ) : (
            <Blueprint style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: c.neutral100 }}>
              <T ar="⚑ مسار الملاحة إلى الوجهة" en="⚑ Navigation route to destination" style={{ fontSize: 11.5, color: c.textMuted55 }} />
            </Blueprint>
          )}
          <View style={{ alignItems: "center", gap: 8 }}>
            <T ar="أدخل رمز التسليم من العميل لإنهاء المهمة" en="Enter the client's delivery code to close the job" style={{ fontSize: 12.5, color: c.textMuted58, textAlign: "center" }} />
            <OtpKeypad value={otp} onChange={submitOtp} />
            {otpError && <T ar="رمز غير صحيح — حاول مرة أخرى" en="Invalid code — try again" style={{ fontSize: 11.5, color: c.neutral700, fontWeight: "600" }} />}
            {delivering && <ActivityIndicator color={c.accent} />}
          </View>
        </View>
      )}

      <BottomBar>
        <Btn variant="secondary" ar="رفع إشعار الفسح النهائي" en="Upload final release note" onPress={() => {}} disabled={isCarrier} />
      </BottomBar>
    </Screen>
  );
}
