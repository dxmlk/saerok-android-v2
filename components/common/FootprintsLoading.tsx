import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import FootPrintIcon from "@/assets/icon/common/FootPrintIcon";
import { rs } from "@/theme";

type Props = {
  style?: StyleProp<ViewStyle>;
  scale?: number;
  color?: string;
};

const FOOTPRINTS = [
  { left: 0, bottom: 0, rotate: 0, opacity: 1.0 },
  { left: 49, bottom: 75.99, rotate: 33.12, opacity: 0.7 },
  { left: 150, bottom: 88.14, rotate: 22.07, opacity: 0.6 },
  { left: 132, bottom: 190.7, rotate: 10.56, opacity: 0.4 },
  { left: 231, bottom: 205.91, rotate: -20.97, opacity: 0.4 },
  { left: 215, bottom: 309.73, rotate: 22.07, opacity: 0.25 },
];

const BASE_W = 315.04;
const BASE_H = 390.59;
const INTERVAL = 220;
const LOOP_DELAY = 500;
const FADE_MS = 180;

export default function FootprintsLoading({
  style,
  scale = 0.08,
  color = "#91BFFF",
}: Props) {
  const opacities = useRef(FOOTPRINTS.map(() => new Animated.Value(0))).current;

  const size = useMemo(
    () => ({
      width: BASE_W * scale,
      height: BASE_H * scale,
      footprintW: 68 * scale,
      footprintH: 60 * scale,
    }),
    [scale],
  );

  useEffect(() => {
    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = () => {
      opacities.forEach((v) => v.setValue(0));

      FOOTPRINTS.forEach((f, idx) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          Animated.timing(opacities[idx], {
            toValue: f.opacity,
            duration: FADE_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        }, INTERVAL * idx);
        timers.push(t);
      });

      timers.push(
        setTimeout(
          () => {
            if (!cancelled) schedule();
          },
          INTERVAL * FOOTPRINTS.length + LOOP_DELAY,
        ),
      );
    };

    schedule();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [opacities]);

  return (
    <View style={[styles.wrap, { width: size.width, height: size.height }, style]}>
      {FOOTPRINTS.map((f, idx) => (
        <Animated.View
          key={idx}
          style={{
            position: "absolute",
            left: f.left * scale,
            bottom: f.bottom * scale,
            opacity: opacities[idx],
            transform: [{ rotate: `${f.rotate}deg` }],
          }}
        >
          <FootPrintIcon width={size.footprintW} height={size.footprintH} color={color} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
