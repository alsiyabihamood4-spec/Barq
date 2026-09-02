import { View, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { c } from "./tokens";

const MARK = 11;
const STROKE = 1;
const OFFSET = -6;

function Cross({ style }: { style: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ position: "absolute", width: MARK, height: MARK }, style]} pointerEvents="none">
      <View style={{ position: "absolute", left: 5, top: 0, width: STROKE, height: MARK, backgroundColor: c.textMuted55 }} />
      <View style={{ position: "absolute", top: 5, left: 0, width: MARK, height: STROKE, backgroundColor: c.textMuted55 }} />
    </View>
  );
}

/** The Industry system's wireframe frame — square, hairline border, "+"
 * registration marks at all four corners. Ported 1:1 from `.blueprint` /
 * `.corner` in the design system stylesheet. Never round it. */
export function Blueprint({
  children,
  style,
  accent = false,
  ...rest
}: { accent?: boolean } & ViewProps) {
  return (
    <View
      style={[
        { borderWidth: 1, borderColor: accent ? c.accent400 : c.divider, backgroundColor: accent ? c.accent100 : "transparent" },
        style,
      ]}
      {...rest}
    >
      <Cross style={{ top: OFFSET, left: OFFSET }} />
      <Cross style={{ top: OFFSET, right: OFFSET }} />
      <Cross style={{ bottom: OFFSET, left: OFFSET }} />
      <Cross style={{ bottom: OFFSET, right: OFFSET }} />
      {children}
    </View>
  );
}
