import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rfs, rs } from "@/theme";

type Props = {
  visible: boolean;
  onPress: () => void;
};

export default function ScrollToTopButton({ visible, onPress }: Props) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const style: ViewStyle = {
    position: "absolute",
    right: rs(16),
    bottom: insets.bottom + rs(120),
    width: rs(44),
    height: rs(44),
    borderRadius: rs(999),
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // android shadow
  };

  return (
    <Pressable onPress={onPress} style={style}>
      <Text style={{ fontSize: rfs(18) }}>↑</Text>
    </Pressable>
  );
}
