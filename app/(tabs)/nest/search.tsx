import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchClearIcon from "@/assets/icon/button/SearchClearIcon";
import BracketIcon from "@/assets/icon/common/BracketIcon";
import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import EmptyState from "@/components/common/EmptyState";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import CommunityCollectionRow, {
  communityCollectionRowStyles,
} from "@/components/nest/CommunityCollectionRow";
import NestWriteFab from "@/components/nest/NestWriteFab";
import {
  CommunityCollectionSummary,
  CommunitySearchAllResponse,
  CommunityUserSummary,
  searchCommunityAllApi,
  searchCommunityCollectionsApi,
  searchCommunityUsersApi,
} from "@/services/api/community";
import { rfs, rs } from "@/theme/scale";

type TabKey = "all" | "bird" | "user";

type SearchHistoryItem = {
  keyword: string;
  searchedAt: string;
};

const SEARCH_HISTORY_KEY = "nest_search_history";

const emptyAll: CommunitySearchAllResponse = {
  collectionsCount: 0,
  collections: [],
  usersCount: 0,
  users: [],
};

function renderHighlightedNickname(name: string, keyword: string) {
  const q = keyword.trim();
  if (!q) return name;

  const lowerName = name.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const matchIndex = lowerName.indexOf(lowerQuery);

  if (matchIndex < 0) return name;

  const before = name.slice(0, matchIndex);
  const matched = name.slice(matchIndex, matchIndex + q.length);
  const after = name.slice(matchIndex + q.length);

  return (
    <>
      {before ? <Text style={styles.userNicknameText}>{before}</Text> : null}
      <Text style={styles.userNicknameHighlight}>{matched}</Text>
      {after ? <Text style={styles.userNicknameText}>{after}</Text> : null}
    </>
  );
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}. ${day}.`;
}

export default function NestSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [allResult, setAllResult] =
    useState<CommunitySearchAllResponse>(emptyAll);
  const [usersResult, setUsersResult] = useState<CommunityUserSummary[]>([]);
  const [collectionsResult, setCollectionsResult] = useState<
    CommunityCollectionSummary[]
  >([]);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as SearchHistoryItem[];
        setHistory(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.log("[NestSearchScreen] history load error", e);
      }
    })();
  }, []);

  const persistHistory = async (nextItems: SearchHistoryItem[]) => {
    setHistory(nextItems);
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextItems));
    } catch (e) {
      console.log("[NestSearchScreen] history save error", e);
    }
  };

  const saveSearchHistory = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    const nextItems = [
      { keyword: trimmed, searchedAt: new Date().toISOString() },
      ...history.filter((item) => item.keyword !== trimmed),
    ].slice(0, 20);

    await persistHistory(nextItems);
  };

  const removeHistoryItem = async (keyword: string) => {
    await persistHistory(history.filter((item) => item.keyword !== keyword));
  };

  const clearSearch = () => {
    setQuery("");
    setLoading(false);
    setHasSearched(false);
    setError(null);
    setAllResult(emptyAll);
    setUsersResult([]);
    setCollectionsResult([]);
  };

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setLoading(false);
      setHasSearched(false);
      setError(null);
      setAllResult(emptyAll);
      setUsersResult([]);
      setCollectionsResult([]);
      return;
    }

    let canceled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setHasSearched(false);
        setError(null);

        if (tab === "all") {
          const res = await searchCommunityAllApi(q);
          if (!canceled) setAllResult(res);
          return;
        }

        if (tab === "user") {
          const res = await searchCommunityUsersApi(q);
          if (!canceled) setUsersResult(res.items ?? []);
          return;
        }

        const res = await searchCommunityCollectionsApi(q);
        const list = res.items ?? [];
        if (!canceled) setCollectionsResult(list);
      } catch (e) {
        console.log("[NestSearchScreen] ERROR", e);
        if (!canceled) setError("검색 결과를 불러오지 못했어요.");
      } finally {
        if (!canceled) {
          setHasSearched(true);
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [query, tab]);

  const runSearch = async (nextTab: TabKey = tab) => {
    const q = query.trim();
    if (!q) {
      clearSearch();
      return;
    }

    try {
      setLoading(true);
      setHasSearched(false);
      setError(null);

      if (nextTab === "all") {
        const res = await searchCommunityAllApi(q);
        setAllResult(res);
        return;
      }

      if (nextTab === "user") {
        const res = await searchCommunityUsersApi(q);
        setUsersResult(res.items ?? []);
        return;
      }

      const res = await searchCommunityCollectionsApi(q);
      const list = res.items ?? [];
      setCollectionsResult(list);
    } catch (e) {
      console.log("[NestSearchScreen] ERROR", e);
      setError("검색 결과를 불러오지 못했어요.");
    } finally {
      setHasSearched(true);
      setLoading(false);
    }
  };

  const submitSearch = async () => {
    await saveSearchHistory(query);
    setIsInputFocused(false);
    await runSearch();
  };

  const changeTab = (nextTab: TabKey) => {
    setTab(nextTab);
    if (query.trim() && hasSearched) {
      void runSearch(nextTab);
    }
  };

  const showHistory = !query.trim() && isInputFocused;

  const showEmpty = useMemo(() => {
    if (!query.trim() || loading || !hasSearched) return false;
    if (tab === "all") {
      return allResult.collections.length === 0 && allResult.users.length === 0;
    }
    if (tab === "user") return usersResult.length === 0;
    return collectionsResult.length === 0;
  }, [
    query,
    loading,
    hasSearched,
    tab,
    allResult,
    usersResult,
    collectionsResult,
  ]);

  const renderUsers = (users: CommunityUserSummary[]) => (
    <View style={styles.userList}>
      {users.map((user, index) => (
        <TouchableOpacity
          key={user.userId}
          style={[
            styles.userRow,
            index < users.length - 1 && styles.userRowDivider,
          ]}
          onPress={() => router.push(`/saerok/profile/${user.userId}`)}
        >
          <Image
            source={{
              uri: user.thumbnailProfileImageUrl || user.profileImageUrl || "",
            }}
            style={styles.userAvatar}
          />
          <Text style={styles.userNickname}>
            {renderHighlightedNickname(user.nickname, query)}
          </Text>
          <InfoChevronIcon width={rs(15)} height={rs(15)} color="#979797" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCollections = (items: CommunityCollectionSummary[]) => (
    <View style={communityCollectionRowStyles.card}>
          {items.map((item, index) => (
        <View key={item.collectionId}>
          <CommunityCollectionRow
            item={item}
            variant="recent"
                onPress={() => {
                  const { openSaerokDetail } = require("@/lib/navigation");
                  openSaerokDetail(router, item.collectionId, { from: "nest_search" });
                }}
          />
          {index < items.length - 1 ? (
            <View style={communityCollectionRowStyles.divider} />
          ) : null}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.searchTopArea}>
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <BracketIcon width={rs(17)} height={rs(17)} color="#D7A94F" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onSubmitEditing={() => void submitSearch()}
            blurOnSubmit={false}
            autoFocus
            placeholder="검색어를 입력해 주세요"
            placeholderTextColor="#DAE0DE"
          />
          <TouchableOpacity onPress={clearSearch} hitSlop={10}>
            <SearchClearIcon width={rs(17)} height={rs(17)} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {[
            { key: "all", label: "전체" },
            { key: "bird", label: "새 이름" },
            { key: "user", label: "사용자" },
          ].map((item) => {
            const active = tab === (item.key as TabKey);
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => changeTab(item.key as TabKey)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    active && styles.tabChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {showHistory ? (
        <View style={styles.historyScreen}>
          {history.map((item, index) => (
            <TouchableOpacity
              key={`${item.keyword}-${item.searchedAt}`}
              style={[
                styles.historyRow,
                index < history.length - 1 && styles.historyRowDivider,
              ]}
              onPress={() => {
                setQuery(item.keyword);
                setIsInputFocused(false);
              }}
            >
              <Text style={styles.historyKeyword}>{item.keyword}</Text>
              <View style={styles.historyRight}>
                <Text style={styles.historyDate}>
                  {formatHistoryDate(item.searchedAt)}
                </Text>
                <TouchableOpacity
                  hitSlop={10}
                  onPress={(event) => {
                    event.stopPropagation();
                    void removeHistoryItem(item.keyword);
                  }}
                >
                  <CloseLineIcon
                    width={rs(12)}
                    height={rs(12)}
                    color="#979797"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : showEmpty ? (
        <View style={styles.emptyStateScreen}>
          <EmptyState
            bgColor="gray"
            upperText="지금은 고요한 숲처럼 조용하네요."
            lowerText="검색 결과가 없어요."
          />
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {tab === "all" && !!query.trim() ? (
            <>
              <View style={[styles.sectionHeader, styles.sectionTopGap]}>
                <Text style={styles.sectionTitle}>
                  새 이름{" "}
                  <Text style={styles.countBlue}>
                    {allResult.collectionsCount}
                  </Text>
                </Text>
                <TouchableOpacity
                  style={styles.moreRow}
                  onPress={() => changeTab("bird")}
                >
                  <Text style={styles.moreText}>더보기</Text>
                  <InfoChevronIcon
                    width={rs(11)}
                    height={rs(11)}
                    color="#979797"
                  />
                </TouchableOpacity>
              </View>
              {allResult.collections.length > 0
                ? renderCollections(allResult.collections)
                : null}

              <View style={[styles.sectionHeader, styles.sectionTopGap]}>
                <Text style={styles.sectionTitle}>
                  사용자{" "}
                  <Text style={styles.countBlue}>{allResult.usersCount}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.moreRow}
                  onPress={() => changeTab("user")}
                >
                  <Text style={styles.moreText}>더보기</Text>
                  <InfoChevronIcon
                    width={rs(13)}
                    height={rs(13)}
                    color="#979797"
                  />
                </TouchableOpacity>
              </View>
              {allResult.users.length > 0 ? renderUsers(allResult.users) : null}
            </>
          ) : null}

          {tab === "user" && !!query.trim() ? renderUsers(usersResult) : null}
          {tab === "bird" && !!query.trim()
            ? renderCollections(collectionsResult)
            : null}

          <View style={{ height: rs(24) }} />
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color="#4190FF" />
        </View>
      ) : null}
      <NestWriteFab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchTopArea: {
    paddingHorizontal: rs(24),
    paddingTop: rs(20),
    paddingBottom: rs(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    gap: rs(10),
  },
  searchBar: {
    height: rs(44),
    borderRadius: rs(17),
    borderWidth: rs(2),
    borderColor: "#F7BE65",
    backgroundColor: "#FEFEFE",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: rs(14),
    paddingRight: rs(15),
    gap: rs(10),
  },
  searchInput: {
    flex: 1,
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
    paddingVertical: 0,
  },
  tabRow: {
    flexDirection: "row",
    gap: rs(6),
  },
  tabChip: {
    height: rs(40),
    borderRadius: rs(30.5),
    borderWidth: 1,
    borderColor: "#DAE0DE",
    backgroundColor: "#FEFEFE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(15),
    paddingVertical: rs(9),
  },
  tabChipActive: {
    borderColor: "#F7BE65",
    backgroundColor: "#F7BE65",
  },
  tabChipText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  tabChipTextActive: {
    color: "#FEFEFE",
    fontWeight: "600",
  },
  historyScreen: {
    flex: 1,
    backgroundColor: "#fefefe",
  },
  historyRow: {
    minHeight: rs(55),
    backgroundColor: "#fefefe",
    paddingVertical: rs(18),
    paddingHorizontal: rs(25),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rs(15),
  },
  historyRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  historyKeyword: {
    flex: 1,
    color: "#6D6D6D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(15),
  },
  historyDate: {
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  emptyStateScreen: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingBottom: rs(80),
  },
  body: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  bodyContent: {},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#D90000",
    fontSize: rfs(13),
    marginTop: rs(8),
  },
  sectionHeader: {
    minHeight: rs(56),
    backgroundColor: "#FEFEFE",
    paddingHorizontal: rs(24),
    paddingVertical: rs(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  sectionTopGap: {
    marginTop: rs(10),
  },
  sectionTitle: {
    color: "#0D0D0D",
    fontSize: rfs(20),
    lineHeight: rfs(24),
    fontWeight: "700",
  },
  countBlue: {
    marginLeft: rs(10),
    color: "#4190FF",
    fontSize: rfs(20),
    lineHeight: rfs(24),
    fontWeight: "400",
  },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  moreText: {
    color: "#6D6D6D",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  userList: {
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
    marginBottom: rs(88),
  },
  userRow: {
    minHeight: rs(49),
    paddingLeft: rs(25),
    paddingRight: rs(24),
    paddingTop: rs(11),
    paddingBottom: rs(12),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
  },
  userRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  userAvatar: {
    width: rs(49),
    height: rs(49),
    borderWidth: rs(2),
    borderColor: "#F2F2F2",
    borderRadius: rs(24.5),
    backgroundColor: "#F2F2F2",
  },
  userNickname: {
    flex: 1,
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "600",
  },
  userNicknameText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "600",
  },
  userNicknameHighlight: {
    color: "#4190FF",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "600",
  },
});
