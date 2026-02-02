import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "../hooks/useAuth";

import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { applyDefaultTypography } from "@/theme/applyDefaultTypography";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Pretendard
    "Pretendard-Light": require("../assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),

    // Accent fonts
    "Moneygraphy-Rounded": require("../assets/fonts/Moneygraphy-Rounded.ttf"),
    Jalpullineunharu: require("../assets/fonts/Jalpullineunharu.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      applyDefaultTypography();
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

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
