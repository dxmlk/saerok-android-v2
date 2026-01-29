// src/app/dex/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

/** 웹 매핑 동일 */
const seasonMap: Record<string, string> = {
  봄: "spring",
  여름: "summer",
  가을: "autumn",
  겨울: "winter",
};
const habitatMap: Record<string, string> = {
  갯벌: "mudflat",
  "경작지/들판": "farmland",
  "산림/계곡": "forest",
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

export default function DexIndex() {
  const router = useRouter();
  const sp = useLocalSearchParams<{
    q?: string | string[];
    seasons?: string | string[];
    habitats?: string | string[];
    sizeCategories?: string | string[];
  }>();

  /** ✅ URL params → 상태 */
  const [searchTerm, setSearchTerm] = useState<string>(toStringValue(sp.q));
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    seasons: toStringArray(sp.seasons),
    habitats: toStringArray(sp.habitats),
    sizeCategories: toStringArray(sp.sizeCategories),
  });

  /** 리스트 */
  const [items, setItems] = useState<DexItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 북마크 */
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [bookmarkItems, setBookmarkItems] = useState<DexItem[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  /** 스크롤 탑 */
  const listRef = useRef<FlatList<DexItem> | null>(null);
  const [showTop, setShowTop] = useState(false);

  // params 변경 시 상태 동기화 (search 화면에서 replace로 돌아오므로 여기서 받음)
  useEffect(() => {
    setSearchTerm(toStringValue(sp.q));
    setSelectedFilters({
      seasons: toStringArray(sp.seasons),
      habitats: toStringArray(sp.habitats),
      sizeCategories: toStringArray(sp.sizeCategories),
    });
    // ✅ 새 조건이면 페이징 리셋
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
        // 중복 방지
        const prevIds = new Set(prev.map((x) => x.id));
        const merged = [...prev, ...birds.filter((b) => !prevIds.has(b.id))];
        return merged;
      });

      setHasMore(birds.length === PAGE_SIZE);
    } catch (e: any) {
      setError(e?.message ?? "도감 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 조건(필터/검색어) 바뀌면 page=1 로드
  useEffect(() => {
    if (bookmarkOnly) return;
    loadPage(1, "replace");
  }, [apiFilterParams, searchTerm, bookmarkOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ page 증가 시 append
  useEffect(() => {
    if (bookmarkOnly) return;
    if (page === 1) return; // page=1은 위에서 처리
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

  /** 북마크 목록 로드 */
  const loadBookmarks = async () => {
    try {
      const res = await fetchBookmarkListApi();
      const list = res.data?.items ?? res.data ?? [];
      const ids = list.map((x: any) => (typeof x === "number" ? x : x.birdId));
      setBookmarkedIds(new Set(ids));
    } catch {
      // 토큰 없으면 무시
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  /** 북마크 토글 */
  const toggleBookmark = async (id: number) => {
    // optimistic
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      await toggleBookmarkApi(id);
      // 필요하면 서버와 재동기화
      // await loadBookmarks();
    } catch {
      // rollback
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  /** 북마크 only 로드: birdId → detail → DexItem 형태로 구성 */
  useEffect(() => {
    if (!bookmarkOnly) return;

    (async () => {
      setBookmarkLoading(true);
      try {
        const res = await fetchBookmarkListApi();
        const list = res.data?.items ?? res.data ?? [];
        const ids: number[] = list.map((x: any) =>
          typeof x === "number" ? x : x.birdId
        );

        const birds = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetchDexDetailApi(id);
              const b = r.data;
              const thumb =
                Array.isArray(b.imageUrls) && b.imageUrls.length > 0
                  ? b.imageUrls[0]
                  : b.thumbImageUrl ?? "";
              return {
                id: b.id,
                koreanName: b.koreanName,
                scientificName: b.scientificName,
                thumbImageUrl: thumb,
              } as DexItem;
            } catch {
              return null;
            }
          })
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
      <DexMainHeader
        birdCount={bookmarkOnly ? bookmarkItems.length : items.length}
        onPressBookmark={() => setBookmarkOnly((v) => !v)}
        onPressSearch={goSearch}
        bookmarkActive={bookmarkOnly}
      />

      <FilterHeader
        selectedFilters={selectedFilters}
        onFilterChange={(group, vals) =>
          setSelectedFilters((prev) => ({ ...prev, [group]: vals }))
        }
      />

      {error && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <Text style={{ color: "red" }}>에러: {error}</Text>
          <Pressable
            onPress={() => loadPage(1, "replace")}
            style={{
              marginTop: 8,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text>다시 시도</Text>
          </Pressable>
        </View>
      )}

      {bookmarkOnly ? (
        bookmarkLoading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator />
            <Text style={{ marginTop: 10, color: "#666" }}>불러오는 중...</Text>
          </View>
        ) : bookmarkItems.length === 0 ? (
          <EmptyState
            upperText="스크랩한 새가 없어요!"
            lowerText="새 카드 오른쪽 위 스크랩 버튼을 눌러 스크랩해보세요."
          />
        ) : (
          <DexList
            items={bookmarkItems}
            loading={false}
            refreshing={false}
            onPressItem={(id) => {}}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            listRef={listRef}
            onScroll={(e) => {
              const y = e.nativeEvent.contentOffset.y;
              setShowTop(y > 700);
            }}
          />
        )
      ) : items.length === 0 && !loading ? (
        <EmptyState
          upperText="아직 도감에 새가 없어요"
          lowerText="필터를 바꾸거나 새로 고침을 해보세요."
        />
      ) : (
        <DexList
          items={items}
          loading={loading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onPressItem={(id) => {}}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={toggleBookmark}
          listRef={listRef}
          onEndReached={onEndReached}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            setShowTop(y > 700);
          }}
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
