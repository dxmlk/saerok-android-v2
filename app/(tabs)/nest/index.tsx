import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import SearchIcon from "@/assets/icon/icon/SearchIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import BoardRecentIcon from "@/assets/icon/nest/BoardRecentIcon";
import BoardPopularIcon from "@/assets/icon/nest/BoardPopularIcon";
import BoardHelpIcon from "@/assets/icon/nest/BoardHelpIcon";
import PendingParticipantIcon from "@/assets/icon/nest/PendingParticipantIcon";
import { rs, rfs } from "@/theme/scale";
import {
  CommunityCollectionSummary,
  fetchCommunityMainApi,
} from "@/services/api/community";

type MainData = {
  recentCollections: CommunityCollectionSummary[];
  popularCollections: CommunityCollectionSummary[];
  pendingCollections: CommunityCollectionSummary[];
};

const initialData: MainData = {
  recentCollections: [],
  popularCollections: [],
  pendingCollections: [],
};

function formatElapsed(dateString?: string | null) {
  if (!dateString) return "";
  const t = new Date(dateString).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  return `${Math.floor(diff / day)}일 전`;
}

function SectionHeader({
  title,
  onPressMore,
}: {
  title: string;
  onPressMore?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable style={styles.moreBtn} onPress={onPressMore} hitSlop={10}>
        <Text style={styles.moreText}>더보기</Text>
        <InfoChevronIcon width={rs(13)} height={rs(13)} color="#979797" />
      </Pressable>
    </View>
  );
}

function PendingBirdCard({
  item,
  onPress,
}: {
  item: CommunityCollectionSummary;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.pendingCard} onPress={onPress}>
      <Image
        source={{ uri: item.thumbnailImageUrl || item.imageUrl || "" }}
        style={styles.pendingImage}
      />
      <View style={styles.pendingFooter}>
        <PendingParticipantIcon width={rs(15)} height={rs(15)} />
        <Text style={styles.pendingFooterText}>
          {item.suggestionUserCount ?? 0}명 참여
        </Text>
      </View>
    </Pressable>
  );
}

function BoardMenu({
  onPress,
}: {
  onPress: (key: "recent" | "popular" | "help") => void;
}) {
  const rows = [
    {
      key: "recent" as const,
      label: "최근에 올라온 새록",
      color: "#91BFFF",
      icon: <BoardRecentIcon width={rs(17)} height={rs(17)} />,
    },
    {
      key: "popular" as const,
      label: "요즘 인기 있는 새록",
      color: "#F77965",
      icon: <BoardPopularIcon width={rs(17)} height={rs(17)} />,
    },
    {
      key: "help" as const,
      label: "이 새 이름이 뭔가요?",
      color: "#F7BE65",
      icon: <BoardHelpIcon width={rs(17)} height={rs(17)} />,
    },
  ];

  return (
    <View style={styles.boardCard}>
      {rows.map((row, index) => (
        <Pressable
          key={row.key}
          style={[
            styles.boardRow,
            index < rows.length - 1 && styles.boardRowDivider,
          ]}
          onPress={() => onPress(row.key)}
        >
          <View style={[styles.boardRowIcon, { backgroundColor: row.color }]}>
            {row.icon}
          </View>
          <Text style={styles.boardRowText}>{row.label}</Text>
          <View style={styles.boardNBadge}>
            <Text style={styles.boardNText}>N</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function CommunityCollectionRow({
  item,
  onPress,
}: {
  item: CommunityCollectionSummary;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.feedRow} onPress={onPress}>
      <View style={styles.feedTextWrap}>
        <Text style={styles.feedBirdName} numberOfLines={1}>
          {item.bird?.koreanName || "이름 모를 새"}
        </Text>
        <Text style={styles.feedNote} numberOfLines={2}>
          {item.note || "한 줄 평"}
        </Text>
        <Text style={styles.feedMeta} numberOfLines={1}>
          {`${formatElapsed(item.createdAt)} · ${item.locationAlias || item.address || ""}`}
        </Text>
      </View>
      <Image
        source={{ uri: item.thumbnailImageUrl || item.imageUrl || "" }}
        style={styles.feedThumb}
      />
    </Pressable>
  );
}

export default function NestHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MainData>(initialData);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCommunityMainApi();
        if (!mounted) return;
        setData({
          recentCollections: res.recentCollections ?? [],
          popularCollections: res.popularCollections ?? [],
          pendingCollections:
            res.pendingCollections ?? res.pendingBirdIdCollections ?? [],
        });
      } catch (e) {
        console.log("[NestHome] ERROR", e);
        if (mounted) setError("커뮤니티를 불러오지 못했어요.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const pendingTop = useMemo(
    () => data.pendingCollections.slice(0, 6),
    [data.pendingCollections],
  );
  const recentTop = useMemo(
    () => data.recentCollections.slice(0, 3),
    [data.recentCollections],
  );
  const popularTop = useMemo(
    () => data.popularCollections.slice(0, 3),
    [data.popularCollections],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#F9E2BE", "#F3F3F3"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.pendingGradientSection}
        >
          <Pressable
            style={styles.searchBar}
            onPress={() => router.push("/nest/search")}
          >
            <SearchIcon
              width={rs(22)}
              height={rs(22)}
              stroke="#D3D3D3"
              backgroundOpacity={0}
            />
            <Text style={styles.searchPlaceholder}>
              장소, 사용자, 새 이름을 검색해보세요!
            </Text>
            <Text style={styles.searchClear}>✕</Text>
          </Pressable>

          <SectionHeader
            title="이 새 이름이 뭔가요?"
            onPressMore={() => router.push("/nest/help")}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pendingList}
          >
            {pendingTop.map((item) => (
              <PendingBirdCard
                key={item.collectionId}
                item={item}
                onPress={() => router.push(`/saerok/${item.collectionId}`)}
              />
            ))}
            {!loading && pendingTop.length === 0 ? (
              <View style={styles.pendingEmpty}>
                <Text style={styles.pendingEmptyText}>동정 요청이 없어요</Text>
              </View>
            ) : null}
          </ScrollView>
        </LinearGradient>

        <View style={styles.mainContent}>
          <BoardMenu
            onPress={(key) => {
              if (key === "recent") router.push("/nest/recent");
              if (key === "popular") router.push("/nest/popular");
              if (key === "help") router.push("/nest/help");
            }}
          />

          <SectionHeader
            title="최근에 올라온 새록"
            onPressMore={() => router.push("/nest/recent")}
          />
          <View style={styles.feedCard}>
            {recentTop.map((item, idx) => (
              <View key={`recent-${item.collectionId}`}>
                <CommunityCollectionRow
                  item={item}
                  onPress={() => router.push(`/saerok/${item.collectionId}`)}
                />
                {idx < recentTop.length - 1 ? <View style={styles.feedDivider} /> : null}
              </View>
            ))}
            {!loading && recentTop.length === 0 ? (
              <Text style={styles.feedPlaceholder}>최근 새록이 없어요</Text>
            ) : null}
          </View>

          <SectionHeader
            title="요즘 인기 있는 새록"
            onPressMore={() => router.push("/nest/popular")}
          />
          <View style={styles.feedCard}>
            {popularTop.map((item, idx) => (
              <View key={`popular-${item.collectionId}`}>
                <CommunityCollectionRow
                  item={item}
                  onPress={() => router.push(`/saerok/${item.collectionId}`)}
                />
                {idx < popularTop.length - 1 ? <View style={styles.feedDivider} /> : null}
              </View>
            ))}
            {!loading && popularTop.length === 0 ? (
              <Text style={styles.feedPlaceholder}>인기 새록이 없어요</Text>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#91BFFF" />
            </View>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F3F3" },
  container: { flex: 1, backgroundColor: "#F3F3F3" },
  contentContainer: {
    paddingBottom: rs(86),
    gap: rs(18),
  },
  pendingGradientSection: {
    paddingHorizontal: rs(18),
    paddingTop: rs(10),
    paddingBottom: rs(12),
  },
  mainContent: {
    paddingHorizontal: rs(18),
    gap: rs(18),
  },
  searchBar: {
    height: rs(52),
    borderRadius: rs(20),
    borderWidth: rs(2),
    borderColor: "#E4B556",
    backgroundColor: "#FEFEFE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(16),
    gap: rs(8),
  },
  searchPlaceholder: {
    flex: 1,
    color: "#D0D0D0",
    fontSize: rfs(15),
    lineHeight: rfs(18),
  },
  searchClear: {
    color: "#CFCFCF",
    fontSize: rfs(18),
    lineHeight: rfs(20),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: rs(12),
  },
  sectionTitle: {
    color: "#0D0D0D",
    fontSize: rfs(20),
    lineHeight: rfs(22),
    fontWeight: "700",
  },
  moreBtn: { flexDirection: "row", alignItems: "center", gap: rs(4) },
  moreText: {
    color: "#6D6D6D",
    fontSize: rfs(14),
    lineHeight: rfs(16),
    fontWeight: "600",
  },
  pendingList: { gap: rs(10), paddingRight: rs(18), paddingBottom: rs(6) },
  pendingCard: {
    width: rs(136),
    borderRadius: rs(18),
    backgroundColor: "#FEFEFE",
    padding: rs(8),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pendingImage: {
    width: "100%",
    height: rs(120),
    borderRadius: rs(14),
    backgroundColor: "#ECECEC",
  },
  pendingFooter: {
    marginTop: rs(6),
    borderRadius: rs(12),
    backgroundColor: "#F3F3F3",
    paddingVertical: rs(6),
    paddingHorizontal: rs(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(4),
  },
  pendingFooterText: {
    color: "#7D7D7D",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "500",
  },
  pendingEmpty: {
    width: rs(170),
    height: rs(170),
    borderRadius: rs(18),
    backgroundColor: "#FEFEFE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFE7CF",
  },
  pendingEmptyText: {
    color: "#979797",
    fontSize: rfs(13),
  },
  boardCard: {
    borderRadius: rs(18),
    borderWidth: 1,
    borderColor: "#E6E0CC",
    backgroundColor: "#F7F4EA",
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
  },
  boardRow: {
    minHeight: rs(48),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },
  boardRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ECE6D5",
  },
  boardRowIcon: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(8),
    alignItems: "center",
    justifyContent: "center",
    padding: rs(4),
  },
  boardRowText: {
    flex: 1,
    color: "#202020",
    fontSize: rfs(16),
    lineHeight: rfs(18),
    fontWeight: "700",
  },
  boardNBadge: {
    width: rs(11),
    height: rs(11),
    borderRadius: rs(3),
    backgroundColor: "#FF234F",
    alignItems: "center",
    justifyContent: "center",
  },
  boardNText: {
    color: "#FFFFFF",
    fontFamily: "Pretendard Variable",
    fontSize: rfs(7),
    lineHeight: rfs(7),
    fontWeight: "700",
  },
  feedCard: {
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#EEE6D6",
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
  },
  feedDivider: { height: 1, backgroundColor: "#F1F1F1" },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),
  },
  feedTextWrap: { flex: 1, gap: rs(4) },
  feedBirdName: {
    color: "#A5A5A5",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "600",
  },
  feedNote: {
    color: "#0D0D0D",
    fontSize: rfs(16),
    lineHeight: rfs(20),
    fontWeight: "700",
  },
  feedMeta: {
    color: "#8B8B8B",
    fontSize: rfs(13),
    lineHeight: rfs(16),
  },
  feedThumb: {
    width: rs(92),
    height: rs(92),
    borderRadius: rs(14),
    backgroundColor: "#ECECEC",
  },
  feedPlaceholder: {
    textAlign: "center",
    color: "#979797",
    paddingVertical: rs(18),
    fontSize: rfs(14),
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: rs(10),
  },
  errorText: {
    color: "#D90000",
    fontSize: rfs(13),
    lineHeight: rfs(16),
  },
});
