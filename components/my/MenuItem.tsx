import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import { rfs, rs } from "@/theme";

type Props = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  labelColor?: string;
  rightText?: string;
  onPress: () => void;
};

export default function MenuItem({
  icon,
  label,
  isActive,
  disabled = false,
  labelColor = "#111111",
  rightText,
  onPress,
}: Props) {
  const blocked = disabled || !isActive;

  return (
    <Pressable
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      style={[styles.rowPressable, blocked && styles.wrapDisabled]}
    >
      <View style={styles.wrap}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>

      {rightText ? (
        <Text style={[styles.rightText, blocked && styles.rightTextDisabled]}>
          {rightText}
        </Text>
      ) : (
        <InfoChevronIcon
          width={rs(17)}
          height={rs(17)}
          color={blocked ? "#D1D5DB" : "#979797"}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowPressable: {
    width: "100%",
    minHeight: rs(40),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
  rightText: {
    color: "#979797",
    textAlign: "center",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  rightTextDisabled: {
    color: "#D1D5DB",
  },
});
