import type { ReactNode } from "react";
import { View } from "react-native";
import { c } from "./tokens";

/** The prototype's `.bar` sticky footer — holds the primary CTA + a
 * secondary link, separated from the scroll body by a hairline rule. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: c.divider, backgroundColor: c.bg, padding: 14, gap: 8 }}>
      {children}
    </View>
  );
}
