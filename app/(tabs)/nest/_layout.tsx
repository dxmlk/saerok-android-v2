import { Stack } from "expo-router";

export default function NestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="recent" />
      <Stack.Screen name="popular" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
