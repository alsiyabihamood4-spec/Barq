import { Pressable, ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { Blueprint } from "./Blueprint";
import { T } from "./T";
import { c, font } from "./tokens";

interface BtnProps {
  ar: string;
  en: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Primary is the one solid accent fill in the system — the deliberate
 * exception to "never give a card/button a surface fill". Secondary and
 * ghost stay hairline/borderless per the design system guide. */
export function Btn({ ar, en, onPress, variant = "primary", disabled, loading, style }: BtnProps) {
  const isPrimary = variant === "primary";
  const label = (
    <T
      ar={ar}
      en={en}
      style={{
        fontFamily: font.heading,
        fontWeight: "600",
        fontSize: 14.5,
        letterSpacing: 0.6,
        textAlign: "center",
        color: isPrimary ? c.bg : variant === "secondary" ? c.text : c.accent700,
      }}
    />
  );

  const content = loading ? <ActivityIndicator color={isPrimary ? c.bg : c.accent700} /> : label;

  if (isPrimary) {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}>
        <Blueprint accent={false} style={{ backgroundColor: c.accent, borderColor: c.accent, padding: 14, alignItems: "center" }}>
          {content}
        </Blueprint>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          padding: 13,
          alignItems: "center",
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: c.divider,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}
