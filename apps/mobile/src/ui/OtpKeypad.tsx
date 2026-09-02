import { View, Pressable } from "react-native";
import { Mono } from "./Text";
import { c, font } from "./tokens";
import { useDir } from "../state/locale";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

/** 6-slot code display + a custom numeric keypad — matches the prototype's
 * `otpSlots`/`keys` (used by both the sign-up verification screen and the
 * carrier's delivery-confirmation screen). */
export function OtpKeypad({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const { row } = useDir();
  const slots = Array.from({ length }, (_, i) => value[i] ?? "");

  function press(k: string) {
    if (k === "C") return onChange("");
    if (k === "⌫") return onChange(value.slice(0, -1));
    if (value.length < length) onChange(value + k);
  }

  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: row, gap: 8, justifyContent: "center" }}>
        {slots.map((v, i) => (
          <View
            key={i}
            style={{
              width: 40,
              height: 48,
              borderWidth: 1,
              borderColor: v ? c.accent : i === value.length ? c.accent400 : c.divider,
              backgroundColor: v ? c.accent100 : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mono style={{ fontSize: 20, fontWeight: "600" }}>{v || (i === value.length ? "_" : "")}</Mono>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            onPress={() => press(k)}
            style={({ pressed }) => ({
              width: "33.33%",
              paddingVertical: 16,
              alignItems: "center",
              backgroundColor: pressed ? c.accentTint10 : "transparent",
            })}
          >
            <Mono style={{ fontSize: 20, fontWeight: k === "C" || k === "⌫" ? "600" : "400", color: k === "C" || k === "⌫" ? c.accent700 : c.text }}>
              {k}
            </Mono>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
