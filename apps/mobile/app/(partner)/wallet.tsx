import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Btn } from "../../src/ui/Btn";
import { Mono } from "../../src/ui/Text";
import { c, font } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";
import { useApi } from "../../src/lib/useApi";
import type { WalletTransaction } from "@tanafus/types";

interface WalletResponse {
  pending: WalletTransaction[];
  completed: WalletTransaction[];
  availableOmr: number;
}

/** 2d — financial wallet: pending-in-escrow vs. completed tabs, and the
 * available-to-withdraw balance (already net of the platform's 15% split —
 * commission is deducted at the source when escrow releases). */
export default function Wallet() {
  const { row } = useDir();
  const [tab, setTab] = useState<"pending" | "done">("pending");
  const { data, loading } = useApi<WalletResponse>("/wallet");
  const txns = tab === "pending" ? data?.pending ?? [] : data?.completed ?? [];

  return (
    <Screen
      titleAr="المحفظة المالية"
      titleEn="Financial wallet"
      footer={
        <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: c.divider }}>
          <Btn ar="طلب تحويل" en="Withdraw earnings" onPress={() => router.push("/(partner)/withdraw")} />
        </View>
      }
    >
      <View style={{ borderWidth: 1, borderColor: c.accent, backgroundColor: c.accent100, padding: 16, gap: 4 }}>
        <T ar="الرصيد المتاح للسحب" en="Available to withdraw" style={{ fontSize: 11, color: c.accent700 }} />
        <Mono style={{ fontSize: 30, fontWeight: "600", color: c.accent900 }}>{(data?.availableOmr ?? 0).toFixed(3)} <Mono style={{ fontSize: 14 }}>OMR</Mono></Mono>
      </View>

      <View style={{ flexDirection: row, borderWidth: 1, borderColor: c.divider }}>
        {(
          [
            { key: "pending", ar: "معلّق بالضمان", en: "In escrow" },
            { key: "done", ar: "عمليات مكتملة", en: "Completed" },
          ] as const
        ).map((t) => (
          <T
            key={t.key}
            ar={t.ar}
            en={t.en}
            onPress={() => setTab(t.key)}
            style={{ flex: 1, textAlign: "center", paddingVertical: 10, fontSize: 12.5, fontWeight: "600", backgroundColor: tab === t.key ? c.accent : "transparent", color: tab === t.key ? c.bg : c.textMuted62 }}
          />
        ))}
      </View>

      {loading && <ActivityIndicator color={c.accent} />}
      {!loading && txns.length === 0 && <T ar="لا توجد عمليات" en="No transactions" style={{ textAlign: "center", color: c.textMuted55, paddingVertical: 20 }} />}
      {txns.map((t) => (
        <View key={t.id} style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.divider, padding: 12 }}>
          <View style={{ flex: 1 }}>
            <T ar={t.labelAr} en={t.labelEn} style={{ fontWeight: "500", fontSize: 13 }} />
            <Mono style={{ fontSize: 9.5, color: c.textMuted48, marginTop: 2 }}>{t.meta}</Mono>
          </View>
          <Mono style={{ fontSize: 13, fontWeight: "600", color: t.amountOmr < 0 ? c.textMuted62 : c.text }}>{t.amountOmr > 0 ? "+" : ""}{t.amountOmr.toFixed(3)}</Mono>
        </View>
      ))}
    </Screen>
  );
}
