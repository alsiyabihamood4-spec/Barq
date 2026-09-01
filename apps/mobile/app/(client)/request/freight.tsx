import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Input } from "../../../src/ui/Input";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { PickCard } from "../../../src/ui/PickCard";
import { Lbl } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c } from "../../../src/ui/tokens";
import { useTenderDraft } from "../../../src/state/tenderDraft";
import { trucks } from "@tanafus/i18n";

/** 1a (part 3, freight only) — delivery location + truck type. The map is a
 * drawn placeholder in the design bundle too, marked for a Mapbox/Google
 * Maps SDK swap. */
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
        <Input labelAr="العنوان" labelEn="Address" value={draft.deliveryLocation} onChangeText={(v) => draft.set({ deliveryLocation: v })} />
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
