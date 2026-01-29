// index.tsx
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyHome() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>마이 메인</Text>
    </SafeAreaView>
  );
}
