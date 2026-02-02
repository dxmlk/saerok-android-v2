import { CollectionItem, fetchMyCollections } from "@/services/api/collections";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SaerokList({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchMyCollections();
        setItems(res);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  if (loading) {
    return (
      <View style={{ paddingVertical: 24 }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>아직 발견한 새가 없어요!</Text>
        <Text style={styles.emptySub}>
          오른쪽 + 버튼을 눌러 탐조 기록을 시작해보세요.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => String(it.collectionId)}
      numColumns={2}
      columnWrapperStyle={{ gap: 10, marginBottom: 12 }}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/saerok/[collectionId]",
              params: { collectionId: String(item.collectionId) },
            })
          }
        >
          <Image source={{ uri: item.imageUrl ?? "" }} style={styles.img} />
          <Text numberOfLines={1} style={styles.caption}>
            {item.koreanName ?? "이름 모를 새"}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: "#fff",
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  emptySub: { marginTop: 6, color: "#6B7280" },

  card: { flex: 1 },
  img: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  caption: { marginTop: 8, fontSize: 12, color: "#111827" },
});
