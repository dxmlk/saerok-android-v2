import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NestRecentScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>둥지 - 최근 새록 페이지 (recent)</Text>
    </SafeAreaView>
  );
}
