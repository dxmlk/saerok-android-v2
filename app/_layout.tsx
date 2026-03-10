import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "../hooks/useAuth";
import * as Notifications from "expo-notifications";

import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { applyDefaultTypography } from "@/theme/applyDefaultTypography";
import { useAppFonts } from "@/theme/loadfonts";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

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
          <Stack.Screen
            name="saerok/image-viewer"
            options={{
              presentation: "transparentModal",
              animation: "fade",
            }}
          />
        </Stack>
      </AuthProvider>
    </RecoilRoot>
  );
}
