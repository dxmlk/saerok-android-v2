import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  InteractionManager,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import NestSearchIcon from "@/assets/icon/button/NestSearchIcon";
import SearchClearIcon from "@/assets/icon/button/SearchClearIcon";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import BoardRecentIcon from "@/assets/icon/nest/BoardRecentIcon";
import BoardPopularIcon from "@/assets/icon/nest/BoardPopularIcon";
import BoardHelpIcon from "@/assets/icon/nest/BoardHelpIcon";
import FreeBoardEntryArrowIcon from "@/assets/icon/nest/FreeBoardEntryArrowIcon";
import PendingParticipantIcon from "@/assets/icon/nest/PendingParticipantIcon";
import NestWriteFab from "@/components/nest/NestWriteFab";
import ProfileAvatar from "@/components/my/ProfileAvatar";
import CommunityCollectionRow, {
  communityCollectionRowStyles,
} from "@/components/nest/CommunityCollectionRow";
import {
  AdSlotResponse,
  fetchAdSlotApi,
  recordAdClickWithStoredDeviceApi,
  recordAdImpressionWithStoredDeviceApi,
} from "@/services/api/ad";
import {
  CommunityCollectionSummary,
  FreeBoardPostSummary,
  fetchCommunityMainApi,
  fetchFreeBoardPostsApi,
} from "@/services/api/community";
import { rfs, rs } from "@/theme/scale";

type MainData = {
  recentCollections: CommunityCollectionSummary[];
  popularCollections: CommunityCollectionSummary[];
  pendingCollections: CommunityCollectionSummary[];
  freeBoardPosts: FreeBoardPostSummary[];
};

type FreeBoardCarouselItem =
  | { type: "post"; key: string; post: FreeBoardPostSummary }
  | { type: "entry"; key: string };

const initialData: MainData = {
  recentCollections: [],
  popularCollections: [],
  pendingCollections: [],
  freeBoardPosts: [],
};

const NEST_FREEBOARD_AD_SLOT = "COMM_TOP";
const FREEBOARD_CARD_WIDTH = rs(280);
const FREEBOARD_CARD_GAP = rs(12);

function formatElapsed(dateString?: string | null) {
  if (!dateString) return "";
  const time = new Date(dateString).getTime();
  if (!Number.isFinite(time)) return "";

  const diff = Date.now() - time;
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
      {onPressMore ? (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onPressMore}
          hitSlop={10}
        >
          <Text style={styles.moreText}>더보기</Text>
          <InfoChevronIcon width={rs(13)} height={rs(13)} color="#979797" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function FreeBoardCard({
  item,
  onPress,
}: {
  item: FreeBoardPostSummary;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.freeBoardCard} onPress={onPress}>
      <View style={styles.freeBoardHeader}>
        <View style={styles.freeBoardUser}>
          <ProfileAvatar
            size={rs(21)}
            imageUrl={item.thumbnailProfileImageUrl || item.profileImageUrl}
            seed={item.nickname || String(item.userId)}
          />
          <Text style={styles.freeBoardNickname} numberOfLines={1}>
            {item.nickname}
          </Text>
        </View>
        <Text style={styles.freeBoardTime}>
          {formatElapsed(item.createdAt)}
        </Text>
      </View>

      <Text style={styles.freeBoardContent} numberOfLines={2}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );
}

function FreeBoardEntryCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.freeBoardEntryCard} onPress={onPress}>
      <Text style={styles.freeBoardEntryText}>
        자유게시판에 글을 남겨보세요!
      </Text>
      <View style={styles.freeBoardEntryArrowBox}>
        <FreeBoardEntryArrowIcon width={rs(24)} height={rs(24)} />
      </View>
    </TouchableOpacity>
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
    <TouchableOpacity style={styles.pendingCard} onPress={onPress}>
      <View pointerEvents="none" style={styles.pendingCardShadow} />
      <View style={styles.pendingCardContent}>
        <Image
          source={{ uri: item.thumbnailImageUrl || item.imageUrl || "" }}
          style={styles.pendingImage}
        />
        <View style={styles.pendingFooter}>
          <PendingParticipantIcon width={rs(12.539)} height={rs(13.916)} />
          <Text style={styles.pendingFooterText}>
            {item.suggestionUserCount ?? 0}명 참여
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MenuIcon() {
  return (
    <Svg width={rs(17)} height={rs(17)} viewBox="0 0 17 17" fill="none">
      <Path
        d="M10.2002 2C11.8802 2 12.7206 2.00018 13.3623 2.32715C13.9265 2.61472 14.3853 3.07347 14.6729 3.6377C14.9998 4.27941 15 5.11978 15 6.7998V10.3818C15 12.062 14.9998 12.9022 14.6729 13.5439C14.3853 14.1082 13.9265 14.5669 13.3623 14.8545C12.7206 15.1815 11.8802 15.1816 10.2002 15.1816H6.7998C5.11978 15.1816 4.27941 15.1815 3.6377 14.8545C3.07346 14.5669 2.61471 14.1082 2.32715 13.5439C2.00017 12.9022 2 12.062 2 10.3818V6.7998C2 5.11978 2.00018 4.27941 2.32715 3.6377C2.61472 3.07347 3.07347 2.61472 3.6377 2.32715C4.27941 2.00018 5.11978 2 6.7998 2H10.2002ZM4.87109 11.126C4.59114 11.126 4.36434 11.3529 4.36426 11.6328C4.36426 11.9128 4.59109 12.1396 4.87109 12.1396H12.1299C12.4098 12.1396 12.6367 11.9128 12.6367 11.6328C12.6366 11.3529 12.4098 11.1261 12.1299 11.126H4.87109ZM4.87109 8.08398C4.5911 8.08398 4.36428 8.31083 4.36426 8.59082C4.36426 8.87082 4.59109 9.09766 4.87109 9.09766H12.1299C12.4098 9.09757 12.6367 8.87077 12.6367 8.59082C12.6367 8.31088 12.4098 8.08407 12.1299 8.08398H4.87109ZM4.87109 5.04199C4.59114 5.04199 4.36434 5.2689 4.36426 5.54883C4.36426 5.82883 4.59109 6.05566 4.87109 6.05566H12.1299C12.4098 6.05558 12.6367 5.82878 12.6367 5.54883C12.6366 5.26895 12.4098 5.04208 12.1299 5.04199H4.87109Z"
        fill="#FEFEFE"
      />
    </Svg>
  );
}

function BoardMenu({
  onPress,
}: {
  onPress: (key: "recent" | "popular" | "help" | "freeboard") => void;
}) {
  const gatherRows = [
    {
      key: "recent" as const,
      label: "최근에 올라온 새록",
      icon: <BoardRecentIcon width={rs(17)} height={rs(17)} />,
      color: "#91BFFF",
    },
    {
      key: "popular" as const,
      label: "요즘 인기 있는 새록",
      icon: <BoardPopularIcon width={rs(17)} height={rs(17)} />,
      color: "#F77965",
    },
    {
      key: "help" as const,
      label: "이 새 이름이 뭔가요?",
      icon: <BoardHelpIcon width={rs(17)} height={rs(17)} />,
      color: "#F7BE65",
    },
  ];

  return (
    <View style={styles.boardCard}>
      <Text style={styles.boardSectionLabel}>새록 모아보기</Text>
      {gatherRows.map((row) => (
        <TouchableOpacity
          key={row.key}
          style={styles.boardRow}
          onPress={() => onPress(row.key)}
        >
          <View style={[styles.boardRowIcon, { backgroundColor: row.color }]}>
            {row.icon}
          </View>
          <View style={styles.boardRowMain}>
            <Text style={styles.boardRowText}>{row.label}</Text>
            <View style={styles.boardNBadge}>
              <Text style={styles.boardNText}>N</Text>
            </View>
          </View>
          <InfoChevronIcon width={rs(13)} height={rs(13)} color="#979797" />
        </TouchableOpacity>
      ))}
      <View style={styles.boardSectionDivider} />
      <Text style={styles.boardSectionLabel}>자유게시판</Text>

      <TouchableOpacity
        style={styles.boardRow}
        onPress={() => onPress("freeboard")}
      >
        <View style={[styles.boardRowIcon, { backgroundColor: "#7AC6B5" }]}>
          <MenuIcon />
        </View>
        <Text style={styles.boardRowText}>도란도란</Text>
        <View style={styles.boardNBadge}>
          <Text style={styles.boardNText}>N</Text>
        </View>
        <InfoChevronIcon width={rs(13)} height={rs(13)} color="#979797" />
      </TouchableOpacity>
    </View>
  );
}

function AdBanner({
  slot,
  onPress,
}: {
  slot: AdSlotResponse | null;
  onPress: () => void;
}) {
  const ad = slot?.type === "AD" ? slot.ad : null;

  if (ad?.imageUrl) {
    return (
      <Pressable style={styles.adBanner} onPress={onPress}>
        <Image
          source={{ uri: ad.imageUrl }}
          style={styles.adImage}
          resizeMode="cover"
        />
        <View style={styles.adChip}>
          <Text style={styles.adChipText}>AD</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.adBannerFallback}>
      <View style={styles.adChip}>
        <Text style={styles.adChipText}>AD</Text>
      </View>
    </View>
  );
}

function PendingBirdSkeletonCard() {
  return (
    <View style={styles.pendingCard}>
      <View pointerEvents="none" style={styles.pendingCardShadow} />
      <View style={styles.pendingCardContent}>
        <View style={[styles.pendingImage, styles.skeletonBlock]} />
        <View style={styles.pendingFooter}>
          <View style={styles.pendingSkeletonIcon} />
          <View style={styles.pendingSkeletonText} />
        </View>
      </View>
    </View>
  );
}

function CollectionRowSkeleton() {
  return (
    <View style={styles.collectionSkeletonRow}>
      <View style={styles.collectionSkeletonLeft}>
        <View style={[styles.skeletonBlock, styles.collectionSkeletonTag]} />
        <View style={[styles.skeletonBlock, styles.collectionSkeletonTitle]} />
        <View style={[styles.skeletonBlock, styles.collectionSkeletonMeta]} />
        <View style={styles.collectionSkeletonUserRow}>
          <View style={[styles.skeletonBlock, styles.collectionSkeletonAvatar]} />
          <View style={[styles.skeletonBlock, styles.collectionSkeletonUser]} />
        </View>
      </View>
      <View style={styles.collectionSkeletonRight}>
        <View style={[styles.skeletonBlock, styles.collectionSkeletonThumb]} />
        <View style={styles.collectionSkeletonCountRow}>
          <View style={[styles.skeletonBlock, styles.collectionSkeletonCount]} />
          <View style={[styles.skeletonBlock, styles.collectionSkeletonCount]} />
        </View>
      </View>
    </View>
  );
}

function CollectionRowSkeletonList() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <View key={`collection-skeleton-${item}`}>
          <CollectionRowSkeleton />
          <View style={communityCollectionRowStyles.divider} />
        </View>
      ))}
    </>
  );
}

export default function NestHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const freeBoardScrollRef = useRef<ScrollView>(null);
  const freeBoardRawIndexRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MainData>(initialData);
  const [adSlot, setAdSlot] = useState<AdSlotResponse | null>(null);
  const [adImpressionLogged, setAdImpressionLogged] = useState(false);
  const [freeBoardPage, setFreeBoardPage] = useState(0);

  const loadCommunityMain = useCallback(
    async ({ keepLoading = false }: { keepLoading?: boolean } = {}) => {
      try {
        if (!keepLoading) {
          setLoading(true);
        }
        setError(null);

        const [communityMain, freeBoard] = await Promise.all([
          fetchCommunityMainApi(),
          fetchFreeBoardPostsApi({ page: 1, size: 5 }),
        ]);

        setData({
          recentCollections: communityMain.recentCollections ?? [],
          popularCollections: communityMain.popularCollections ?? [],
          pendingCollections:
            communityMain.pendingCollections ??
            communityMain.pendingBirdIdCollections ??
            [],
          freeBoardPosts: freeBoard.items ?? [],
        });
      } catch (e) {
        console.log("[NestHome] ERROR", e);
      } finally {
        if (!keepLoading) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [communityMain, freeBoard] = await Promise.all([
          fetchCommunityMainApi(),
          fetchFreeBoardPostsApi({ page: 1, size: 5 }),
        ]);

        if (!mounted) return;

        setData({
          recentCollections: communityMain.recentCollections ?? [],
          popularCollections: communityMain.popularCollections ?? [],
          pendingCollections:
            communityMain.pendingCollections ??
            communityMain.pendingBirdIdCollections ??
            [],
          freeBoardPosts: freeBoard.items ?? [],
        });
      } catch (e) {
        console.log("[NestHome] ERROR", e);
        if (mounted) setError("둥지 화면을 불러오지 못했어요.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCommunityMain({ keepLoading: true });
    }, [loadCommunityMain]),
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetchAdSlotApi(NEST_FREEBOARD_AD_SLOT);
        console.log("[NestHome] AD SLOT", JSON.stringify(res));
        if (mounted) {
          setAdSlot(res);
          setAdImpressionLogged(false);
        }
      } catch (e) {
        console.log("[NestHome] AD ERROR", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const ad = adSlot?.type === "AD" ? adSlot.ad : null;
    if (!ad || adImpressionLogged) return;

    let active = true;

    (async () => {
      try {
        await recordAdImpressionWithStoredDeviceApi({
          adId: ad.id,
          slotName: NEST_FREEBOARD_AD_SLOT,
        });
        if (active) setAdImpressionLogged(true);
      } catch (e) {
        console.log("[NestHome] AD IMPRESSION ERROR", e);
      }
    })();

    return () => {
      active = false;
    };
  }, [adImpressionLogged, adSlot]);

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
  const freeBoardBaseItems = useMemo<FreeBoardCarouselItem[]>(
    () => [
      ...data.freeBoardPosts.map((post) => ({
        type: "post" as const,
        key: `post-${post.postId}`,
        post,
      })),
      { type: "entry" as const, key: "entry" },
    ],
    [data.freeBoardPosts],
  );
  const freeBoardPageCount = freeBoardBaseItems.length;
  const freeBoardRenderedItems = useMemo<FreeBoardCarouselItem[]>(
    () =>
      Array.from({ length: 3 }).flatMap((_, repeatIndex) =>
        freeBoardBaseItems.map((item, itemIndex) => ({
          ...item,
          key: `${item.key}-repeat-${repeatIndex}-${itemIndex}`,
        })),
      ),
    [freeBoardBaseItems],
  );

  const handleAdPress = async () => {
    const ad = adSlot?.type === "AD" ? adSlot.ad : null;
    if (!ad?.targetUrl) return;

    try {
      await recordAdClickWithStoredDeviceApi({
        adId: ad.id,
        slotName: NEST_FREEBOARD_AD_SLOT,
      });
    } catch (e) {
      console.log("[NestHome] AD CLICK ERROR", e);
    }

    try {
      await Linking.openURL(ad.targetUrl);
    } catch (e) {
      console.log("[NestHome] AD LINK ERROR", e);
    }
  };

  const handleFreeBoardCardPress = useCallback(
    (postId: number) => {
      router.push("/nest/freeboard");

      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          router.push(`/nest/freeboard-detail/${postId}`);
        });
      });
    },
    [router],
  );

  const handleFreeBoardScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (freeBoardPageCount <= 0) return;

    const offsetX = event.nativeEvent.contentOffset.x;
    const nextRawIndex = Math.round(
      offsetX / (FREEBOARD_CARD_WIDTH + FREEBOARD_CARD_GAP),
    );
    const currentRawIndex = freeBoardRawIndexRef.current;
    const delta = Math.max(-1, Math.min(1, nextRawIndex - currentRawIndex));
    const rawIndex = currentRawIndex + delta;
    const normalizedIndex =
      ((rawIndex % freeBoardPageCount) + freeBoardPageCount) %
      freeBoardPageCount;

    freeBoardRawIndexRef.current = rawIndex;
    setFreeBoardPage(normalizedIndex);
    freeBoardScrollRef.current?.scrollTo({
      x: rawIndex * (FREEBOARD_CARD_WIDTH + FREEBOARD_CARD_GAP),
      animated: true,
    });

    const lowerBound = freeBoardPageCount;
    const upperBound = freeBoardPageCount * 2 - 1;
    if (rawIndex < lowerBound || rawIndex > upperBound) {
      const recenteredIndex = freeBoardPageCount + normalizedIndex;
      freeBoardRawIndexRef.current = recenteredIndex;
      requestAnimationFrame(() => {
        freeBoardScrollRef.current?.scrollTo({
          x: recenteredIndex * (FREEBOARD_CARD_WIDTH + FREEBOARD_CARD_GAP),
          animated: false,
        });
      });
    }
  };

  useEffect(() => {
    if (freeBoardPageCount <= 1) return;

    const timer = setInterval(() => {
      const nextRawIndex = freeBoardRawIndexRef.current + 1;
      freeBoardRawIndexRef.current = nextRawIndex;
      freeBoardScrollRef.current?.scrollTo({
        x: nextRawIndex * (FREEBOARD_CARD_WIDTH + FREEBOARD_CARD_GAP),
        animated: true,
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [freeBoardPageCount]);

  useEffect(() => {
    if (freeBoardPageCount <= 0) return;

    const initialIndex = freeBoardPageCount;
    freeBoardRawIndexRef.current = initialIndex;
    setFreeBoardPage(0);

    requestAnimationFrame(() => {
      freeBoardScrollRef.current?.scrollTo({
        x: initialIndex * (FREEBOARD_CARD_WIDTH + FREEBOARD_CARD_GAP),
        animated: false,
      });
    });
  }, [freeBoardPageCount]);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#F9E2BE", "#F3F3F3"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.safeAreaFill, { height: insets.top + rs(206) }]}
      />

      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          style={[styles.container, { marginBottom: insets.bottom }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#F9E2BE", "#F3F3F3"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroSection}
          >
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push("/nest/search")}
            >
              <NestSearchIcon width={rs(17)} height={rs(17)} />
              <Text style={styles.searchPlaceholder}>
                장소, 사용자, 새 이름을 검색해보세요!
              </Text>
              <SearchClearIcon width={rs(17)} height={rs(17)} />
            </TouchableOpacity>

            <ScrollView
              ref={freeBoardScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.freeBoardList}
              snapToInterval={FREEBOARD_CARD_WIDTH + FREEBOARD_CARD_GAP}
              snapToAlignment="start"
              disableIntervalMomentum
              decelerationRate="fast"
              onMomentumScrollEnd={handleFreeBoardScrollEnd}
            >
              {freeBoardRenderedItems.map((item) =>
                item.type === "post" ? (
                  <FreeBoardCard
                    key={item.key}
                    item={item.post}
                    onPress={() => handleFreeBoardCardPress(item.post.postId)}
                  />
                ) : (
                  <FreeBoardEntryCard
                    key={item.key}
                    onPress={() => router.push("/nest/freeboard")}
                  />
                ),
              )}
            </ScrollView>

            <View style={styles.freeBoardPagination}>
              {Array.from({ length: freeBoardPageCount }).map((_, index) => (
                <View
                  key={`freeboard-page-${index}`}
                  style={[
                    styles.freeBoardPaginationDot,
                    index === freeBoardPage &&
                      styles.freeBoardPaginationDotActive,
                  ]}
                />
              ))}
            </View>
          </LinearGradient>

          <View style={styles.pendingSection}>
            {/* 임시로 광고 렌더 구역 숨김 */}
            {false ? (
              <View style={styles.boardTopAdWrap}>
                <AdBanner slot={adSlot} onPress={handleAdPress} />
              </View>
            ) : null}

            <BoardMenu
              onPress={(key) => {
                if (key === "recent") router.push("/nest/recent");
                if (key === "popular") router.push("/nest/popular");
                if (key === "help") router.push("/nest/help");
                if (key === "freeboard") router.push("/nest/freeboard");
              }}
            />

            <SectionHeader
              title="이 새 이름이 뭔가요?"
              onPressMore={() => router.push("/nest/help")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pendingListScroll}
              contentContainerStyle={styles.pendingList}
            >
              {loading
                ? [0, 1, 2, 3].map((item) => (
                    <PendingBirdSkeletonCard
                      key={`pending-skeleton-${item}`}
                    />
                  ))
                : pendingTop.map((item) => (
                    <PendingBirdCard
                      key={item.collectionId}
                      item={item}
                      onPress={() => {
                        const {
                          openSaerokDetail,
                        } = require("@/lib/navigation");
                        openSaerokDetail(router, item.collectionId, {
                          from: "nest_pending",
                        });
                      }}
                    />
                  ))}
              {!loading && pendingTop.length === 0 ? (
                <View style={styles.pendingEmpty}>
                  <Text style={styles.pendingEmptyText}>
                    동정 요청이 없어요.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.sectionHeaderPadding}>
              <SectionHeader
                title="최근에 올라온 새록"
                onPressMore={() => router.push("/nest/recent")}
              />
            </View>
            <View style={communityCollectionRowStyles.card}>
              {loading ? (
                <CollectionRowSkeletonList />
              ) : (
                recentTop.map((item, index) => (
                  <View key={`recent-${item.collectionId}`}>
                    <CommunityCollectionRow
                      item={item}
                      variant="recent"
                      onPress={() => {
                        const {
                          openSaerokDetail,
                        } = require("@/lib/navigation");
                        openSaerokDetail(router, item.collectionId, {
                          from: "nest_recent",
                        });
                      }}
                    />
                    {index < recentTop.length - 1 ? (
                      <View style={communityCollectionRowStyles.divider} />
                    ) : null}
                  </View>
                ))
              )}
              {!loading && !!recentTop.length ? (
                <View style={communityCollectionRowStyles.divider} />
              ) : null}
              {!loading && recentTop.length === 0 ? (
                <Text style={communityCollectionRowStyles.placeholder}>
                  최근에 올라온 새록이 없어요.
                </Text>
              ) : null}
            </View>

            <View style={styles.sectionHeaderPadding}>
              <SectionHeader
                title="요즘 인기 있는 새록"
                onPressMore={() => router.push("/nest/popular")}
              />
            </View>
            <View style={communityCollectionRowStyles.card}>
              {loading ? (
                <CollectionRowSkeletonList />
              ) : (
                popularTop.map((item, index) => (
                  <View key={`popular-${item.collectionId}`}>
                    <CommunityCollectionRow
                      item={item}
                      variant="popular"
                      onPress={() => {
                        const {
                          openSaerokDetail,
                        } = require("@/lib/navigation");
                        openSaerokDetail(router, item.collectionId, {
                          from: "nest_popular",
                        });
                      }}
                    />
                    {index < popularTop.length - 1 ? (
                      <View style={communityCollectionRowStyles.divider} />
                    ) : null}
                  </View>
                ))
              )}
              {!loading && !!popularTop.length ? (
                <View style={communityCollectionRowStyles.divider} />
              ) : null}
              {!loading && popularTop.length === 0 ? (
                <Text style={communityCollectionRowStyles.placeholder}>
                  인기 있는 새록이 아직 없어요.
                </Text>
              ) : null}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
      <NestWriteFab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  safeAreaFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  contentContainer: {
    backgroundColor: "#FEFEFE",
  },
  heroSection: {
    paddingTop: rs(20),
    paddingBottom: rs(18),
  },
  searchBar: {
    marginHorizontal: rs(24),
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
  searchPlaceholder: {
    flex: 1,
    color: "#DAE0DE",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  freeBoardList: {
    paddingTop: rs(17),
    paddingLeft: rs(24),
    gap: rs(12),
    alignItems: "flex-start",
  },
  freeBoardCard: {
    width: FREEBOARD_CARD_WIDTH,
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
    paddingTop: rs(10),
    paddingBottom: rs(10),
    paddingLeft: rs(14),
    paddingRight: rs(14),
    flexDirection: "column",
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
  },
  freeBoardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  freeBoardUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    flex: 1,
  },
  freeBoardNickname: {
    flex: 1,
    color: "#0d0d0d",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  freeBoardTime: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  freeBoardContent: {
    marginTop: rs(10),
    color: "#6D6D6D",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    minHeight: rfs(16),
  },
  freeBoardEntryCard: {
    width: FREEBOARD_CARD_WIDTH,
    height: rs(83),
    borderRadius: rs(20),
    backgroundColor: "#fefefe",
    paddingTop: rs(22),
    paddingBottom: rs(21),
    paddingLeft: rs(46),
    paddingRight: rs(49),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
  },
  freeBoardEntryText: {
    flex: 1,
    color: "#0D0D0D",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  freeBoardEntryArrowBox: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(10),
    backgroundColor: "#DAE0DE",
    alignItems: "center",
    justifyContent: "center",
  },
  freeBoardPagination: {
    marginTop: rs(13),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(5),
  },
  freeBoardPaginationDot: {
    width: rs(7),
    height: rs(7),
    borderRadius: rs(999),
    backgroundColor: "#fefefe",
  },
  freeBoardPaginationDotActive: {
    backgroundColor: "#4190FF",
  },
  boardTopAdWrap: {
    marginTop: rs(15),
    minHeight: rs(52),
    justifyContent: "center",
  },
  pendingSection: {
    backgroundColor: "transparent",
    paddingHorizontal: rs(24),
    paddingBottom: rs(10),
  },
  pendingListScroll: {
    marginHorizontal: -rs(24),
  },
  sectionHeader: {
    marginTop: rs(31),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#0D0D0D",
    fontSize: rfs(20),
    lineHeight: rfs(24),
    fontWeight: "700",
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
  },
  moreText: {
    color: "#6D6D6D",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "700",
  },
  pendingList: {
    paddingTop: rs(14),
    paddingLeft: rs(24),
    paddingRight: rs(24),
    paddingBottom: rs(8),
    gap: rs(10),
  },
  pendingCard: {
    width: rs(107),
    height: rs(127),
    borderRadius: rs(20),
    position: "relative",
    overflow: "visible",
  },
  pendingCardShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: rs(8),
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  pendingCardContent: {
    paddingHorizontal: rs(5),
    paddingVertical: rs(5),
  },
  pendingImage: {
    width: rs(97),
    height: rs(97),
    borderTopLeftRadius: rs(15),
    borderTopRightRadius: rs(15),
    borderBottomLeftRadius: rs(5),
    borderBottomRightRadius: rs(5),
  },
  pendingFooter: {
    marginTop: rs(4),
    alignSelf: "flex-end",
    paddingRight: rs(6),
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(3),
  },
  pendingFooterText: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  skeletonBlock: {
    backgroundColor: "#E8ECEB",
  },
  pendingSkeletonIcon: {
    width: rs(13),
    height: rs(13),
    borderRadius: rs(7),
    backgroundColor: "#E8ECEB",
  },
  pendingSkeletonText: {
    width: rs(44),
    height: rs(12),
    borderRadius: rs(6),
    backgroundColor: "#E8ECEB",
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
    lineHeight: rfs(16),
  },
  sectionHeaderPadding: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(18),
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  mainContent: {
    backgroundColor: "#FEFEFE",
    marginTop: rs(-10),
  },
  adBanner: {
    height: rs(52),
    borderRadius: rs(10),
    overflow: "hidden",
    backgroundColor: "#fefefe",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  adBannerFallback: {
    height: rs(52),
    borderRadius: rs(10),
    backgroundColor: "#fefefe",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DAE0DE",
  },
  adChip: {
    position: "absolute",
    top: rs(7),
    right: rs(7),
    minWidth: rs(29),
    height: rs(16),
    paddingHorizontal: rs(7),
    borderRadius: rs(5),
    backgroundColor: "#fefefe",
    borderWidth: 0.35,
    borderColor: "#DAE0DE",
    alignItems: "center",
    justifyContent: "center",
  },
  adChipText: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  registerPreviewButton: {
    borderRadius: rs(12),
    backgroundColor: "#111827",
    paddingVertical: rs(14),
    paddingHorizontal: rs(16),
    alignItems: "center",
    justifyContent: "center",
  },
  registerPreviewButtonText: {
    color: "#FFFFFF",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "700",
  },
  boardCard: {
    marginTop: rs(15),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#FEFEFE",
    paddingTop: rs(14),
    paddingLeft: rs(15),
    paddingRight: rs(10),
  },
  boardSectionLabel: {
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
    marginBottom: rs(10),
  },
  boardSectionDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
    marginBottom: rs(13),
  },
  boardRow: {
    minHeight: rs(25),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(9),
    marginBottom: rs(13),
  },
  boardRowIcon: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(8),
    alignItems: "center",
    justifyContent: "center",
  },
  boardRowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
  },
  boardRowText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(20),
    fontWeight: "600",
  },
  boardNBadge: {
    width: rs(11),
    height: rs(11),
    borderRadius: rs(3),
    backgroundColor: "#FF234F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "auto",
  },
  boardNText: {
    color: "#FFFFFF",
    fontSize: rfs(7),
    lineHeight: rfs(7),
    fontWeight: "700",
  },
  collectionSkeletonRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: rs(10),
    paddingLeft: rs(22),
    paddingRight: rs(24),
    paddingTop: rs(13),
    paddingBottom: rs(8),
  },
  collectionSkeletonLeft: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  collectionSkeletonRight: {
    width: rs(89),
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  collectionSkeletonTag: {
    width: rs(74),
    height: rs(24),
    borderRadius: rs(8),
  },
  collectionSkeletonTitle: {
    width: "82%",
    height: rs(17),
    borderRadius: rs(8),
    marginTop: rs(8),
  },
  collectionSkeletonMeta: {
    width: "58%",
    height: rs(13),
    borderRadius: rs(7),
    marginTop: rs(8),
  },
  collectionSkeletonUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    marginBottom: rs(4),
    marginTop: rs(16),
  },
  collectionSkeletonAvatar: {
    width: rs(21),
    height: rs(21),
    borderRadius: rs(16),
  },
  collectionSkeletonUser: {
    width: rs(72),
    height: rs(13),
    borderRadius: rs(7),
  },
  collectionSkeletonThumb: {
    width: rs(89),
    height: rs(89),
    borderRadius: rs(13),
  },
  collectionSkeletonCountRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: rs(12),
    marginTop: rs(8),
    marginRight: rs(2),
  },
  collectionSkeletonCount: {
    width: rs(28),
    height: rs(13),
    borderRadius: rs(7),
  },
  errorText: {
    color: "#D90000",
    fontSize: rfs(13),
    lineHeight: rfs(16),
  },
});
