import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "../hooks/useAuth";

import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { applyDefaultTypography } from "@/theme/applyDefaultTypography";
import { useAppFonts } from "@/theme/loadfonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useAppFonts();

  useEffect(() => {
    if (loaded) {
      applyDefaultTypography();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <RecoilRoot>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
        </Stack>
      </AuthProvider>
    </RecoilRoot>
  );
}
