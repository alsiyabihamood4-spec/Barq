import { Pressable, View } from "react-native";
import { c } from "./tokens";
import { useDir } from "../state/locale";

/** The prototype's track+knob switch, rebuilt as real RN views (its CSS
 * version relies on `justify-content` flips driven by inline color/align
 * props — same idea here, animated isn't required to match the mock). */
export function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  const { row } = useDir();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 40,
        height: 22,
        borderWidth: 1,
        borderColor: on ? c.accent : c.neutral400,
        backgroundColor: on ? c.accent100 : "transparent",
        flexDirection: row,
        justifyContent: on ? "flex-end" : "flex-start",
        padding: 2,
      }}
    >
      <View style={{ width: 16, height: 16, backgroundColor: on ? c.accent : c.neutral400 }} />
    </Pressable>
  );
}
