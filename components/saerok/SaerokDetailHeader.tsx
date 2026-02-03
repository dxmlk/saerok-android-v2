import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export type SaerokDetailHeaderProps = {
  collectionId: number;
  birdId: number | null;
  birdName?: string | null;
  isMine: boolean;
};

export default function SaerokDetailHeader({
  collectionId,
  birdId,
  isMine,
}: SaerokDetailHeaderProps) {
  const router = useRouter();

  const onBack = () => router.back();

  const goEdit = () => {
    router.push(`/saerok/write/${collectionId}`);
  };

  const onReport = () => {
    Alert.alert(
      "신고",
      "게시물을 신고하시겠어요?\n가이드에 따라 검토 후 처리됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "신고하기",
          style: "destructive",
          onPress: () => {
            // TODO: 신고 API 연결 시 여기서 호출
          },
        },
      ],
    );
  };

  const onMore = () => {
    if (isMine) {
      Alert.alert("내 새록", "원하시는 작업을 선택하세요.", [
        { text: "취소", style: "cancel" },
        { text: "편집하기", onPress: goEdit },
        // 필요하면 삭제도 여기 추가
        // { text: "삭제하기", style: "destructive", onPress: onDelete },
      ]);
      return;
    }

    Alert.alert("게시물", "원하시는 작업을 선택하세요.", [
      { text: "취소", style: "cancel" },
      { text: "신고하기", style: "destructive", onPress: onReport },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} style={styles.circleBtn}>
        <Text style={styles.btnText}>‹</Text>
      </Pressable>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={onMore} style={styles.circleBtn}>
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
    height: 76,
    paddingTop: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
});
