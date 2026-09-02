import { useEffect, useState } from "react";
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
import { useSession } from "../../../src/state/session";
import { useApi } from "../../../src/lib/useApi";
import { apiFetch } from "../../../src/lib/api";
import { clearanceSteps, freightSteps } from "@tanafus/i18n";
import type { Order } from "@tanafus/types";

interface LocationResponse {
  tracking: boolean;
  lat?: number;
  lng?: number;
  distanceKm?: number | null;
}

/** 1d — live order tracking: the clearance stepper for customs orders, a
 * freight-specific line + live distance for road freight. "Simulate next
 * stage" mirrors the prototype's own demo control (`advance()`), wired here
 * to the real POST /orders/:id/advance instead of local-only state. Freight
 * distance comes from the real Redis GEO buffer the carrier's job screen
 * posts to (POST /orders/:id/location) — not a placeholder number. */
export default function Tracking() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { row } = useDir();
  const token = useSession((s) => s.token);
  const { data: order, loading, reload } = useApi<Order>(`/orders/${orderId}`);
  const [advancing, setAdvancing] = useState(false);
  const [location, setLocation] = useState<LocationResponse | null>(null);

  const isFreight = order?.service === "freight";

  useEffect(() => {
    if (!isFreight || order?.stage !== "in_transit") return;
    const poll = () => apiFetch<LocationResponse>(`/orders/${orderId}/location`, token).then(setLocation).catch(() => {});
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, [isFreight, order?.stage, orderId, token]);

  async function advance() {
    setAdvancing(true);
    try {
      await apiFetch(`/orders/${orderId}/advance`, token, { method: "POST" });
      reload();
    } finally {
      setAdvancing(false);
    }
  }

  if (loading || !order) {
    return (
      <Screen titleAr="تتبّع المعاملة" titleEn="Live tracking">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  const steps = isFreight ? freightSteps : clearanceSteps;
  const stepIdx = Math.min(order.stageIndex, steps.length - 1);

  return (
    <Screen titleAr="تتبّع المعاملة" titleEn="Live tracking" subtitle={`${order.code} · ${order.portCode}`}>
      {isFreight && order.stage === "in_transit" && (
        <Blueprint style={{ height: 150, alignItems: "center", justifyContent: "center", backgroundColor: c.neutral100, gap: 6 }}>
          <T ar="⚑ خريطة الملاحة الحية — عنصر بديل" en="⚑ Live navigation map — placeholder" style={{ fontSize: 11.5, color: c.textMuted55 }} />
          {location?.tracking && location.distanceKm != null && (
            <T
              ar={`${location.distanceKm} كم متبقٍ`}
              en={`${location.distanceKm} km remaining`}
              style={{ fontSize: 13, fontWeight: "600", color: c.accent700, fontFamily: font.mono }}
            />
          )}
          {!location?.tracking && (
            <T ar="بانتظار موقع الناقل" en="Waiting for the carrier's location" style={{ fontSize: 10.5, color: c.textMuted48 }} />
          )}
        </Blueprint>
      )}

      <Blueprint style={{ padding: 0 }}>
        {steps.map((s, i) => {
          const done = i < stepIdx;
          const cur = i === stepIdx;
          return (
            <View
              key={s.key}
              style={{ flexDirection: row, alignItems: "center", gap: 11, paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: i < steps.length - 1 ? 1 : 0, borderBottomColor: c.divider }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: done || cur ? c.accent : c.neutral400,
                  backgroundColor: done ? c.accent : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {done && <Mono style={{ fontSize: 10, color: c.bg }}>✓</Mono>}
              </View>
              <View style={{ flex: 1 }}>
                <T
                  ar={s.ar}
                  en={s.en}
                  style={{ fontFamily: font.heading, fontWeight: cur ? "600" : "500", fontSize: 14, color: done || cur ? c.text : c.textMuted45 }}
                />
                <T ar={s.noteAr} en={s.noteEn} style={{ fontSize: 11, color: c.textMuted55, marginTop: 2 }} />
              </View>
              {cur && <Mono style={{ fontSize: 9.5, color: c.accent700, fontWeight: "600" }}>NOW</Mono>}
            </View>
          );
        })}
      </Blueprint>

      <BottomBar>
        {order.stage !== "delivered" && (
          <Btn variant="secondary" ar="محاكاة المرحلة التالية" en="Simulate next stage" onPress={advance} loading={advancing} />
        )}
        {(order.stage === "released" || order.stage === "in_transit") && (
          <Btn ar="تأكيد الاستلام" en="Confirm delivery" onPress={() => router.push({ pathname: "/(client)/delivery/[orderId]", params: { orderId: order.id } })} />
        )}
      </BottomBar>
    </Screen>
  );
}
