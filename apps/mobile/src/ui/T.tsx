import { Text, type TextProps } from "react-native";
import { useDir } from "../state/locale";

/** Bilingual text — mirrors the prototype's `<span class="ar">/<span class="en">`
 * pair, picking the active locale's string instead of toggling CSS display. */
export function T({ ar, en, style, ...rest }: { ar: string; en: string } & TextProps) {
  const { locale } = useDir();
  return (
    <Text style={style} {...rest}>
      {locale === "ar" ? ar : en}
    </Text>
  );
}
