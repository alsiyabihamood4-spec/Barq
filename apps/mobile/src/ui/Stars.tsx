import { View, Pressable, Text } from "react-native";
import { c } from "./tokens";
import { useDir } from "../state/locale";

export function Stars({ rating, onPick }: { rating: number; onPick: (n: number) => void }) {
  const { row } = useDir();
  return (
    <View style={{ flexDirection: row, gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onPick(n)} hitSlop={8}>
          <Text style={{ fontSize: 30, color: n <= rating ? c.accent : c.neutral300 }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}
