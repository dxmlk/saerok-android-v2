import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export type SaerokDetailHeaderProps = {
  collectionId: number;
  birdId: number | null;
  isMine: boolean;
};

export default function SaerokDetailHeader({
  collectionId,
  birdId,
  isMine,
}: SaerokDetailHeaderProps) {
  const router = useRouter();

  const onBack = () => router.back();

  const onEdit = () => {
    router.push(`/saerok/write/${collectionId}`);
  };

  const onGoDex = () => {
    if (!birdId) {
      Alert.alert("안내", "이름 모를 새는 도감 이동이 불가능합니다.");
      return;
    }
    router.push({
      pathname: "/(tabs)/dex/[birdId]" as any,
      params: { birdId: String(birdId) },
    });
  };

  const onReport = () => {
    Alert.alert(
      "신고",
      "게시물을 신고하시겠어요?\n가이드에 따라 검토 후 처리됩니다.",
      [
        { text: "돌아가기", style: "cancel" },
        { text: "신고하기", style: "destructive" },
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} style={styles.circleBtn}>
        <Text style={styles.btnText}>‹</Text>
      </Pressable>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {/* 필요하면 도감 버튼 켜세요 */}
        {/* <Pressable onPress={onGoDex} style={[styles.circleBtn, { backgroundColor: "#2563eb" }]}>
          <Text style={[styles.btnText, { color: "#fff" }]}>D</Text>
        </Pressable> */}

        {isMine ? (
          <Pressable onPress={onEdit} style={styles.circleBtn}>
            <Text style={styles.btnText}>✎</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onReport} style={styles.circleBtn}>
            <Text style={styles.btnText}>⋯</Text>
          </Pressable>
        )}
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
