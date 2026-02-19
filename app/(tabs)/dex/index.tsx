// app/(tabs)/dex/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated } from "react-native";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";

import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import DexList, { DexItem } from "@/components/dex/DexList";
import DexMainHeader from "@/components/dex/DexMainHeader";
import EmptyState from "@/components/dex/EmptyState";
import FilterHeader, { SelectedFilters } from "@/components/dex/FilterHeader";

import { toStringArray, toStringValue } from "@/lib/safeParams";
import {
  fetchBookmarkListApi,
  fetchDexDetailApi,
  fetchDexItemsApi,
  toggleBookmarkApi,
} from "@/services/api/birds";
import { rs } from "@/theme";

const seasonMap: Record<string, string> = {
  SPRING: "봄",
  SUMMER: "여름",
  AUTUMN: "가을",
  WINTER: "겨울",
};
const habitatMap: Record<string, string> = {
  MUDFLAT: "갯벌",
  FARMLAND: "경작지/들판",
  FOREST: "산림/계곡",
  MARINE: "해양",
  RESIDENTAIL: "거주지역",
  PLAINS_FOREST: "평지숲",
  RIVER_LAKE: "하천/호수",
  ARTIFICIAL: "인공시설",
  CAVE: "동굴",
  WETLAND: "습지",
  OTHERS: "기타",
};
const sizeCategoryMap: Record<string, string> = {
  참새: "xsmall",
  비둘기: "small",
  오리: "medium",
  기러기: "large",
};

const PAGE_SIZE = 20;

export default function DexIndex() {
  const router = useRouter();
  const sp = useLocalSearchParams<{
    q?: string | string[];
    seasons?: string | string[];
    habitats?: string | string[];
    sizeCategories?: string | string[];
  }>();

  const [searchTerm, setSearchTerm] = useState<string>(toStringValue(sp.q));
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    seasons: toStringArray(sp.seasons),
    habitats: toStringArray(sp.habitats),
    sizeCategories: toStringArray(sp.sizeCategories),
  });

  const [items, setItems] = useState<DexItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [bookmarkItems, setBookmarkItems] = useState<DexItem[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const listRef = useRef<FlatList<DexItem> | null>(null);
  const [showTop, setShowTop] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_H = rs(276);
  const FILTER_H = rs(36);
  const COLLAPSE_H = HEADER_H + FILTER_H;

  const translateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_H],
    outputRange: [0, -COLLAPSE_H],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_H * 0.75, HEADER_H],
    outputRange: [1, 0.35, 0],
    extrapolate: "clamp",
  });

  const filterOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_H, COLLAPSE_H],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    setSearchTerm(toStringValue(sp.q));
    setSelectedFilters({
      seasons: toStringArray(sp.seasons),
      habitats: toStringArray(sp.habitats),
      sizeCategories: toStringArray(sp.sizeCategories),
    });
    setPage(1);
    setHasMore(true);
    setItems([]);
  }, [sp.q, sp.seasons, sp.habitats, sp.sizeCategories]);

  const apiFilterParams = useMemo(() => {
    return {
      seasons: selectedFilters.seasons.map((s) => seasonMap[s]).filter(Boolean),
      habitats: selectedFilters.habitats
        .map((h) => habitatMap[h])
        .filter(Boolean),
      sizeCategories: selectedFilters.sizeCategories
        .map((c) => sizeCategoryMap[c])
        .filter(Boolean),
    };
  }, [selectedFilters]);

  const loadPage = async (nextPage: number, mode: "append" | "replace") => {
    setError(null);
    setLoading(true);
    try {
      const params: any = {
        page: nextPage,
        size: PAGE_SIZE,
        ...apiFilterParams,
      };
      if (searchTerm.trim()) params.q = searchTerm.trim();

      const res = await fetchDexItemsApi(params);
      const birds: DexItem[] = res.data?.birds ?? [];

      setItems((prev) => {
        if (mode === "replace") return birds;
        const prevIds = new Set(prev.map((x) => x.id));
        return [...prev, ...birds.filter((b) => !prevIds.has(b.id))];
      });

      setHasMore(birds.length === PAGE_SIZE);
    } catch (e: any) {
      setError(e?.message ?? "도감 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookmarkOnly) return;
    loadPage(1, "replace");
  }, [apiFilterParams, searchTerm, bookmarkOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bookmarkOnly) return;
    if (page === 1) return;
    loadPage(page, "append");
  }, [page, bookmarkOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setItems([]);
    await loadPage(1, "replace");
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (bookmarkOnly) return;
    if (loading) return;
    if (!hasMore) return;
    setPage((p) => p + 1);
  };

  const loadBookmarks = async () => {
    try {
      const res = await fetchBookmarkListApi();
      const list = res.data?.items ?? res.data ?? [];
      const ids = list.map((x: any) => (typeof x === "number" ? x : x.birdId));
      setBookmarkedIds(new Set(ids));
    } catch {}
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const toggleBookmark = async (id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      await toggleBookmarkApi(id);
    } catch {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!bookmarkOnly) return;

    (async () => {
      setBookmarkLoading(true);
      try {
        const res = await fetchBookmarkListApi();
        const list = res.data?.items ?? res.data ?? [];
        const ids: number[] = list.map((x: any) =>
          typeof x === "number" ? x : x.birdId,
        );

        const birds = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetchDexDetailApi(id);
              const b = r.data;
              const thumb =
                Array.isArray(b.imageUrls) && b.imageUrls.length > 0
                  ? b.imageUrls[0]
                  : (b.thumbImageUrl ?? "");
              return {
                id: b.id,
                koreanName: b.koreanName,
                scientificName: b.scientificName,
                thumbImageUrl: thumb,
              } as DexItem;
            } catch {
              return null;
            }
          }),
        );

        setBookmarkItems(birds.filter((x): x is DexItem => x !== null));
      } catch {
        setBookmarkItems([]);
      } finally {
        setBookmarkLoading(false);
      }
    })();
  }, [bookmarkOnly]);

  const goSearch = () => {
    router.push({
      pathname: "/dex/search",
      params: {
        q: searchTerm,
        seasons: selectedFilters.seasons,
        habitats: selectedFilters.habitats,
        sizeCategories: selectedFilters.sizeCategories,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
      <Animated.View
        style={[
          styles.stickyWrap,
          {
            transform: [{ translateY }],
          },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View style={{ opacity: headerOpacity }}>
          <DexMainHeader
            scrollY={scrollY}
            birdCount={bookmarkOnly ? bookmarkItems.length : items.length}
            onPressBookmark={() => setBookmarkOnly((v) => !v)}
            onPressSearch={goSearch}
            bookmarkActive={bookmarkOnly}
          />
        </Animated.View>

        <Animated.View style={{ opacity: filterOpacity }}>
          <FilterHeader
            selectedFilters={selectedFilters}
            onFilterChange={(group, vals) =>
              setSelectedFilters((prev) => ({ ...prev, [group]: vals }))
            }
            onResetSearch={() => {
              setSearchTerm("");
              router.setParams({ q: undefined });
            }}
          />
        </Animated.View>
      </Animated.View>

      {error && (
        <View
          style={{
            paddingHorizontal: rs(16),
            paddingBottom: rs(10),
            paddingTop: rs(8),
          }}
        >
          <Text style={{ color: "red" }}> {error}</Text>
          <Pressable
            onPress={() => loadPage(1, "replace")}
            style={{
              marginTop: rs(8),
              paddingVertical: rs(10),
              paddingHorizontal: rs(12),
              borderWidth: rs(1),
              borderRadius: rs(10),
              alignSelf: "flex-start",
            }}
          >
            <Text>다시 불러오기</Text>
          </Pressable>
        </View>
      )}

      {bookmarkOnly ? (
        bookmarkLoading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator />
            <Text style={{ marginTop: rs(10), color: "#666" }}>
              즐겨찾기 데이터를 불러오는 중입니다...
            </Text>
          </View>
        ) : bookmarkItems.length === 0 ? (
          <EmptyState
            bgColor="gray"
            topInset={COLLAPSE_H}
            upperText="스크랩한 새가 없어요!"
            lowerText="새 카드 오른쪽 위 스크랩 버튼을 눌러 스크랩해보세요."
          />
        ) : (
          <DexList
            items={bookmarkItems}
            loading={false}
            refreshing={false}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            listRef={listRef}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
                  const y = e.nativeEvent.contentOffset.y;
                  setShowTop(y > rs(700));
                },
              },
            )}
            contentTopPadding={COLLAPSE_H} //
          />
        )
      ) : items.length === 0 && !loading ? (
        <EmptyState
          bgColor="gray"
          topInset={COLLAPSE_H}
          upperText="해당하는 새가 없어요!"
          lowerText="필터를 바꾸거나 새로고침을 해보세요."
        />
      ) : (
        <DexList
          items={items}
          loading={loading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={toggleBookmark}
          listRef={listRef}
          onEndReached={onEndReached}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: true,
              listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const y = e.nativeEvent.contentOffset.y;
                setShowTop(y > rs(700));
              },
            },
          )}
          contentTopPadding={COLLAPSE_H} //
        />
      )}

      <ScrollToTopButton
        visible={showTop}
        onPress={() =>
          listRef.current?.scrollToOffset({ offset: 0, animated: true })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stickyWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
});
