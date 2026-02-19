import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { rfs, rs } from "@/theme";

type Props = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  labelColor?: string;
  onPress: () => void;
};

export default function MenuItem({
  icon,
  label,
  isActive,
  disabled = false,
  labelColor = "#111111",
  onPress,
}: Props) {
  const blocked = disabled || !isActive;

  return (
    <Pressable
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      style={[styles.wrap, blocked && styles.wrapDisabled]}
    >
      <View style={styles.iconBox}>{icon}</View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: rs(30.5),
    height: rs(40),
    paddingHorizontal: rs(15),
    gap: rs(8),
    alignSelf: "flex-start",
  },
  wrapDisabled: {
    opacity: 0.6,
  },
  iconBox: {
    width: rs(24),
    height: rs(24),
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: rfs(14),
  },
});
