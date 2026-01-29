import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NestHome() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>둥지 메인 페이지</Text>
    </SafeAreaView>
  );
}
