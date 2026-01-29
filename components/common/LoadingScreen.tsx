import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  text?: string;
};

export default function LoadingScreen({ text = "로딩 중..." }: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12, color: "#6B7280", fontWeight: "700" }}>
        {text}
      </Text>
    </View>
  );
}
