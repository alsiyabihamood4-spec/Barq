import { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "../../src/ui/T";
import { Mono } from "../../src/ui/Text";
import { Blueprint } from "../../src/ui/Blueprint";
import { c, font } from "../../src/ui/tokens";
import { useDir } from "../../src/state/locale";
import { useSession } from "../../src/state/session";
import { useApi } from "../../src/lib/useApi";
import { Lbl } from "../../src/ui/Text";
import type { Tender, Order } from "@tanafus/types";

function hms(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const p = (v: number) => String(v).padStart(2, "0");
  return `${h}:${p(m)}:${p(s)}`;
}

/** 2b — live tender feed, geo-fenced server-side to the provider's port
 * licences (see GET /tenders?portCode). Countdown ticks client-side off
 * each tender's real `closesAt`. */
export default function Feed() {
  const { row, textAlign } = useDir();
  const user = useSession((s) => s.user);
  const { data: tenders, loading } = useApi<Tender[]>("/tenders");
  const { data: orders } = useApi<Order[]>("/orders");
  const activeJobs = (orders ?? []).filter((o) => o.stage !== "delivered");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: row, alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Mono style={{ fontSize: 10, color: c.textMuted48 }}>TANAFUS · تنافُس</Mono>
            <T ar="ساحة المناقصات" en="Tender feed" style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 24, marginTop: 4 }} />
          </View>
          <View style={{ flexDirection: row, gap: 8 }}>
            <NavIcon label="؋" onPress={() => router.push("/(partner)/wallet")} />
            <NavIcon label={(user?.nameEn ?? "?").slice(0, 2).toUpperCase()} onPress={() => router.push("/(partner)/profile")} mono />
          </View>
        </View>

        {activeJobs.length > 0 && (
          <View style={{ gap: 8 }}>
            <Lbl>
              <T ar="مهامي الجارية" en="My active jobs" />
            </Lbl>
            {activeJobs.map((o) => (
              <Pressable key={o.id} onPress={() => router.push({ pathname: "/(partner)/job/[orderId]", params: { orderId: o.id } })}>
                <View style={{ flexDirection: row, alignItems: "center", gap: 10, borderWidth: 1, borderColor: c.accent, backgroundColor: c.accent100, padding: 12 }}>
                  <Mono style={{ fontSize: 10.5, fontWeight: "600", color: c.accent800 }}>{o.code}</Mono>
                  <T ar={o.stage} en={o.stage} style={{ flex: 1, fontSize: 12, textAlign, color: c.accent700 }} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <Lbl>
          <T ar="ساحة المناقصات" en="Open tenders" />
        </Lbl>
        {loading && <ActivityIndicator color={c.accent} />}
        {!loading && (tenders ?? []).length === 0 && (
          <Blueprint style={{ padding: 24, alignItems: "center" }}>
            <T ar="لا توجد مناقصات متاحة الآن" en="No tenders available right now" style={{ color: c.textMuted58 }} />
          </Blueprint>
        )}
        {(tenders ?? []).map((t) => {
          const left = Math.max(0, Math.floor((new Date(t.closesAt).getTime() - now) / 1000));
          const urgent = left < 900;
          return (
            <Pressable key={t.id} onPress={() => router.push({ pathname: "/(partner)/tender/[tenderId]", params: { tenderId: t.id } })}>
              <Blueprint style={{ padding: 14, gap: 8 }}>
                <View style={{ flexDirection: row, justifyContent: "space-between", alignItems: "center" }}>
                  <Mono style={{ fontSize: 10.5, fontWeight: "600" }}>{t.code} · {t.portCode}</Mono>
                  <View style={{ borderWidth: 1, borderColor: urgent ? c.accent : c.divider, backgroundColor: urgent ? c.accent100 : "transparent", paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Mono style={{ fontSize: 12, fontWeight: "600", color: urgent ? c.accent800 : c.text }}>{hms(left)}</Mono>
                  </View>
                </View>
                <T ar={t.titleAr} en={t.titleEn} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 15 }} />
                <T ar={t.descAr} en={t.descEn} style={{ fontSize: 11.5, color: c.textMuted55 }} />
                <View style={{ flexDirection: row, gap: 14 }}>
                  <Mono style={{ fontSize: 10, color: c.textMuted48 }}>{t.documents?.length ?? 0} DOCS</Mono>
                  <Mono style={{ fontSize: 10, color: c.textMuted48 }}>{(t as unknown as { bids?: unknown[] }).bids?.length ?? 0} BIDS</Mono>
                </View>
              </Blueprint>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function NavIcon({ label, onPress, mono }: { label: string; onPress: () => void; mono?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ width: 34, height: 34, borderWidth: 1, borderColor: c.divider, alignItems: "center", justifyContent: "center" }}>
      <Mono style={{ fontSize: mono ? 11 : 15, fontWeight: "600" }}>{label}</Mono>
    </Pressable>
  );
}
