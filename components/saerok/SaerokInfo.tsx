import type { CollectionDetail } from "@/services/api/collections";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type SaerokInfoProps = {
  item: CollectionDetail;
  isMine: boolean;
};

function formatDate(dateString: string) {
  if (!dateString) return "";
  const [y, m, d] = dateString.split("-");
  return `${y}년 ${m}월 ${d}일`;
}

export default function SaerokInfo({ item, isMine }: SaerokInfoProps) {
  const router = useRouter();

  const birdName = item.bird?.koreanName ?? "이름 모를 새";
  const sciName = item.bird?.scientificName ?? "";
  const dateText = useMemo(
    () => formatDate(item.discoveredDate),
    [item.discoveredDate],
  );

  const onGoDex = () => {
    if (!item.bird?.birdId) return;
    router.push({
      pathname: "/(tabs)/dex/[birdId]" as any,
      params: { birdId: String(item.bird.birdId) },
    });
  };

  const onEdit = () => {
    router.push(`/saerok/write/${item.collectionId}`);
  };

  return (
    <View style={styles.container}>
      {/* 상단 이미지 */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.heroImg} />
      ) : (
        <View style={[styles.heroImg, { backgroundColor: "#E5E7EB" }]} />
      )}

      {/* 카드 */}
      <View style={styles.cardWrap}>
        <View style={styles.titleRow}>
          <Text style={styles.birdTitle}>{birdName}</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* 도감 버튼(원하면) */}
            {/* <Pressable onPress={onGoDex} style={[styles.circleBtn, { backgroundColor: "#2563eb" }]}>
              <Text style={[styles.circleBtnText, { color: "#fff" }]}>D</Text>
            </Pressable> */}

            {isMine ? (
              <Pressable onPress={onEdit} style={styles.circleBtn}>
                <Text style={styles.circleBtnText}>✎</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {sciName ? <Text style={styles.sciName}>{sciName}</Text> : null}

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>장소</Text>
          <Text style={styles.infoValue}>{item.locationAlias}</Text>
          <Text style={styles.infoSub}>{item.address}</Text>

          <View style={{ height: 10 }} />

          <Text style={styles.infoLabel}>날짜</Text>
          <Text style={styles.infoValue}>{dateText}</Text>

          <View style={{ height: 10 }} />

          <Text style={styles.infoLabel}>작성자</Text>
          <Text style={styles.infoValue}>
            {item.user?.nickname ?? "알 수 없음"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  heroImg: { width: "100%", height: 320 },

  cardWrap: {
    marginTop: -18,
    paddingHorizontal: 16,
  },

  titleRow: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  birdTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  sciName: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingBottom: 12,
    color: "#6B7280",
  },

  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  circleBtnText: { fontSize: 18, fontWeight: "900", color: "#111827" },

  noteBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  noteText: { color: "#111827", fontSize: 14, lineHeight: 20 },

  infoBox: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoLabel: { color: "#6B7280", fontWeight: "800", marginBottom: 4 },
  infoValue: { color: "#111827", fontWeight: "800" },
  infoSub: { color: "#6B7280", marginTop: 2 },
});
