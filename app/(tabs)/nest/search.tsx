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

import BracketIcon from "@/assets/icon/common/BracketIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import EmptyState from "@/components/common/EmptyState";
import CommunityCollectionRow, {
  communityCollectionRowStyles,
} from "@/components/nest/CommunityCollectionRow";
import {
  CommunityCollectionSummary,
  CommunitySearchAllResponse,
  CommunityUserSummary,
  searchCommunityAllApi,
  searchCommunityCollectionsApi,
  searchCommunityUsersApi,
} from "@/services/api/community";
import { rfs, rs } from "@/theme/scale";

type TabKey = "all" | "bird" | "user" | "code";

const emptyAll: CommunitySearchAllResponse = {
  collectionsCount: 0,
  collections: [],
  usersCount: 0,
  users: [],
};

export default function NestSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allResult, setAllResult] = useState<CommunitySearchAllResponse>(emptyAll);
  const [usersResult, setUsersResult] = useState<CommunityUserSummary[]>([]);
  const [collectionsResult, setCollectionsResult] = useState<CommunityCollectionSummary[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setLoading(false);
      setError(null);
      setAllResult(emptyAll);
      setUsersResult([]);
      setCollectionsResult([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        if (tab === "all") {
          const res = await searchCommunityAllApi(q);
          setAllResult(res);
          return;
        }

        if (tab === "user") {
          const res = await searchCommunityUsersApi(q);
          setUsersResult(res.items ?? []);
          return;
        }

        const res = await searchCommunityCollectionsApi(q);
        const list = res.items ?? [];
        if (tab === "code") {
          setCollectionsResult(
            list.filter((item) => String(item.collectionId).includes(q)),
          );
        } else {
          setCollectionsResult(list);
        }
      } catch (e) {
        console.log("[NestSearchScreen] ERROR", e);
        setError("검색 결과를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, tab]);

  const showEmpty = useMemo(() => {
    if (!query.trim() || loading) return false;
    if (tab === "all") {
      return allResult.collections.length === 0 && allResult.users.length === 0;
    }
    if (tab === "user") return usersResult.length === 0;
    return collectionsResult.length === 0;
  }, [query, loading, tab, allResult, usersResult, collectionsResult]);

  const renderUsers = (users: CommunityUserSummary[]) => (
    <View style={styles.userList}>
      {users.map((user, idx) => (
        <Pressable
          key={user.userId}
          style={[styles.userRow, idx < users.length - 1 && styles.userRowDivider]}
          onPress={() => router.push(`/saerok/profile/${user.userId}`)}
        >
          <Image
            source={{ uri: user.thumbnailProfileImageUrl || user.profileImageUrl || "" }}
            style={styles.userAvatar}
          />
          <Text style={styles.userNickname}>{user.nickname}</Text>
          <InfoChevronIcon width={rs(15)} height={rs(15)} color="#979797" />
        </Pressable>
      ))}
    </View>
  );

  const renderCollections = (items: CommunityCollectionSummary[]) => (
    <View style={communityCollectionRowStyles.card}>
      {items.map((item, idx) => (
        <View key={item.collectionId}>
          <CommunityCollectionRow
            item={item}
            variant="recent"
            onPress={() => router.push(`/saerok/${item.collectionId}`)}
          />
          {idx < items.length - 1 ? <View style={communityCollectionRowStyles.divider} /> : null}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.searchTopArea}>
        <View style={styles.searchBar}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <BracketIcon width={rs(17)} height={rs(17)} color="#D7A94F" />
          </Pressable>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="검색어를 입력해 주세요"
            placeholderTextColor="#B7B7B7"
          />
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {[
            { key: "all", label: "전체" },
            { key: "bird", label: "새 이름" },
            { key: "user", label: "사용자" },
            { key: "code", label: "새록 코드" },
          ].map((t) => {
            const active = tab === (t.key as TabKey);
            return (
              <Pressable
                key={t.key}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setTab(t.key as TabKey)}
              >
                <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#91BFFF" />
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {showEmpty ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              bgColor="gray"
              upperText="지금은 고요한 숲처럼 조용하네요."
              lowerText="검색 결과가 없어요."
            />
          </View>
        ) : null}

        {!showEmpty && tab === "all" && !!query.trim() ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                새 이름 <Text style={styles.countBlue}>{allResult.collectionsCount}</Text>
              </Text>
              <Pressable style={styles.moreRow} onPress={() => setTab("bird")}>
                <Text style={styles.moreText}>더보기</Text>
                <InfoChevronIcon width={rs(13)} height={rs(13)} color="#979797" />
              </Pressable>
            </View>
            {allResult.collections.length > 0 ? renderCollections(allResult.collections) : null}

            <View style={[styles.sectionHeader, styles.sectionTopGap]}>
              <Text style={styles.sectionTitle}>
                사용자 <Text style={styles.countBlue}>{allResult.usersCount}</Text>
              </Text>
              <Pressable style={styles.moreRow} onPress={() => setTab("user")}>
                <Text style={styles.moreText}>더보기</Text>
                <InfoChevronIcon width={rs(13)} height={rs(13)} color="#979797" />
              </Pressable>
            </View>
            {allResult.users.length > 0 ? renderUsers(allResult.users) : null}
          </>
        ) : null}

        {!showEmpty && tab === "user" && !!query.trim() ? renderUsers(usersResult) : null}
        {!showEmpty && (tab === "bird" || tab === "code") && !!query.trim()
          ? renderCollections(collectionsResult)
          : null}

        <View style={{ height: rs(24) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  searchTopArea: {
    paddingHorizontal: rs(14),
    paddingTop: rs(8),
    paddingBottom: rs(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    gap: rs(10),
  },
  searchBar: {
    height: rs(46),
    borderRadius: rs(16),
    borderWidth: rs(2),
    borderColor: "#E4B556",
    backgroundColor: "#FEFEFE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(12),
    gap: rs(8),
  },
  searchInput: {
    flex: 1,
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    paddingVertical: 0,
  },
  clearText: {
    color: "#D0D0D0",
    fontSize: rfs(18),
    lineHeight: rfs(20),
  },
  tabRow: {
    flexDirection: "row",
    gap: rs(8),
  },
  tabChip: {
    height: rs(36),
    borderRadius: rs(18),
    borderWidth: 1,
    borderColor: "#E7E7E7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(16),
  },
  tabChipActive: {
    borderColor: "#E4BE67",
    backgroundColor: "#E4BE67",
  },
  tabChipText: {
    color: "#222222",
    fontSize: rfs(14),
    lineHeight: rfs(16),
    fontWeight: "500",
  },
  tabChipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  body: { flex: 1, backgroundColor: "#FFFFFF" },
  bodyContent: { padding: rs(14), gap: rs(10) },
  loadingWrap: { paddingVertical: rs(24), alignItems: "center" },
  errorText: { color: "#D90000", fontSize: rfs(13), marginTop: rs(8) },
  emptyWrap: { minHeight: rs(420), justifyContent: "center" },
  sectionHeader: {
    marginTop: rs(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTopGap: { marginTop: rs(10) },
  sectionTitle: {
    color: "#0D0D0D",
    fontSize: rfs(18),
    lineHeight: rfs(20),
    fontWeight: "700",
  },
  countBlue: { color: "#5F8EFF" },
  moreRow: { flexDirection: "row", alignItems: "center", gap: rs(4) },
  moreText: {
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(15),
  },
  userList: {
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
  },
  userRow: {
    minHeight: rs(58),
    paddingHorizontal: rs(14),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },
  userRowDivider: { borderBottomWidth: 1, borderBottomColor: "#F1F1F1" },
  userAvatar: {
    width: rs(34),
    height: rs(34),
    borderRadius: rs(17),
    backgroundColor: "#DDE7FF",
  },
  userNickname: {
    flex: 1,
    color: "#5F8EFF",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "600",
  },
});

