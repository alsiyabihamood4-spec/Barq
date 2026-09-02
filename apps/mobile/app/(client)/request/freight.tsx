import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { PickCard } from "../../../src/ui/PickCard";
import { Lbl } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c } from "../../../src/ui/tokens";
import { useTenderDraft } from "../../../src/state/tenderDraft";
import { trucks, deliveryHubs } from "@tanafus/i18n";

/** 1a (part 3, freight only) — delivery location + truck type. The map
 * canvas is still a drawn placeholder (per the design bundle's own note),
 * but the hub picker gives it real coordinates — live tracking later shows
 * a real PostGIS/Redis-GEO distance instead of a made-up number. */
export default function RequestFreight() {
  const draft = useTenderDraft();

  return (
    <Screen
      titleAr="تفاصيل النقل"
      titleEn="Freight details"
      subtitle="STEP 3 / 4 · FREIGHT"
      footer={
        <BottomBar>
          <Btn ar="متابعة" en="Continue" onPress={() => router.push("/(client)/request/duration")} />
        </BottomBar>
      }
    >
      <View style={{ gap: 8 }}>
        <Lbl>
          <T ar="موقع التسليم" en="Delivery location" />
        </Lbl>
        <Blueprint style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: c.neutral100 }}>
          <T ar="⚑ خريطة ملاحة — عنصر بديل" en="⚑ Navigation map — placeholder" style={{ fontSize: 11.5, color: c.textMuted55 }} />
        </Blueprint>
        <View style={{ gap: 8 }}>
          {deliveryHubs.map((h) => (
            <PickCard
              key={h.key}
              code={h.key.slice(0, 3).toUpperCase()}
              ar={h.ar}
              en={h.en}
              on={draft.deliveryHub === h.key}
              onPress={() => draft.set({ deliveryHub: h.key })}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Lbl>
          <T ar="نوع الشاحنة" en="Truck type" />
        </Lbl>
        {trucks.map((t) => (
          <PickCard
            key={t.key}
            code={t.code}
            ar={`${t.ar} · ${t.cap}`}
            en={`${t.en} · ${t.cap}`}
            on={draft.truckType === t.key}
            onPress={() => draft.set({ truckType: t.key })}
          />
        ))}
      </View>
    </Screen>
  );
}
