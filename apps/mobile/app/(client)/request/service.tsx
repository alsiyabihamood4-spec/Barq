import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Lbl, Mono } from "../../../src/ui/Text";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { PickCard } from "../../../src/ui/PickCard";
import { c } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useTenderDraft } from "../../../src/state/tenderDraft";
import { services, ports } from "@BARQ/i18n";

/** 1a — service type + customs port. Tapping the port field cycles through
 * the four Oman ports, matching the prototype's `cyclePort`. */
export default function RequestService() {
  const { row } = useDir();
  const draft = useTenderDraft();
  const port = ports.find((p) => p.code === draft.portCode) ?? ports[0]!;

  return (
    <Screen
      titleAr="طلب جديد"
      titleEn="New request"
      subtitle="STEP 1 / 4 · SERVICE"
      footer={
        <BottomBar>
          <Btn ar="متابعة" en="Continue" onPress={() => router.push("/(client)/request/shipment")} />
        </BottomBar>
      }
    >
      <View style={{ gap: 10 }}>
        <Lbl>
          <T ar="نوع الخدمة" en="Service type" />
        </Lbl>
        {services.map((s) => (
          <PickCard
            key={s.key}
            code={s.code}
            ar={s.ar}
            en={s.en}
            on={draft.service === s.key}
            onPress={() => draft.set({ service: s.key as typeof draft.service })}
          />
        ))}
      </View>

      <View style={{ gap: 8 }}>
        <Lbl>
          <T ar="المنفذ الجمركي" en="Customs port" />
        </Lbl>
        <Pressable
          onPress={() => {
            const idx = ports.findIndex((p) => p.code === draft.portCode);
            draft.set({ portCode: ports[(idx + 1) % ports.length]!.code });
          }}
          style={{ flexDirection: row, alignItems: "center", gap: 12, borderWidth: 1, borderColor: c.accent, padding: 14 }}
        >
          <Mono style={{ fontSize: 9.5, color: c.accent700 }}>{port.code}</Mono>
          <View style={{ flex: 1 }}>
            <T ar={port.ar} en={port.en} style={{ fontWeight: "600", fontSize: 14 }} />
            <Mono style={{ fontSize: 10.5, color: c.textMuted55, marginTop: 2 }}>{port.brokers} BROKERS LICENSED</Mono>
          </View>
          <T ar="تبديل" en="Cycle" style={{ fontSize: 11, color: c.accent700 }} />
        </Pressable>
      </View>
    </Screen>
  );
}
