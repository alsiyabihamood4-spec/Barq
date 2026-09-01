import { Pressable, View } from "react-native";
import { T } from "./T";
import { Mono } from "./Text";
import { c, font } from "./tokens";
import { useDir } from "../state/locale";

/** A selectable card with a mono code, title, note and trailing chevron —
 * used for role choice, provider type, service type, truck type. */
export function PickCard({
  code,
  ar,
  en,
  noteAr,
  noteEn,
  on,
  onPress,
}: {
  code: string;
  ar: string;
  en: string;
  noteAr?: string;
  noteEn?: string;
  on: boolean;
  onPress: () => void;
}) {
  const { row } = useDir();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: row,
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: on ? c.accent : c.divider,
        backgroundColor: on ? c.accent100 : "transparent",
        padding: 14,
      }}
    >
      <Mono style={{ fontSize: 9.5, color: on ? c.accent700 : c.textMuted45, flexShrink: 0 }}>{code}</Mono>
      <View style={{ flex: 1 }}>
        <T ar={ar} en={en} style={{ fontFamily: font.heading, fontWeight: "600", fontSize: 15, color: on ? c.accent900 : c.text }} />
        {(noteAr || noteEn) && <T ar={noteAr ?? ""} en={noteEn ?? ""} style={{ fontSize: 11.5, color: c.textMuted55, marginTop: 2 }} />}
      </View>
      <Mono style={{ fontSize: 13, color: on ? c.accent700 : c.textMuted45 }}>{"›"}</Mono>
    </Pressable>
  );
}
