import SaerokDetailHeader from "@/components/saerok/SaerokDetailHeader";
import SaerokInfo from "@/components/saerok/SaerokInfo";
import {
  CollectionDetail,
  fetchCollectionDetail,
} from "@/services/api/collections";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

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
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [idNum, router]);

  if (!item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const isMine =
    !!user && item.user?.nickname && item.user.nickname === user.nickname;

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
      <SaerokDetailHeader
        birdId={item.bird?.birdId ?? null}
        collectionId={item.collectionId}
        isMine={isMine}
      />
      {loading || authLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <SaerokInfo
          collectionId={item.collectionId}
          img={item.imageUrl ?? null}
          date={item.discoveredDate}
          address={item.address}
          locationAlias={item.locationAlias}
          note={item.note}
          birdInfo={{
            birdId: item.bird?.birdId ?? null,
            koreanName: item.bird?.koreanName ?? null,
            scientificName: item.bird?.scientificName ?? null,
          }}
          user={{
            userId: item.user?.userId,
            nickname: item.user?.nickname,
          }}
          isMine={isMine}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
