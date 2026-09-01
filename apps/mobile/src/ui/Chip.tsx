import { Pressable } from "react-native";
import { T } from "./T";
import { Mono } from "./Text";
import { c, font } from "./tokens";

/** A selectable pill/segment — used for durations, ETA presets, withdrawal
 * amounts, filters. Mirrors the prototype's `chip(on)` helper: solid accent
 * when selected, hairline otherwise. */
export function Chip({
  ar,
  en,
  mono,
  on,
  onPress,
  flex = true,
}: {
  ar?: string;
  en?: string;
  mono?: string;
  on: boolean;
  onPress: () => void;
  flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: flex ? 1 : undefined,
        alignItems: "center",
        paddingVertical: 9,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: on ? c.accent : c.divider,
        backgroundColor: on ? c.accent : "transparent",
      }}
    >
      {mono ? (
        <Mono style={{ fontSize: 11.5, fontWeight: "500", color: on ? c.bg : c.text }}>{mono}</Mono>
      ) : (
        <T
          ar={ar ?? ""}
          en={en ?? ""}
          style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: "500", color: on ? c.bg : c.text }}
        />
      )}
    </Pressable>
  );
}
