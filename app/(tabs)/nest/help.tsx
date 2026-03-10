import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import SimpleHeader from "@/components/common/SimpleHeader";
import CommunityCollectionRow, {
  communityCollectionRowStyles,
} from "@/components/nest/CommunityCollectionRow";
import NestWriteFab from "@/components/nest/NestWriteFab";
import { CommunityCollectionSummary, fetchCommunityPendingBirdIdApi } from "@/services/api/community";
import { rfs, rs } from "@/theme/scale";

export default function NestHelpScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CommunityCollectionSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCommunityPendingBirdIdApi();
        if (mounted) setItems(res.items ?? []);
      } catch (e) {
        console.log("[NestHelpScreen] ERROR", e);
        if (mounted) setError("목록을 불러오지 못했어요.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.headerWrap}>
        <SimpleHeader title="이 새 이름이 뭔가요?" circleBackButton />
      </View>
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#91BFFF" />
            </View>
          ) : (
            <View style={communityCollectionRowStyles.card}>
              {items.map((item, idx) => (
                <View key={item.collectionId}>
                  <CommunityCollectionRow
                    item={item}
                    variant="pending"
                    onPress={() => router.push(`/saerok/${item.collectionId}`)}
                  />
                  {idx < items.length - 1 ? (
                    <View style={communityCollectionRowStyles.divider} />
                  ) : null}
                </View>
              ))}
              {!items.length ? (
                <Text style={communityCollectionRowStyles.placeholder}>
                  동정 요청이 없어요.
                </Text>
              ) : null}
            </View>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={{ height: rs(90) }} />
        </ScrollView>
        <NestWriteFab />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
  },
  body: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingBottom: rs(12) },
  loadingWrap: { paddingVertical: rs(24), alignItems: "center" },
  errorText: {
    marginTop: rs(10),
    marginHorizontal: rs(16),
    color: "#D90000",
    fontSize: rfs(13),
  },
});

