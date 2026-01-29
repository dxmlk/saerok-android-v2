import React from "react";
import { Stack } from "expo-router";

import { AuthProvider } from "../hooks/useAuth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* index.tsx (온보딩) */}
        <Stack.Screen name="index" />

        {/* 탭 그룹 */}
        <Stack.Screen name="(tabs)" />

        {/* 기타 화면 */}
        <Stack.Screen name="login" />
      </Stack>
    </AuthProvider>
  );
}
