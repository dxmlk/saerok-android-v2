import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onPress: () => void;
};

export default function ScrollToTopButton({ visible, onPress }: Props) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const style: ViewStyle = {
    position: "absolute",
    right: 16,
    bottom: insets.bottom + 120, // 탭바/홈바 위로 띄우기
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // android shadow
  };

  return (
    <Pressable onPress={onPress} style={style}>
      <Text style={{ fontSize: 18 }}>↑</Text>
    </Pressable>
  );
}
