import { Text as RNText, type TextProps } from "react-native";
import { c, font } from "./tokens";

export function Lbl({ style, ...rest }: TextProps) {
  return (
    <RNText
      style={[
        { fontFamily: font.heading, fontWeight: "600", fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: c.textMuted55 },
        style,
      ]}
      {...rest}
    />
  );
}

export function Mono({ style, ...rest }: TextProps) {
  return <RNText style={[{ fontFamily: font.mono, fontVariant: ["tabular-nums"] }, style]} {...rest} />;
}

export function Muted({ style, ...rest }: TextProps) {
  return <RNText style={[{ color: c.textMuted58, fontSize: 12.5, lineHeight: 18 }, style]} {...rest} />;
}
