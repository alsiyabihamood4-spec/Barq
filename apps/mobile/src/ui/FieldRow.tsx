import { View } from "react-native";
import { T } from "./T";
import { Mono } from "./Text";
import { c } from "./tokens";
import { useDir } from "../state/locale";

/** A read-only "label ⋯ value" row — the prototype's field-list pattern
 * used for shipment details, checkout costs, bank fields, receipts. */
export function FieldRow({ ar, en, value, bordered = true }: { ar: string; en: string; value: string; bordered?: boolean }) {
  const { row } = useDir();
  return (
    <View
      style={{
        flexDirection: row,
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 13,
        borderBottomWidth: bordered ? 1 : 0,
        borderBottomColor: c.divider,
      }}
    >
      <T ar={ar} en={en} style={{ flex: 1, fontSize: 12.5, color: c.textMuted60 }} />
      <Mono style={{ fontSize: 12.5, fontWeight: "500" }}>{value}</Mono>
    </View>
  );
}
