import { View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "../../src/ui/T";
import { Lbl, Mono } from "../../src/ui/Text";
import { Btn } from "../../src/ui/Btn";
import { Blueprint } from "../../src/ui/Blueprint";
import { c, font } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";
import { useSession } from "../../src/state/session";
import { useApi } from "../../src/lib/useApi";
import type { Order } from "@tanafus/types";

const STAGE_LABEL: Record<string, { ar: string; en: string; done: number }> = {
  assigned: { ar: "تم التعيين", en: "Assigned", done: 1 },
  declaration: { ar: "إعداد البيان", en: "Declaration filing", done: 1 },
  inspection: { ar: "انتظار التفتيش", en: "Awaiting inspection", done: 2 },
  released: { ar: "تم الفسح", en: "Released", done: 3 },
  in_transit: { ar: "في الطريق", en: "In transit", done: 3 },
  delivered: { ar: "تم التسليم", en: "Delivered", done: 4 },
};

export default function Home() {
  const { row } = useDir();
  const user = useSession((s) => s.user);
  const { data: orders, loading } = useApi<Order[]>("/orders");
  const active = (orders ?? []).filter((o) => o.stage !== "delivered");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 18, paddingBottom: 40 }}>
        <View style={{ flexDirection: row, alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Mono style={{ fontSize: 10, color: c.textMuted48 }}>TANAFUS · تنافُس</Mono>
            <T
              ar={`مرحباً، ${user?.nameAr ?? ""}`}
              en={`Welcome, ${user?.nameEn ?? ""}`}
              style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 24, marginTop: 4 }}
            />
          </View>
          <Mono
            onPress={() => router.push("/(client)/profile")}
            style={{ width: 34, height: 34, borderWidth: 1, borderColor: c.divider, textAlign: "center", textAlignVertical: "center", fontSize: 12, fontWeight: "600" }}
          >
            {(user?.nameEn ?? "?").slice(0, 2).toUpperCase()}
          </Mono>
        </View>

        <Btn
          ar="+ طرح شحنة جديدة"
          en="+ Post a new shipment"
          onPress={() => router.push("/(client)/request/service")}
        />

        <View style={{ gap: 10 }}>
          <Lbl>
            <T ar="الشحنات النشطة" en="Active shipments" />
          </Lbl>
          {loading && <ActivityIndicator color={c.accent} />}
          {!loading && active.length === 0 && (
            <Blueprint style={{ padding: 20, alignItems: "center" }}>
              <T ar="لا توجد شحنات نشطة بعد" en="No active shipments yet" style={{ color: c.textMuted58, fontSize: 13 }} />
            </Blueprint>
          )}
          {active.map((o) => {
            const stage = STAGE_LABEL[o.stage] ?? { ar: o.stage, en: o.stage, done: 0 };
            return (
              <Pressable key={o.id} onPress={() => router.push({ pathname: "/(client)/tracking/[orderId]", params: { orderId: o.id } })}>
                <Blueprint accent style={{ padding: 14, gap: 8 }}>
                  <View style={{ flexDirection: row, justifyContent: "space-between" }}>
                    <Mono style={{ fontSize: 11, fontWeight: "600" }}>{o.code}</Mono>
                    <Mono style={{ fontSize: 10, color: c.textMuted55 }}>{o.portCode}</Mono>
                  </View>
                  <T ar={stage.ar} en={stage.en} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 15 }} />
                  <View style={{ flexDirection: row, gap: 3 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <View key={i} style={{ flex: 1, height: 3, backgroundColor: i < stage.done ? c.accent : c.neutral300 }} />
                    ))}
                  </View>
                </Blueprint>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: row, gap: 10 }}>
          <Btn variant="secondary" ar="سجل الشحنات" en="History" onPress={() => router.push("/(client)/history")} style={{ flex: 1 }} />
          <Btn variant="secondary" ar="الملف الشخصي" en="Profile" onPress={() => router.push("/(client)/profile")} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
