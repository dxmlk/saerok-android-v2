import React from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";

type Props = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

export default function ToggleRow({ label, value, onToggle }: Props) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, value]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D0D3D4", "#9DB7F5"],
  });

  const thumbTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, rs(25)],
  });

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <Pressable onPress={onToggle} style={styles.togglePress} hitSlop={8}>
        <Animated.View style={[styles.toggleTrack, { backgroundColor: trackColor }]}>
          <Animated.View
            style={[styles.thumb, { transform: [{ translateX: thumbTranslateX }] }]}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    paddingVertical: rs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    flex: 1,
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  togglePress: {
    width: rs(55),
    height: rs(30),
    borderRadius: rs(15),
  },
  toggleTrack: {
    width: rs(55),
    height: rs(30),
    borderRadius: rs(15),
    justifyContent: "center",
  },
  thumb: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(14),
    backgroundColor: "#F2F2F2",
    marginLeft: rs(2.5),
  },
});
