import React, { useMemo } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import ScrapIcon from "@/assets/icon/icon/ScrapIcon";
import SearchIcon from "@/assets/icon/icon/SearchIcon";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";

type Props = {
  birdCount: number;
  onPressBookmark?: () => void;
  onPressSearch?: () => void;
  bookmarkActive?: boolean;

  scrollY: Animated.Value;
  height?: number;
};

export default function DexMainHeader({
  birdCount,
  onPressBookmark,
  onPressSearch,
  bookmarkActive = false,
  scrollY,
  height = rs(276),
}: Props) {
  const shownCount = useMemo(() => {
    return bookmarkActive ? birdCount : 585;
  }, [bookmarkActive, birdCount]);

  const headerOpacity = useMemo(() => {
    return scrollY.interpolate({
      inputRange: [0, height * 0.7, height],
      outputRange: [1, 0.35, 0],
      extrapolate: "clamp",
    });
  }, [scrollY, height]);

  const translateY = useMemo(() => {
    return scrollY.interpolate({
      inputRange: [0, height],
      outputRange: [0, -18],
      extrapolate: "clamp",
    });
  }, [scrollY, height]);

  const activeColor = "#F7BE65";

  return (
    <Animated.View
      style={[
        styles.hero,
        { height },
        { opacity: headerOpacity, transform: [{ translateY }] },
      ]}
    >
      <View pointerEvents="none" style={styles.bgWrap}>
        <LinearGradient
          colors={["#CDDDF3", "#F3F3F3"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.overlay} />
      </View>

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.topRow}>
          <Text style={styles.title}>도감</Text>

          <View style={styles.iconRow}>
            <Pressable
              onPress={onPressBookmark}
              hitSlop={rs(8)}
              style={styles.iconBtn}
            >
              <View style={styles.iconCircle}>
                <ScrapIcon
                  width={rs(24)}
                  height={rs(24)}
                  stroke={bookmarkActive ? activeColor : "#0D0D0D"}
                  fill={bookmarkActive ? activeColor : "none"}
                  strokeWidth={2}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={onPressSearch}
              hitSlop={rs(8)}
              style={styles.iconBtn}
            >
              <SearchIcon />
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Text style={styles.count}>{shownCount}</Text>
          <Text style={styles.desc}>종의 새가 도감에 준비되어 있어요</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    backgroundColor: "#F2F2F2",
    overflow: "hidden",
  },
  bgWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(242,242,242,0.35)",
  },

  safe: {
    flex: 1,
    paddingHorizontal: rs(24),
  },

  topRow: {
    marginTop: rs(40),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: font.haru,
    fontSize: rfs(30),
    fontWeight: "400",
    color: "#0D0D0D",
    lineHeight: rfs(33),
  },

  iconRow: {
    flexDirection: "row",
    gap: rs(7),
    alignItems: "center",
  },
  iconBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },

  bottomArea: {
    position: "absolute",
    left: rs(24),
    bottom: rs(27),
  },
  count: {
    fontSize: rfs(36),
    fontWeight: "800",
    color: "#2563EB",
  },
  desc: {
    marginTop: rs(2),
    color: "#111111",
    fontSize: rfs(14),
    fontWeight: "400",
  },
  iconCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "rgba(254,254,254,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
