import SaerokDetailHeader from "@/components/saerok/SaerokDetailHeader";
import SaerokInfo from "@/components/saerok/SaerokInfo";
import {
  CollectionDetail,
  fetchCollectionDetail,
} from "@/services/api/collections";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Alert } from "react-native";

export default function SaerokDetailScreen() {
  const router = useRouter();
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const idNum = Number(collectionId);

  const { user, loading: authLoading } = useAuth();

  const [item, setItem] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      Alert.alert("오류", "잘못된 접근입니다.");
      router.back();
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetchCollectionDetail(idNum);
        setItem(res);
      } catch (e) {
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [idNum, router]);

  if (loading || !item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const isMine =
    !!user &&
    typeof item.user.nickname === "string" &&
    item.user.nickname === user.nickname;

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
      <SaerokDetailHeader
        collectionId={item.collectionId}
        birdId={item.bird?.birdId ?? null}
        birdName={item.bird?.koreanName ?? null}
        isMine={isMine}
      />
      <SaerokInfo item={item} isMine={isMine} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
