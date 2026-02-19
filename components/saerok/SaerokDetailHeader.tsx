import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { rfs, rs } from "@/theme";

export type SaerokDetailHeaderProps = {
  birdId: number | null;
  collectionId: number;
  isMine: boolean;
};

export default function SaerokDetailHeader({
  birdId,
  collectionId,
  isMine,
}: SaerokDetailHeaderProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onBack = () => router.back();

  const goDex = () => {
    if (!birdId) return;
    router.push({
      pathname: "/(tabs)/dex/[birdId]" as any,
      params: { birdId: String(birdId) },
    });
  };

  const goEdit = () => {
    router.push(`/saerok/write/${collectionId}`);
  };

  const onReportConfirm = () => {
    Alert.alert(
      "신고",
      "게시물을 신고하시겠어요?\n커뮤니티 가이드에 따라 신고 사유에 해당하는지 검토 후 처리돼요.",
      [
        { text: "돌아가기", style: "cancel" },
        {
          text: "신고하기",
          style: "destructive",
          onPress: async () => {
            if (busy) return;
            setBusy(true);
            try {
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const onMore = () => {
    if (isMine) {
      Alert.alert("내 새록", "원하시는 작업을 선택하세요.", [
        { text: "취소", style: "cancel" },
        { text: "도감 보기", onPress: goDex },
        { text: "편집하기", onPress: goEdit },
      ]);
      return;
    }

    Alert.alert("게시물", "원하시는 작업을 선택하세요.", [
      { text: "취소", style: "cancel" },
      { text: "도감 보기", onPress: goDex },
      { text: "신고하기", style: "destructive", onPress: onReportConfirm },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} style={styles.circleBtn} hitSlop={rs(10)}>
        <Text style={styles.btnText}>←</Text>
      </Pressable>

      <View style={{ flexDirection: "row", gap: rs(9) }}>
        <Pressable onPress={onMore} style={styles.circleBtn} hitSlop={rs(10)}>
          <Text style={styles.btnText}>⋯</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: rs(24),
    paddingTop: rs(10),
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
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: rfs(20),
    fontWeight: "900",
    color: "#111827",
    lineHeight: rfs(22),
  },
});
