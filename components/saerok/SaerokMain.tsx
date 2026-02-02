import { fetchMyCollections } from "@/services/api/collections";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SAEROK_MESSAGES = [
  "오늘 만난 새를 기록해볼까요?",
  "새록에 담긴 순간들이 쌓이고 있어요.",
  "한 줄 평으로 기억을 남겨보세요.",
];

export default function SaerokMain({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const router = useRouter();
  const [birdCount, setBirdCount] = useState(0);

  const randomMessage = useMemo(() => {
    const idx = Math.floor(Math.random() * SAEROK_MESSAGES.length);
    return SAEROK_MESSAGES[idx];
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const items = await fetchMyCollections();
        setBirdCount(items.length);
      } catch {
        setBirdCount(0);
      }
    })();
  }, [refreshKey]);

  return (
    <View style={styles.hero}>
      <Text style={styles.msg}>{randomMessage}</Text>

      <View style={styles.countRow}>
        <Text style={styles.count}>{birdCount}</Text>

        <Text style={styles.countSub}>종의 새가 새록에 담겨있어요</Text>
      </View>

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/saerok/write")}
      >
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>
          ＋
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 384,
    backgroundColor: "#F2F2F2",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 24,
    overflow: "hidden",
  },
  msg: { fontSize: 22, fontWeight: "900", color: "#111827", lineHeight: 28 },
  countRow: { position: "absolute", left: 16, bottom: 18 },
  count: { fontSize: 44, fontWeight: "900", color: "#4190FF" },
  countSub: { marginTop: 6, color: "#111827" },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
});
