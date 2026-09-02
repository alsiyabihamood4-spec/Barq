import { useState } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { Lbl, Mono } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c, font } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useApi } from "../../../src/lib/useApi";
import type { Order } from "@tanafus/types";

const PAY_METHODS = [
  { key: "card", ar: "بطاقة بنكية", en: "Bank card", meta: "**** 4417 · BANK MUSCAT" },
  { key: "thawani", ar: "محفظة رقمية", en: "Digital wallet", meta: "THAWANI / OMANNET" },
  { key: "transfer", ar: "تحويل بنكي", en: "Bank transfer", meta: "IBAN OM.. · 1-2 DAYS" },
];

/** 1c — escrow checkout. The order (and its escrow hold) is already created
 * server-side when the bid was accepted; this screen confirms the payment
 * method and surfaces the amount now sitting in escrow. */
export default function Checkout() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { row } = useDir();
  const [pay, setPay] = useState("card");
  const { data: order, loading } = useApi<Order>(`/orders/${orderId}`);

  if (loading || !order) {
    return (
      <Screen titleAr="الدفع والضمان" titleEn="Escrow checkout">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  return (
    <Screen
      titleAr="الدفع والضمان"
      titleEn="Escrow checkout"
      subtitle={order.code}
      footer={
        <BottomBar>
          <Btn ar="تأكيد الدفع" en="CONFIRM PAYMENT" onPress={() => router.replace({ pathname: "/(client)/receipt/[orderId]", params: { orderId: order.id } })} />
        </BottomBar>
      }
    >
      <Blueprint style={{ padding: 15, gap: 8 }}>
        <Lbl>
          <T ar="المبلغ المحجوز في الضمان" en="Amount held in escrow" />
        </Lbl>
        <View style={{ flexDirection: row, alignItems: "baseline", gap: 7 }}>
          <Mono style={{ fontSize: 32, fontWeight: "600" }}>{order.escrowOmr.toFixed(3)}</Mono>
          <Mono style={{ fontSize: 13, color: c.textMuted55 }}>OMR</Mono>
        </View>
        <T
          ar="لن يُفرج عن المبلغ للمزوّد إلا بعد تأكيد استلام الشحنة برمز التسليم."
          en="Released to the provider only after you confirm delivery with the OTP."
          style={{ fontSize: 11.5, lineHeight: 18, color: c.textMuted55 }}
        />
      </Blueprint>

      <View style={{ gap: 8 }}>
        <Lbl>
          <T ar="وسيلة الدفع" en="Payment method" />
        </Lbl>
        {PAY_METHODS.map((p) => {
          const on = pay === p.key;
          return (
            <Pressable
              key={p.key}
              onPress={() => setPay(p.key)}
              style={{ flexDirection: row, alignItems: "center", gap: 12, borderWidth: 1, borderColor: on ? c.accent : c.divider, backgroundColor: on ? c.accent100 : "transparent", padding: 13 }}
            >
              <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: on ? c.accent : c.neutral400, alignItems: "center", justifyContent: "center" }}>
                {on && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accent }} />}
              </View>
              <View style={{ flex: 1 }}>
                <T ar={p.ar} en={p.en} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 14 }} />
                <Mono style={{ fontSize: 9.5, color: c.textMuted48, marginTop: 2 }}>{p.meta}</Mono>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
