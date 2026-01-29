import { Stack } from "expo-router";

export default function DexLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[birdId]" />
    </Stack>
  );
}
