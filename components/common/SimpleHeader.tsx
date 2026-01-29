import BracketIcon from "@/assets/icon/button/bracket.svg";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function SimpleHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <View
      style={{
        height: 56,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute",
          left: 16,
          height: 56,
          justifyContent: "center",
        }}
        hitSlop={10}
      >
        <BracketIcon width={18} height={18} />
      </Pressable>

      <Text style={{ fontSize: 16, fontWeight: "600", color: "#111" }}>
        {title}
      </Text>
    </View>
  );
}
