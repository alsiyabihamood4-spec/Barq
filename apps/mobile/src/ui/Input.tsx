import { View, TextInput, type KeyboardTypeOptions } from "react-native";
import { Lbl } from "./Text";
import { T } from "./T";
import { c, font } from "./tokens";
import { useDir } from "../state/locale";

export function Input({
  labelAr,
  labelEn,
  value,
  onChangeText,
  keyboardType,
  accentBorder,
}: {
  labelAr: string;
  labelEn: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: KeyboardTypeOptions;
  accentBorder?: boolean;
}) {
  const { textAlign } = useDir();
  return (
    <View style={{ gap: 5 }}>
      <Lbl>
        <T ar={labelAr} en={labelEn} />
      </Lbl>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: accentBorder ? c.accent : c.divider,
          padding: 12,
          fontSize: 16,
          fontFamily: font.mono,
          color: c.text,
          textAlign,
        }}
      />
    </View>
  );
}
