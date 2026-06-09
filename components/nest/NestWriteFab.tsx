import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddSaerokDexIcon from "@/assets/icon/button/AddSaerokDexIcon";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import NestFabPencilIcon from "@/assets/icon/nest/NestFabPencilIcon";
import NestFabPlusIcon from "@/assets/icon/nest/NestFabPlusIcon";
import { rs } from "@/theme/scale";

const FLOATING_TAB_BAR_HEIGHT = rs(60);
const FAB_SIZE = rs(62);
const LEFT_BUTTON_GAP_X = 18;
const LEFT_BUTTON_OFFSET_Y = -10;
const TOP_BUTTON_OFFSET_X = -10;
const TOP_BUTTON_GAP_Y = 18;
const FAB_ANIMATION_DURATION = 180;

export default function NestWriteFab() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const bottomOffset =
    Math.max(insets.bottom, rs(12)) + FLOATING_TAB_BAR_HEIGHT + rs(17);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: FAB_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  const rotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });
  const leftTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(FAB_SIZE + LEFT_BUTTON_GAP_X)],
  });
  const leftTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LEFT_BUTTON_OFFSET_Y],
  });
  const topTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TOP_BUTTON_OFFSET_X],
  });
  const topTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(FAB_SIZE + TOP_BUTTON_GAP_Y)],
  });
  const secondaryScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const secondaryOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const close = () => setOpen(false);

  const openFreeBoardComposer = () => {
    const composeKey = String(Date.now());
    setOpen(false);

    if (pathname === "/nest/freeboard") {
      setTimeout(() => {
        router.setParams({
          compose: "1",
          composeKey,
        });
      }, FAB_ANIMATION_DURATION + 20);
      return;
    }

    setTimeout(() => {
      router.push({
        pathname: "/nest/freeboard",
        params: {
          compose: "1",
          composeKey,
        },
      });
    }, FAB_ANIMATION_DURATION + 20);
  };

  return (
    <>
      {open ? (
        <Pressable style={styles.dim} onPress={close}>
          <View />
        </Pressable>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.anchor, { right: rs(23), bottom: bottomOffset }]}
      >
        <Animated.View
          pointerEvents={open ? "auto" : "none"}
          style={[
            styles.secondaryFab,
            {
              opacity: secondaryOpacity,
              transform: [
                { translateX: leftTranslateX },
                { translateY: leftTranslateY },
                { scale: secondaryScale },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={({ pressed }) => [
              styles.secondaryFabButton,
              !pressed && sharedShadow,
            ]}
            onPress={openFreeBoardComposer}
          >
            <NestFabPencilIcon width={rs(36)} height={rs(36)} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          pointerEvents={open ? "auto" : "none"}
          style={[
            styles.secondaryFab,
            {
              opacity: secondaryOpacity,
              transform: [
                { translateX: topTranslateX },
                { translateY: topTranslateY },
                { scale: secondaryScale },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={({ pressed }) => [
              styles.secondaryFabButton,
              !pressed && sharedShadow,
            ]}
            onPress={() => {
              setOpen(false);
              setTimeout(() => {
                router.push("/saerok/write");
              }, FAB_ANIMATION_DURATION + 20);
            }}
          >
            <AddSaerokDexIcon width={rs(36)} height={rs(36)} color="#4190FF" />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={({ pressed }) => [
            styles.primaryFab,
            !pressed && sharedShadow,
          ]}
          onPress={() => setOpen((prev) => !prev)}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <NestFabPlusIcon width={rs(40)} height={rs(40)} color="#FEFEFE" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const sharedShadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.25,
  shadowRadius: rs(10),
  shadowOffset: { width: 0, height: 0 },
  elevation: 10,
} as const;

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 18,
  },
  anchor: {
    position: "absolute",
    width: rs(180),
    height: rs(180),
    zIndex: 20,
  },
  primaryFab: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: rs(62),
    height: FAB_SIZE,
    borderRadius: rs(100),
    backgroundColor: "#4190FF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryFab: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
  secondaryFabButton: {
    width: "100%",
    height: "100%",
    borderRadius: rs(100),
    backgroundColor: "#FEFEFE",
    alignItems: "center",
    justifyContent: "center",
  },
});
