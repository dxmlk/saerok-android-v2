import { Stack } from "expo-router";

export default function SaerokStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="write" />
      <Stack.Screen name="[collectionId]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="search-bird" />
      <Stack.Screen name="search-place" />
    </Stack>
  );
}
