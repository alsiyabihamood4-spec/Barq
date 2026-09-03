import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Screen } from "../../src/ui/Screen";
import { T } from "../../src/ui/T";
import { Chip } from "../../src/ui/Chip";
import { Mono } from "../../src/ui/Text";
import { Blueprint } from "../../src/ui/Blueprint";
import { c, font } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";
import { useApi } from "../../src/lib/useApi";
import type { Order } from "@BARQ/types";

/** 3g — completed shipment history, filterable by service. */
export default function History() {
  const { row } = useDir();
  const [filter, setFilter] = useState<"all" | "clearance" | "freight">("all");
  const { data: orders, loading } = useApi<Order[]>("/orders");
  const delivered = (orders ?? []).filter((o) => o.stage === "delivered" && (filter === "all" || o.service === filter));

  return (
    <Screen titleAr="سجل الشحنات" titleEn="Shipment history">
      <View style={{ flexDirection: row, gap: 6 }}>
        {(
          [
            { key: "all", ar: "الكل", en: "All" },
            { key: "clearance", ar: "تخليص", en: "Clearance" },
            { key: "freight", ar: "نقل", en: "Freight" },
          ] as const
        ).map((f) => (
          <Chip key={f.key} ar={f.ar} en={f.en} on={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </View>

      {loading && <ActivityIndicator color={c.accent} />}
      {!loading && delivered.length === 0 && (
        <Blueprint style={{ padding: 24, alignItems: "center" }}>
          <T ar="لا توجد شحنات مكتملة بعد" en="No completed shipments yet" style={{ color: c.textMuted58 }} />
        </Blueprint>
      )}
      {delivered.map((o) => (
        <View key={o.id} style={{ borderWidth: 1, borderColor: c.divider, padding: 13, gap: 4 }}>
          <View style={{ flexDirection: row, justifyContent: "space-between" }}>
            <Mono style={{ fontSize: 10.5, fontWeight: "600" }}>{o.code}</Mono>
            <Mono style={{ fontSize: 10, color: c.textMuted48 }}>{o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : ""}</Mono>
          </View>
          <T ar={`${o.portCode} · ${o.service === "freight" ? "نقل" : "تخليص"}`} en={`${o.portCode} · ${o.service}`} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 14.5 }} />
          <Mono style={{ fontSize: 12, fontWeight: "600", color: c.accent700 }}>{o.escrowOmr.toFixed(3)} OMR</Mono>
        </View>
      ))}
    </Screen>
  );
}
