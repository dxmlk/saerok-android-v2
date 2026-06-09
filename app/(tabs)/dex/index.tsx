import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
import { useAuth } from "@/hooks/useAuth";

import { toStringArray, toStringValue } from "@/lib/safeParams";
import {
  fetchBookmarkListApi,
  fetchDexDetailApi,
  fetchDexItemsApi,
  toggleBookmarkApi,
} from "@/services/api/birds";
import { useDexBookmarksState } from "@/states/useDexBookmarksState";
import { rs } from "@/theme";

const seasonMap: Record<string, string> = {
  봄: "spring",
  여름: "summer",
  가을: "autumn",
  겨울: "winter",
};
const habitatMap: Record<string, string> = {
  갯벌: "mudflat",
  "경작지/들판": "farmland",
  "산림/계꼭": "forest",
  해양: "marine",
  거주지역: "residential",
  평지숲: "plains_forest",
  "하천/호수": "river_lake",
  인공시설: "artificial",
  동굴: "cave",
  습지: "wetland",
  기타: "others",
};
const sizeCategoryMap: Record<string, string> = {
  참새: "xsmall",
  비둘기: "small",
  오리: "medium",
  기러기: "large",
};

const PAGE_SIZE = 20;
const DEBUG_FORCE_BOOKMARK_LOADING = false;

function getDexTotalCount(data: any) {
  const candidates = [
    data?.totalCount,
    data?.totalElements,
    data?.totalItems,
    data?.total,
    data?.page?.totalElements,
    data?.pagination?.totalCount,
  ];
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function hasActiveDexFilters(params: any) {
  return (
    !!params?.q ||
    (Array.isArray(params?.seasons) && params.seasons.length > 0) ||
    (Array.isArray(params?.habitats) && params.habitats.length > 0) ||
    (Array.isArray(params?.sizeCategories) &&
      params.sizeCategories.length > 0)
  );
}

async function resolveDexTotalCount(params: any, firstPageData: any) {
  const explicitTotalCount = getDexTotalCount(firstPageData);
  if (explicitTotalCount != null) return explicitTotalCount;
  if (!hasActiveDexFilters(params)) return 585;

  const res = await fetchDexItemsApi({ ...params, page: 1, size: 1000 });
  const birds: DexItem[] = res.data?.birds ?? [];
  return getDexTotalCount(res.data) ?? birds.length;
}

export default function DexIndex() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
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
  const [totalBirdCount, setTotalBirdCount] = useState(585);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [bookmarkItems, setBookmarkItems] = useState<DexItem[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const bookmarkedIds = useDexBookmarksState((state) => state.bookmarkedIds);
  const setBookmarkedIds = useDexBookmarksState(
    (state) => state.setBookmarkedIds,
  );
  const setBookmarked = useDexBookmarksState((state) => state.setBookmarked);

  const listRef = useRef<FlatList<DexItem> | null>(null);
  const countSeqRef = useRef(0);
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
    setTotalBirdCount(0);
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
      const explicitTotalCount = getDexTotalCount(res.data);
      const countSeq =
        mode === "replace" ? ++countSeqRef.current : countSeqRef.current;

      if (mode === "replace") {
        const nextTotalCount = await resolveDexTotalCount(params, res.data);
        if (countSeq !== countSeqRef.current) return;
        setItems(birds);
        setTotalBirdCount(nextTotalCount);
      } else {
        setItems((prev) => {
          const prevIds = new Set(prev.map((x) => x.id));
          const next = [...prev, ...birds.filter((b) => !prevIds.has(b.id))];
          if (explicitTotalCount != null) {
            setTotalBirdCount(explicitTotalCount);
          }
          return next;
        });
      }

      setHasMore(birds.length === PAGE_SIZE);
    } catch (e: any) {
      setError(e?.message ?? "도감을 불러오는 데 실패하였습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookmarkOnly) return;
    setPage(1);
    setHasMore(true);
    setItems([]);
    setTotalBirdCount(0);
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
    setTotalBirdCount(0);
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
    if (!isLoggedIn) {
      setBookmarkedIds([]);
      return;
    }

    try {
      const res = await fetchBookmarkListApi();
      const list = res.data?.items ?? res.data ?? [];
      const ids = list.map((x: any) => (typeof x === "number" ? x : x.birdId));
      setBookmarkedIds(ids);
    } catch {}
  };

  const loadBookmarkOnlyItems = async () => {
    if (!isLoggedIn) {
      setBookmarkItems([]);
      setBookmarkLoading(false);
      return;
    }

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
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setBookmarkedIds([]);
      return;
    }

    loadBookmarks();
  }, [isLoggedIn, setBookmarkedIds]);

  useFocusEffect(
    React.useCallback(() => {
      if (!isLoggedIn) {
        setBookmarkedIds([]);
        return;
      }

      void loadBookmarks();
      if (bookmarkOnly) {
        void loadBookmarkOnlyItems();
      }
    }, [bookmarkOnly, isLoggedIn, setBookmarkedIds]),
  );

  const toggleBookmark = async (id: number) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const wasBookmarked = bookmarkedIds.has(id);
    setBookmarked(id, !wasBookmarked);

    try {
      await toggleBookmarkApi(id);
    } catch {
      setBookmarked(id, wasBookmarked);
    }
  };

  useEffect(() => {
    if (!bookmarkOnly) return;
    if (!isLoggedIn) {
      setBookmarkOnly(false);
      return;
    }

    void loadBookmarkOnlyItems();
  }, [bookmarkOnly, isLoggedIn]);

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
            birdCount={bookmarkOnly ? bookmarkItems.length : totalBirdCount}
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
              router.setParams({
                q: undefined,
                seasons: undefined,
                habitats: undefined,
                sizeCategories: undefined,
              });
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
            <Text>다시 불러오기 </Text>
          </Pressable>
        </View>
      )}

      {bookmarkOnly ? (
        bookmarkLoading || DEBUG_FORCE_BOOKMARK_LOADING ? (
          <DexList
            items={[]}
            loading
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
            contentTopPadding={COLLAPSE_H}
          />
        ) : bookmarkItems.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              marginTop: rs(27),
            }}
          >
            <EmptyState
              bgColor="gray"
              topInset={COLLAPSE_H}
              upperText="스크랩한 새가 없어요!"
              lowerText="스크랩 아이콘을 눌러 좋아하는 새를 저장해보세요!"
            />
          </View>
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
      ) : loading && items.length === 0 ? (
        <DexList
          items={[]}
          loading
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
          contentTopPadding={COLLAPSE_H}
        />
      ) : items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            marginTop: rs(27),
          }}
        >
          <EmptyState
            bgColor="gray"
            topInset={COLLAPSE_H}
            upperText="해당되는 항목이 없어요!"
            lowerText="다른 검색어나 필터로 다시 찾아보세요."
          />
        </View>
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
