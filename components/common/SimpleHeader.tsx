import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";

import BackButtonIcon from "@/assets/icon/button/BackButtonIcon";
import OptionButtonIcon from "@/assets/icon/button/OptionButtonIcon";

type Props = {
  title: string;
  onPressBack: () => void;
  onPressOption?: () => void;
};

export default function SimpleHeader({
  title,
  onPressBack,
  onPressOption,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onPressBack} hitSlop={rs(10)} style={styles.left}>
        <BackButtonIcon />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <Pressable onPress={onPressOption} hitSlop={rs(10)} style={styles.right}>
        {onPressOption ? <OptionButtonIcon /> : <View style={{ width: rs(40) }} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    paddingHorizontal: rs(24),
    width: "100%",
    height: rs(84),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  left: {
    position: "absolute",
    left: rs(24),
    bottom: rs(22),
  },
  right: {
    position: "absolute",
    right: rs(24),
    bottom: rs(22),
  },
  title: {
    fontFamily: font.haru,
    fontSize: rfs(18),
    fontWeight: "400",
    color: "#0D0D0D",
    lineHeight: rfs(20),
  },
});
