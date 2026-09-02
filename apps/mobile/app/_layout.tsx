import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useSession } from "../src/state/session";
import { useLocaleStore } from "../src/state/locale";
import { c } from "../src/ui/tokens";

export default function RootLayout() {
  const hydrateSession = useSession((s) => s.hydrate);
  const hydrateLocale = useLocaleStore((s) => s.hydrate);
  const hydrated = useSession((s) => s.hydrated);
  const [localeReady, setLocaleReady] = useState(false);

  useEffect(() => {
    hydrateSession();
    hydrateLocale().finally(() => setLocaleReady(true));
  }, [hydrateSession, hydrateLocale]);

  if (!hydrated || !localeReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
    </SafeAreaProvider>
  );
}
