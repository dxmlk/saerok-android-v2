import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { rfs, rs } from "@/theme";
import BackButtonIcon from "@/assets/icon/button/BackButtonIcon";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TouchableOpacity from "@/components/common/TouchableOpacity";

export type SaerokDetailHeaderProps = {
  birdId: number | null;
  collectionId: number;
  isMine: boolean;
  user?: {
    userId?: number;
    nickname?: string | null;
    thumbnailProfileImageUrl?: string | null;
  } | null;
  returnTo?: string | null;
  returnCollectionId?: string | null;
  returnLat?: string | null;
  returnLng?: string | null;
};

export default function SaerokDetailHeader({
  birdId,
  collectionId,
  isMine,
  user,
  returnTo,
  returnCollectionId,
  returnLat,
  returnLng,
}: SaerokDetailHeaderProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const insets = useSafeAreaInsets();

  const onBack = () => {
    const origin = params?.from;

    // If there's an explicit returnTo, use it (priority)
    if (returnTo) {
      const paramsObj: any = {};
      if (returnTo === "/map" && returnLat && returnLng) {
        paramsObj.lat = returnLat;
        paramsObj.lng = returnLng;
      } else if (returnCollectionId) {
        paramsObj.collectionId = returnCollectionId;
      }
      router.replace({ pathname: returnTo as any, params: paramsObj } as any);
      return;
    }

    // Otherwise use origin-based navigation for backward compatibility
    if (origin === "dex" || origin?.startsWith("dex")) {
      router.replace({ pathname: "(tabs)/dex" as any });
      return;
    }
    if (origin === "nest" || origin?.startsWith("nest")) {
      router.replace({ pathname: "(tabs)/nest" as any });
      return;
    }
    if (origin === "notifications") {
      router.push({ pathname: "/saerok/notifications" as any });
      return;
    }
    if (origin === "map_search") {
      router.replace({ pathname: "(tabs)/map" as any });
      return;
    }

    // Default: go back if possible, or replace to saerok tab
    router.back();
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + rs(3) }]}>
      <TouchableOpacity onPress={onBack} style={styles.circleBtn} hitSlop={rs(10)}>
        <BlurView intensity={8} tint="light" style={styles.circleBlur} />
        <BackButtonIcon size={rs(40)} withBackground={false} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 27,
    left: 0,
    right: 0,
    paddingHorizontal: rs(24),
    paddingBottom: rs(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
    backgroundColor: "transparent",
  },
  circleBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  circleBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: rs(20),
    backgroundColor: "rgba(254, 254, 254, 0.6)",
  },
});
