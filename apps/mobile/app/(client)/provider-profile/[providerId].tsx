import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/ui/Screen";
import { T } from "../../../src/ui/T";
import { Mono } from "../../../src/ui/Text";
import { Blueprint } from "../../../src/ui/Blueprint";
import { c, font } from "../../../src/ui/tokens";
import { useDir } from "../../../src/state/locale";
import { useApi } from "../../../src/lib/useApi";
import { ratingTraits } from "@BARQ/i18n";

interface ProviderProfile {
  nameAr: string;
  nameEn: string;
  ratingAvg: number;
  ratingCount: number;
  providerType?: string;
  completedRatings: number;
  topTraits: string[];
}

/** 3e — provider profile: real rating aggregates and the trait tags
 * clients most often selected. No free-text reviews are stored yet, so
 * this doesn't fabricate quotes the way the design mockup's placeholder
 * copy does. */
export default function ProviderProfile() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const { row } = useDir();
  const { data: p, loading } = useApi<ProviderProfile>(`/providers/${providerId}`);

  if (loading || !p) {
    return (
      <Screen titleAr="الملف التعريفي" titleEn="Provider profile">
        <ActivityIndicator color={c.accent} />
      </Screen>
    );
  }

  return (
    <Screen titleAr="الملف التعريفي" titleEn="Provider profile">
      <View style={{ alignItems: "center", gap: 8 }}>
        <Mono style={{ width: 60, height: 60, borderWidth: 1, borderColor: c.divider, textAlign: "center", textAlignVertical: "center", fontSize: 18, fontWeight: "600" }}>
          {p.nameEn.slice(0, 2).toUpperCase()}
        </Mono>
        <T ar={p.nameAr} en={p.nameEn} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 20 }} />
        <Mono style={{ fontSize: 12, color: c.textMuted55 }}>★ {p.ratingAvg.toFixed(1)} · {p.ratingCount} REVIEWS</Mono>
      </View>

      {p.topTraits.length > 0 && (
        <View style={{ flexDirection: row, flexWrap: "wrap", gap: 8 }}>
          {p.topTraits.map((key) => {
            const trait = ratingTraits.find((t) => t.key === key);
            if (!trait) return null;
            return (
              <View key={key} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: c.accent100 }}>
                <T ar={trait.ar} en={trait.en} style={{ fontSize: 11.5, color: c.accent800, fontWeight: "500" }} />
              </View>
            );
          })}
        </View>
      )}

      <Blueprint style={{ padding: 14 }}>
        <T
          ar={`أكمل ${p.completedRatings} معاملة مقيَّمة على المنصّة.`}
          en={`Completed ${p.completedRatings} rated jobs on the platform.`}
          style={{ fontSize: 12.5, color: c.textMuted60, lineHeight: 20 }}
        />
      </Blueprint>
    </Screen>
  );
}
