import { useState } from "react";
import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Btn } from "../../../src/ui/Btn";
import { BottomBar } from "../../../src/ui/BottomBar";
import { Stars } from "../../../src/ui/Stars";
import { c, font } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useSession } from "../../../src/state/session";
import { apiFetch } from "../../../src/lib/api";
import { ratingTraits } from "@BARQ/i18n";

const WORDS_AR = ["اختر تقييماً", "سيئ", "مقبول", "جيد", "جيد جداً", "ممتاز"];
const WORDS_EN = ["PICK A RATING", "POOR", "FAIR", "GOOD", "VERY GOOD", "EXCELLENT"];

/** 1e's follow-up — service rating: stars + trait chips, posted to
 * POST /orders/:id/rate which also rolls into the provider's running
 * average. */
export default function Rating() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { row } = useDir();
  const token = useSession((s) => s.token);
  const [rating, setRating] = useState(0);
  const [traits, setTraits] = useState<Record<string, boolean>>({ t2: true });
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await apiFetch(`/orders/${orderId}/rate`, token, {
        method: "POST",
        body: JSON.stringify({ rating, traits: Object.keys(traits).filter((k) => traits[k]) }),
      });
      router.replace("/(client)/home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      titleAr="تقييم الخدمة"
      titleEn="Rate the service"
      back={false}
      footer={
        <BottomBar>
          <Btn ar="إرسال التقييم" en="Submit rating" onPress={submit} loading={loading} disabled={rating === 0} />
        </BottomBar>
      }
    >
      <View style={{ alignItems: "center", gap: 14, paddingVertical: 10 }}>
        <Stars rating={rating} onPick={setRating} />
        <T ar={WORDS_AR[rating]!} en={WORDS_EN[rating]!} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 15, color: c.textMuted60 }} />
      </View>

      <View style={{ flexDirection: row, flexWrap: "wrap", gap: 8 }}>
        {ratingTraits.map((t) => {
          const on = traits[t.key];
          return (
            <Pressable
              key={t.key}
              onPress={() => setTraits((s) => ({ ...s, [t.key]: !s[t.key] }))}
              style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: on ? c.accent : c.divider, backgroundColor: on ? c.accent : "transparent" }}
            >
              <T ar={t.ar} en={t.en} style={{ fontSize: 12.5, fontWeight: "500", color: on ? c.bg : c.text }} />
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
