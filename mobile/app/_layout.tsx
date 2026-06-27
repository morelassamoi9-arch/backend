import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { FontMap } from "@/constants/Typography";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";
import { AppState, AppStateStatus } from "react-native";

SplashScreen.preventAutoHideAsync();

function AuthRedirect() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(citizen)";
    if (isAuthenticated && !inAuthGroup) {
      router.replace("/(citizen)");
    } else if (!isAuthenticated && inAuthGroup) {
      router.replace("/login");
    }
  }, [isAuthenticated, segments, router]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts(FontMap);
  const restoreSession = useAppStore((s) => s.restoreSession);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Restaurer la session quand l'app revient en avant-plan
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        restoreSession();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Restaurer la session au démarrage initial
    restoreSession();

    return () => {
      subscription.remove();
    };
  }, [restoreSession]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthRedirect />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F5EFE3' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(citizen)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
