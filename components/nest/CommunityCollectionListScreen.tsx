import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import SimpleHeader from "@/components/common/SimpleHeader";
import CommunityCollectionRow, {
  communityCollectionRowStyles,
} from "@/components/nest/CommunityCollectionRow";
import NestWriteFab from "@/components/nest/NestWriteFab";
import { openSaerokDetail } from "@/lib/navigation";
import type {
  CommunityCollectionSummary,
  CommunityListResponse,
} from "@/services/api/community";
import { rfs, rs } from "@/theme/scale";

const PAGE_SIZE = 20;

type Props = {
  emptyText: string;
  fetchPage: (paging: {
    page: number;
    size: number;
  }) => Promise<CommunityListResponse>;
  from: string;
  title: string;
  variant: "recent" | "popular" | "pending";
};

export default function CommunityCollectionListScreen({
  emptyText,
  fetchPage,
  from,
  title,
  variant,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<CommunityCollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const itemsRef = useRef<CommunityCollectionSummary[]>([]);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);

  const loadPage = useCallback(
    async (page: number, mode: "reset" | "append") => {
      if (mode === "append") {
        if (loadingRef.current || loadingMoreRef.current || !hasMoreRef.current) {
          return;
        }
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        loadingRef.current = true;
        setLoading(true);
        hasMoreRef.current = true;
        setHasMore(true);
      }

      try {
        setError(null);
        const res = await fetchPage({ page, size: PAGE_SIZE });
        const nextItems = res.items ?? [];

        const previousItems = mode === "append" ? itemsRef.current : [];
        const seen = new Set(previousItems.map((item) => item.collectionId));
        const uniqueNext =
          mode === "append"
            ? nextItems.filter((item) => !seen.has(item.collectionId))
            : nextItems;
        const mergedItems =
          mode === "append" ? [...previousItems, ...uniqueNext] : uniqueNext;

        itemsRef.current = mergedItems;
        setItems(mergedItems);
        pageRef.current = page;
        const nextHasMore =
          nextItems.length >= PAGE_SIZE && uniqueNext.length > 0;
        hasMoreRef.current = nextHasMore;
        setHasMore(nextHasMore);
      } catch (e) {
        console.log("[CommunityCollectionListScreen] ERROR", e);
        setError("목록을 불러오지 못했어요.");
      } finally {
        if (mode === "append") {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    void loadPage(1, "reset");
  }, [loadPage]);

  const handleEndReached = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    void loadPage(pageRef.current + 1, "append");
  }, [hasMore, loadPage, loading, loadingMore]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.headerWrap}>
        <SimpleHeader title={title} circleBackButton />
      </View>
      <View style={styles.body}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#4190FF" />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.collectionId)}
            contentContainerStyle={styles.content}
            ItemSeparatorComponent={() => (
              <View style={communityCollectionRowStyles.divider} />
            )}
            renderItem={({ item }) => (
              <CommunityCollectionRow
                item={item}
                variant={variant}
                onPress={() =>
                  openSaerokDetail(router, item.collectionId, { from })
                }
              />
            )}
            ListEmptyComponent={
              <Text style={communityCollectionRowStyles.placeholder}>
                {emptyText}
              </Text>
            }
            ListFooterComponent={
              <>
                {loadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator color="#4190FF" />
                  </View>
                ) : null}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={{ height: rs(90) }} />
              </>
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  content: {
    paddingBottom: rs(12),
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerLoading: {
    paddingVertical: rs(16),
    alignItems: "center",
  },
  errorText: {
    marginTop: rs(10),
    marginHorizontal: rs(16),
    color: "#D90000",
    fontSize: rfs(13),
  },
});
