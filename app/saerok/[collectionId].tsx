import SaerokDetailHeader from "@/components/saerok/SaerokDetailHeader";
import SaerokInfo from "@/components/saerok/SaerokInfo";
import {
  CollectionDetail,
  fetchCollectionDetail,
} from "@/services/api/collections";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function SaerokDetailScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const idNum = Number(collectionId);

  const [item, setItem] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchCollectionDetail(idNum);
        setItem(res);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [idNum]);

  if (loading || !item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  // isMine 판별은 RN auth 붙이면 여기서 하면 됩니다.
  const isMine = false;

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
      <SaerokDetailHeader
        collectionId={item.collectionId}
        birdId={item.bird.birdId}
        isMine={isMine}
      />
      <SaerokInfo item={item} isMine={isMine} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
