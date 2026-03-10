import React from "react";
import { Pressable, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rs } from "@/theme";
import ScrollTopChevronIcon from "@/assets/icon/common/ScrollTopChevronIcon";

type Props = {
  visible: boolean;
  onPress: () => void;
};

export default function ScrollToTopButton({ visible, onPress }: Props) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const style: ViewStyle = {
    position: "absolute",
    right: rs(24),
    bottom: insets.bottom + rs(92),
    width: rs(40),
    height: rs(40),
    borderRadius: rs(999),
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // android shadow
  };

  return (
    <Pressable onPress={onPress} style={style}>
      <ScrollTopChevronIcon width={rs(18)} height={rs(18)} color="#0D0D0D" />
    </Pressable>
  );
}
