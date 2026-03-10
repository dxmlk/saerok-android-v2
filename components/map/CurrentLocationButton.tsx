import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { rs } from "@/theme";

type Props = {
  onPress: () => void;
  bottom?: number;
};

export default function CurrentLocationButton({ onPress, bottom = rs(120) }: Props) {
  return (
    <View style={[styles.wrap, { bottom }]}>
      <Pressable onPress={onPress} style={styles.btn}>
        <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10.5" stroke="#0D0D0D" strokeWidth={2} />
          <Circle
            cx="12.1436"
            cy="12.0001"
            r="1"
            fill="#0D0D0D"
            stroke="#0D0D0D"
            strokeWidth={1.84585}
          />
          <Path d="M22.2745 12L18.1582 12" stroke="#0D0D0D" strokeWidth={2} strokeLinecap="round" />
          <Path d="M6.13189 12L2.01562 12" stroke="#0D0D0D" strokeWidth={2} strokeLinecap="round" />
          <Path d="M12.1445 1.87104L12.1445 5.9873" stroke="#0D0D0D" strokeWidth={2} strokeLinecap="round" />
          <Path d="M12.1445 18.0126L12.1445 22.1289" stroke="#0D0D0D" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: rs(24),
  },
  btn: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(21),
    backgroundColor: "#FEFEFE",
    borderWidth: rs(0.35),
    borderColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
});
