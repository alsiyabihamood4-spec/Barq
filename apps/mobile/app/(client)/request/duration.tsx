import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Chip } from "../../../src/ui/Chip";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { Lbl, Mono } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useTenderDraft } from "../../../src/state/tenderDraft";
import { useSession } from "../../../src/state/session";
import { apiFetch } from "../../../src/lib/api";
import { services, ports, deliveryHubs } from "@BARQ/i18n";
import type { Tender } from "@BARQ/types";

const DURATIONS = [
  { label: "30M", minutes: 30 },
  { label: "2H", minutes: 120 },
  { label: "6H", minutes: 360 },
  { label: "24H", minutes: 1440 },
];

/** 1a (part 4) — tender duration + publish confirm. Posts the accumulated
 * draft to POST /tenders and opens the new tender's bid comparison screen. */
export default function RequestDuration() {
  const { row } = useDir();
  const draft = useTenderDraft();
  const token = useSession((s) => s.token);
  const [loading, setLoading] = useState(false);
  const service = services.find((s) => s.key === draft.service)!;
  const port = ports.find((p) => p.code === draft.portCode)!;
  const hub = deliveryHubs.find((h) => h.key === draft.deliveryHub)!;

  async function publish() {
    setLoading(true);
    try {
      const tender = await apiFetch<Tender>("/tenders", token, {
        method: "POST",
        body: JSON.stringify({
          service: draft.service,
          portCode: draft.portCode,
          titleAr: `${service.ar} — ${draft.billOfLading}`,
          titleEn: `${service.en} — ${draft.billOfLading}`,
          descAr: "",
          descEn: "",
          durationMinutes: draft.durationMinutes,
          shipment: {
            billOfLading: draft.billOfLading,
            invoiceNo: draft.invoiceNo,
            grossWeightKg: Number(draft.grossWeightKg) || 0,
            declaredValueOmr: Number(draft.declaredValueOmr) || 0,
            taxExempt: draft.taxExempt,
            deliveryLocation: draft.service === "freight" ? hub.en : undefined,
            deliveryLat: draft.service === "freight" ? hub.lat : undefined,
            deliveryLng: draft.service === "freight" ? hub.lng : undefined,
            truckType: draft.service === "freight" ? draft.truckType : undefined,
          },
        }),
      });
      draft.reset();
      router.replace({ pathname: "/(client)/bids/[tenderId]", params: { tenderId: tender.id } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      titleAr="سقف المناقصة"
      titleEn="Tender window"
      subtitle="STEP 4 / 4 · PUBLISH"
      footer={
        <BottomBar>
          <Btn ar="نشر المناقصة" en="PUBLISH TENDER" onPress={publish} loading={loading} />
        </BottomBar>
      }
    >
      <View style={{ gap: 8 }}>
        <Lbl>
          <T ar="مدة استقبال العروض" en="Bidding window" />
        </Lbl>
        <View style={{ flexDirection: row, gap: 6 }}>
          {DURATIONS.map((d) => (
            <Chip key={d.label} mono={d.label} on={draft.durationMinutes === d.minutes} onPress={() => draft.set({ durationMinutes: d.minutes })} />
          ))}
        </View>
      </View>

      <Blueprint style={{ padding: 14, gap: 8 }}>
        <Lbl>
          <T ar="ملخص الطلب" en="Request summary" />
        </Lbl>
        <Row ar="الخدمة" en="Service" v={service.en} />
        <Row ar="المنفذ" en="Port" v={port.code} />
        <Row ar="البوليصة" en="Bill of lading" v={draft.billOfLading} />
        <Row ar="القيمة" en="Value" v={`${draft.declaredValueOmr} OMR`} />
        {draft.service === "freight" && <Row ar="التسليم" en="Delivery" v={hub.en} />}
      </Blueprint>
    </Screen>
  );
}

function Row({ ar, en, v }: { ar: string; en: string; v: string }) {
  const { row } = useDir();
  return (
    <View style={{ flexDirection: row, justifyContent: "space-between" }}>
      <T ar={ar} en={en} style={{ fontSize: 12.5, color: c.textMuted60 }} />
      <Mono style={{ fontSize: 12.5, fontWeight: "500" }}>{v}</Mono>
    </View>
  );
}
