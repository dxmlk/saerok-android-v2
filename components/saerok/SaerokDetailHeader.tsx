import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { rfs, rs } from "@/theme";
import BackButtonIcon from "@/assets/icon/button/BackButtonIcon";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SaerokDetailHeaderProps = {
  birdId: number | null;
  collectionId: number;
  isMine: boolean;
  user?: {
    userId?: number;
    nickname?: string | null;
    thumbnailProfileImageUrl?: string | null;
  } | null;
};

export default function SaerokDetailHeader({
  birdId,
  collectionId,
  isMine,
  user,
}: SaerokDetailHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onBack = () => router.back();
  const onProfile = () => {
    if (!user?.userId) return;
    router.push({
      pathname: "/profile/[userId]" as any,
      params: { userId: String(user.userId) },
    });
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + rs(3) }]}>
      <Pressable onPress={onBack} style={styles.circleBtn} hitSlop={rs(10)}>
        <BlurView intensity={8} tint="light" style={styles.circleBlur} />
        <BackButtonIcon size={rs(40)} withBackground={false} />
      </Pressable>

      <View style={styles.rightWrap}>
        <Pressable
          onPress={onProfile}
          style={styles.profileBtn}
          hitSlop={rs(10)}
          disabled={!user?.userId}
        >
          <BlurView intensity={8} tint="light" style={styles.profileBlur} />
          {user?.thumbnailProfileImageUrl ? (
            <Image
              source={{ uri: user.thumbnailProfileImageUrl }}
              style={styles.profileImg}
            />
          ) : (
            <View style={styles.profileFallback} />
          )}
          <Text numberOfLines={1} style={styles.profileName}>
            {user?.nickname ?? ""}
          </Text>
        </Pressable>
      </View>
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
  rightWrap: {
    flexDirection: "row",
  },
  profileBtn: {
    height: rs(40),
    borderRadius: rs(20),
    paddingLeft: rs(10),
    paddingRight: rs(17),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(7),
    overflow: "hidden",
  },
  profileBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: rs(20),
    backgroundColor: "rgba(254, 254, 254, 0.6)",
  },
  profileImg: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#D1D5DB",
  },
  profileFallback: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#D1D5DB",
  },
  profileName: {
    fontSize: rfs(15),
    lineHeight: rfs(20),
    color: "#0D0D0D",
    maxWidth: rs(110),
  },
});
