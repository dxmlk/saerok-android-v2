import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NestHelpScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>둥지 - 동정 새록 페이지 (help)</Text>
    </SafeAreaView>
  );
}
