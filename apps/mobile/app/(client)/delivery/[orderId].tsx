import { useState } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { Mono } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c, font } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useApi } from "../../../src/lib/useApi";
import { deliveryChecks } from "@BARQ/i18n";
import type { Order } from "@BARQ/types";

/** 1e — delivery confirmation: shows the OTP for the client to read out to
 * the driver (the driver enters it on their side, see the partner app's
 * Active Job screen), a local receiving checklist, then hands off to
 * rating once the order flips to delivered. */
export default function Delivery() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { row } = useDir();
  const { data: order, loading, reload } = useApi<Order>(`/orders/${orderId}`);
  const [checks, setChecks] = useState<Record<string, boolean>>({ c1: true, c2: true, c3: false });

  if (loading || !order) {
    return (
      <Screen titleAr="استلام الشحنة" titleEn="Confirm delivery">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  if (order.stage === "delivered") {
    return (
      <Screen titleAr="استلام الشحنة" titleEn="Confirm delivery">
        <View style={{ alignItems: "center", gap: 14, paddingTop: 30 }}>
          <T ar="تم التسليم بنجاح" en="Delivered successfully" style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 20 }} />
          <Btn ar="تقييم الخدمة" en="Rate the service" onPress={() => router.replace({ pathname: "/(client)/rating/[orderId]", params: { orderId: order.id } })} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen titleAr="استلام الشحنة" titleEn="Confirm delivery" subtitle={order.code}>
      <View style={{ alignItems: "center", gap: 10 }}>
        <T ar="أعطِ هذا الرمز للسائق عند التفريغ" en="Give this code to the driver on unloading" style={{ fontSize: 12.5, color: c.textMuted58, textAlign: "center" }} />
        <View style={{ flexDirection: row, gap: 6 }}>
          {order.deliveryOtp.split("").map((d, i) => (
            <View key={i} style={{ width: 38, height: 46, borderWidth: 1, borderColor: c.accent, backgroundColor: c.accent100, alignItems: "center", justifyContent: "center" }}>
              <Mono style={{ fontSize: 20, fontWeight: "600" }}>{d}</Mono>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {deliveryChecks.map((chk) => {
          const on = checks[chk.key];
          return (
            <Pressable
              key={chk.key}
              onPress={() => setChecks((s) => ({ ...s, [chk.key]: !s[chk.key] }))}
              style={{ flexDirection: row, alignItems: "center", gap: 11, borderWidth: 1, borderColor: c.divider, padding: 12 }}
            >
              <View style={{ width: 18, height: 18, borderWidth: 1, borderColor: on ? c.accent : c.neutral400, backgroundColor: on ? c.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
                {on && <Mono style={{ fontSize: 11, color: c.bg }}>✓</Mono>}
              </View>
              <T ar={chk.ar} en={chk.en} style={{ flex: 1, fontSize: 13 }} />
            </Pressable>
          );
        })}
      </View>

      <BottomBar>
        <Btn variant="secondary" ar="تحديث الحالة" en="Refresh status" onPress={reload} />
        <T ar="بانتظار إدخال السائق للرمز" en="Waiting for the driver to enter the code" style={{ textAlign: "center", fontSize: 11.5, color: c.textMuted55 }} />
      </BottomBar>
    </Screen>
  );
}
