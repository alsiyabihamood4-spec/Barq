import type { ReactNode } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { T } from "./T";
import { Mono } from "./Text";
import { c, font } from "./tokens";
import { useDir } from "../state/locale";

/** The prototype's `.scr` shell: a header (back + title + mono subtitle)
 * over a scrollable body, background `--color-bg`. */
export function Screen({
  titleAr,
  titleEn,
  subtitle,
  back = true,
  right,
  children,
  scroll = true,
  contentStyle,
  footer,
}: {
  titleAr: string;
  titleEn: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: object;
  /** Rendered outside the ScrollView, pinned to the bottom — pass a
   * <BottomBar> here instead of as the last scroll child when a screen's
   * primary CTA should stay on screen while the body scrolls. */
  footer?: ReactNode;
}) {
  const { row } = useDir();
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={[styles.header, { flexDirection: row }]}>
        {back && (
          <View style={styles.back}>
            <Mono style={{ fontSize: 15, color: c.textMuted60 }} onPress={() => router.back()}>
              ‹
            </Mono>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <T ar={titleAr} en={titleEn} style={styles.title} />
          {subtitle && <Mono style={styles.subtitle}>{subtitle}</Mono>}
        </View>
        {right}
      </View>
      <Body style={{ flex: 1 }} contentContainerStyle={[{ padding: 18, paddingBottom: 40, gap: 18 }, contentStyle]}>
        {children}
      </Body>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { alignItems: "center", gap: 11, paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.divider },
  back: { width: 28, height: 28, borderWidth: 1, borderColor: c.divider, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: font.heading, fontWeight: "600", fontSize: 20, letterSpacing: 0.2 },
  subtitle: { fontSize: 11, color: c.textMuted55, marginTop: 2 },
});
