import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SaerokNotificationsScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>새록 알림 페이지 (notifications)</Text>
    </SafeAreaView>
  );
}
