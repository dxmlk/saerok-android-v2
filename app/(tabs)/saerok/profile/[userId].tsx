import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserProfile() {
  const { userId } = useLocalSearchParams();

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>유저 프로필: {userId}</Text>
    </SafeAreaView>
  );
}
