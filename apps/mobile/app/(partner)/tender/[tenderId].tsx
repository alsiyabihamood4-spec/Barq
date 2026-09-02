import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Chip } from "../../../src/ui/Chip";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { Lbl, Mono } from "../../../src/ui/Text";
import { c } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useSession } from "../../../src/state/session";
import { useApi } from "../../../src/lib/useApi";
import { apiFetch } from "../../../src/lib/api";

const COMMISSION_PCT = 15;
const ETA_OPTS = [4, 6, 12, 24];

interface TenderDetail {
  id: string;
  code: string;
  portCode: string;
  titleAr: string;
  titleEn: string;
  billOfLading?: string | null;
  grossWeightKg?: number | null;
  declaredValueOmr?: number | null;
  taxExempt: boolean;
  clientNotes?: string | null;
  closesAt: string;
  bids: { id: string }[];
}

/** 4b — tender detail & bid sheet: shipment fields, attached documents,
 * client notes, and a price/ETA bid form. Net figure recomputes live off
 * the platform commission. */
export default function TenderDetail() {
  const { tenderId } = useLocalSearchParams<{ tenderId: string }>();
  const { row } = useDir();
  const token = useSession((s) => s.token);
  const { data: tender, loading } = useApi<TenderDetail>(`/tenders/${tenderId}`);
  const [price, setPrice] = useState(124);
  const [eta, setEta] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submitBid() {
    setSubmitting(true);
    try {
      await apiFetch(`/tenders/${tenderId}/bids`, token, {
        method: "POST",
        body: JSON.stringify({ priceOmr: price, etaHours: eta }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !tender) {
    return (
      <Screen titleAr="تفاصيل المناقصة" titleEn="Tender detail">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  const net = (price * (100 - COMMISSION_PCT)) / 100;

  const fields = [
    { ar: "رقم البوليصة", en: "Bill of lading", v: tender.billOfLading ?? "—" },
    { ar: "الوزن", en: "Weight", v: tender.grossWeightKg ? `${tender.grossWeightKg} kg` : "—" },
    { ar: "قيمة البضاعة", en: "Declared value", v: tender.declaredValueOmr ? `${tender.declaredValueOmr} OMR` : "—" },
    { ar: "الإعفاء الضريبي", en: "Tax exemption", v: tender.taxExempt ? "YES" : "NO" },
  ];

  return (
    <Screen
      titleAr={tender.code}
      titleEn={tender.code}
      subtitle={`${tender.portCode} · ${tender.bids.length} BIDS IN`}
      footer={
        submitted ? undefined : (
          <BottomBar>
            <View style={{ flexDirection: row, gap: 8 }}>
              <View style={{ flex: 1, borderWidth: 1, borderColor: c.accent, backgroundColor: c.accent100, padding: 10 }}>
                <Lbl style={{ fontSize: 8, color: c.accent700 }}>
                  <T ar="السعر" en="PRICE" />
                </Lbl>
                <Mono style={{ fontSize: 19, fontWeight: "600", color: c.accent900 }}>{price.toFixed(3)}</Mono>
              </View>
              <View style={{ gap: 4 }}>
                <Btn variant="secondary" ar="+" en="+" onPress={() => setPrice((p) => p + 2)} style={{ width: 40, padding: 8 }} />
                <Btn variant="secondary" ar="−" en="−" onPress={() => setPrice((p) => Math.max(0, p - 2))} style={{ width: 40, padding: 8 }} />
              </View>
              <View style={{ flex: 1, borderWidth: 1, borderColor: c.divider, padding: 10 }}>
                <Lbl style={{ fontSize: 8 }}>
                  <T ar="زمن التنفيذ" en="ETA" />
                </Lbl>
                <Mono style={{ fontSize: 19, fontWeight: "600" }}>{eta}h</Mono>
              </View>
            </View>
            <View style={{ flexDirection: row, gap: 6 }}>
              {ETA_OPTS.map((h) => (
                <Chip key={h} mono={`${h} H`} on={eta === h} onPress={() => setEta(h)} />
              ))}
            </View>
            <View style={{ flexDirection: row, justifyContent: "space-between" }}>
              <T ar={`صافيك بعد عمولة ${COMMISSION_PCT}%`} en={`Your net after ${COMMISSION_PCT}% fee`} style={{ fontSize: 11, color: c.textMuted55 }} />
              <Mono style={{ fontSize: 11, fontWeight: "600", color: c.accent800 }}>{net.toFixed(3)} OMR</Mono>
            </View>
            <Btn ar="تقديم العرض" en="SUBMIT BID" onPress={submitBid} loading={submitting} />
          </BottomBar>
        )
      }
    >
      {submitted ? (
        <View style={{ alignItems: "center", gap: 12, paddingTop: 30 }}>
          <T ar="تم تقديم عرضك" en="Your bid is in" style={{ fontSize: 18, fontWeight: "600" }} />
          <Btn ar="عودة إلى الساحة" en="Back to the feed" onPress={() => router.replace("/(partner)/feed")} />
        </View>
      ) : (
        <>
          <View style={{ borderWidth: 1, borderColor: c.divider }}>
            {fields.map((f, i) => (
              <View key={f.ar} style={{ flexDirection: row, alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 13, borderBottomWidth: i < fields.length - 1 ? 1 : 0, borderBottomColor: c.divider }}>
                <T ar={f.ar} en={f.en} style={{ flex: 1, fontSize: 12.5, color: c.textMuted60 }} />
                <Mono style={{ fontSize: 12.5, fontWeight: "500" }}>{f.v}</Mono>
              </View>
            ))}
          </View>
          {tender.clientNotes && (
            <View style={{ borderWidth: 1, borderColor: c.divider, padding: 13, gap: 8 }}>
              <Lbl>
                <T ar="ملاحظات العميل" en="Client notes" />
              </Lbl>
              <T ar={tender.clientNotes} en={tender.clientNotes} style={{ fontSize: 12.5, lineHeight: 20 }} />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
