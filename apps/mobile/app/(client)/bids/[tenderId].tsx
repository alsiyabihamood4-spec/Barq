import { useMemo, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Chip } from "../../../src/ui/Chip";
import { Btn } from "../../../src/ui/Btn";
import { Mono } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c, font } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useSession } from "../../../src/state/session";
import { useApi } from "../../../src/lib/useApi";
import { apiFetch } from "../../../src/lib/api";
import type { Order } from "@BARQ/types";

type Sort = "price" | "rating" | "speed";

interface BidView {
  id: string;
  priceOmr: number;
  etaHours: number;
  status: string;
  provider: { id: string; nameAr: string; nameEn: string; ratingAvg: number; ratingCount: number };
}
interface TenderView {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  bids: BidView[];
}

/** 1b — bid comparison: instant re-sort by price/rating/speed, accept opens
 * escrow checkout for the resulting order. */
export default function Bids() {
  const { tenderId } = useLocalSearchParams<{ tenderId: string }>();
  const { row } = useDir();
  const token = useSession((s) => s.token);
  const [sort, setSort] = useState<Sort>("price");
  const [accepting, setAccepting] = useState<string | null>(null);
  const { data: tender, loading } = useApi<TenderView>(`/tenders/${tenderId}`);

  const sorted = useMemo(() => {
    const bids = tender?.bids ?? [];
    return [...bids].sort((a, b) =>
      sort === "price" ? a.priceOmr - b.priceOmr : sort === "rating" ? b.provider.ratingAvg - a.provider.ratingAvg : a.etaHours - b.etaHours
    );
  }, [tender, sort]);

  async function accept(bidId: string) {
    setAccepting(bidId);
    try {
      const order = await apiFetch<Order>(`/bids/${bidId}/accept`, token, { method: "POST" });
      router.replace({ pathname: "/(client)/checkout/[orderId]", params: { orderId: order.id } });
    } finally {
      setAccepting(null);
    }
  }

  if (loading || !tender) {
    return (
      <Screen titleAr="مقارنة العروض" titleEn="Bid comparison">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  return (
    <Screen titleAr="مقارنة العروض" titleEn="Bid comparison" subtitle={`${tender.code} · ${sorted.length} BIDS`}>
      <View style={{ flexDirection: row, gap: 6 }}>
        {(
          [
            { key: "price", ar: "السعر", en: "Price" },
            { key: "rating", ar: "التقييم", en: "Rating" },
            { key: "speed", ar: "السرعة", en: "Speed" },
          ] as const
        ).map((s) => (
          <Chip key={s.key} ar={s.ar} en={s.en} on={sort === s.key} onPress={() => setSort(s.key)} />
        ))}
      </View>

      {sorted.length === 0 && (
        <Blueprint style={{ padding: 24, alignItems: "center" }}>
          <T ar="لم تصل عروض بعد" en="No bids yet" style={{ color: c.textMuted58 }} />
        </Blueprint>
      )}

      {sorted.map((b) => (
        <Blueprint key={b.id} style={{ padding: 14, gap: 10 }}>
          <View style={{ flexDirection: row, alignItems: "center", gap: 10 }}>
            <Mono style={{ width: 34, height: 34, borderWidth: 1, borderColor: c.divider, textAlign: "center", textAlignVertical: "center", fontSize: 11, fontWeight: "600" }}>
              {b.provider.nameEn.slice(0, 2).toUpperCase()}
            </Mono>
            <View style={{ flex: 1 }}>
              <T ar={b.provider.nameAr} en={b.provider.nameEn} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 14.5 }} />
              <Mono style={{ fontSize: 10.5, color: c.textMuted55, marginTop: 2 }}>
                ★ {b.provider.ratingAvg.toFixed(1)} ({b.provider.ratingCount})
              </Mono>
            </View>
          </View>
          <View style={{ flexDirection: row, justifyContent: "space-between" }}>
            <View>
              <Mono style={{ fontSize: 19, fontWeight: "600" }}>{b.priceOmr.toFixed(3)}</Mono>
              <Mono style={{ fontSize: 9.5, color: c.textMuted48 }}>OMR</Mono>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Mono style={{ fontSize: 19, fontWeight: "600" }}>{b.etaHours}h</Mono>
              <Mono style={{ fontSize: 9.5, color: c.textMuted48 }}>ETA</Mono>
            </View>
          </View>
          <Btn
            ar={b.status === "ACCEPTED" ? "تم القبول ✓" : "قبول العرض"}
            en={b.status === "ACCEPTED" ? "ACCEPTED ✓" : "ACCEPT BID"}
            variant={b.status === "ACCEPTED" ? "primary" : "secondary"}
            disabled={b.status === "REJECTED" || accepting !== null}
            loading={accepting === b.id}
            onPress={() => accept(b.id)}
          />
        </Blueprint>
      ))}
    </Screen>
  );
}
