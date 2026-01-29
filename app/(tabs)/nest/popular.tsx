import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NestPopularScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>둥지 - 인기 새록 페이지 (popular)</Text>
    </SafeAreaView>
  );
}
