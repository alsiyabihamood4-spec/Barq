import { View, ActivityIndicator } from "react-native";
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
import type { Order } from "@BARQ/types";

/** 3f — escrow success receipt: confirms the amount is frozen and hands the
 * client off to live tracking. */
export default function Receipt() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { row } = useDir();
  const { data: order, loading } = useApi<Order>(`/orders/${orderId}`);

  if (loading || !order) {
    return (
      <Screen titleAr="تم الدفع" titleEn="Payment confirmed">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  const rows = [
    { ar: "رقم المعاملة", en: "Order no.", v: order.code },
    { ar: "المنفذ", en: "Port", v: order.portCode },
    { ar: "المبلغ المجمّد", en: "Frozen amount", v: `${order.escrowOmr.toFixed(3)} OMR` },
  ];

  return (
    <Screen titleAr="تم الدفع" titleEn="Payment confirmed" back={false}>
      <View style={{ alignItems: "center", gap: 12, paddingVertical: 20 }}>
        <View style={{ width: 74, height: 74, borderWidth: 1, borderColor: c.accent, alignItems: "center", justifyContent: "center" }}>
          <Mono style={{ fontSize: 30, color: c.accent700 }}>✓</Mono>
        </View>
        <T
          ar="تم حجز المبلغ في الضمان"
          en="Amount frozen in escrow"
          style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 22, textAlign: "center" }}
        />
        <T
          ar="سيتم الإفراج عن المبلغ للمزوّد فقط بعد تأكيدك استلام الشحنة."
          en="Funds release to the provider only once you confirm delivery."
          style={{ fontSize: 12.5, color: c.textMuted58, textAlign: "center", maxWidth: 280, lineHeight: 20 }}
        />
      </View>

      <Blueprint style={{ padding: 0 }}>
        {rows.map((r, i) => (
          <View
            key={r.ar}
            style={{ flexDirection: row, alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 13, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: c.divider }}
          >
            <T ar={r.ar} en={r.en} style={{ flex: 1, fontSize: 12.5, color: c.textMuted60 }} />
            <Mono style={{ fontSize: 12.5, fontWeight: "500" }}>{r.v}</Mono>
          </View>
        ))}
      </Blueprint>

      <BottomBar>
        <Btn ar="تتبّع الشحنة" en="Track shipment" onPress={() => router.replace({ pathname: "/(client)/tracking/[orderId]", params: { orderId: order.id } })} />
      </BottomBar>
    </Screen>
  );
}
