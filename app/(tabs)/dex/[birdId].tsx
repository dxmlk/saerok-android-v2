import React, { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import BackButtonIcon from "@/assets/icon/button/BackButtonIcon";
import ScrapIcon from "@/assets/icon/button/ScrapIcon";
import AddSaerokDexIcon from "@/assets/icon/button/AddSaerokDexIcon";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import HabitatIcon from "@/assets/icon/icon/HabitatIcon";
import SeasonIcon from "@/assets/icon/icon/SeasonIcon";
import SizeIcon from "@/assets/icon/icon/SizeIcon";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchBookmarkStatusApi,
  fetchDexDetailApi,
  toggleBookmarkApi,
} from "@/services/api/birds";
import { useDexBookmarksState } from "@/states/useDexBookmarksState";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";

const TAB_BAR_HEIGHT = rs(60);

const seasonMap: Record<string, string> = {
  SPRING: "봄",
  SUMMER: "여름",
  AUTUMN: "가을",
  WINTER: "겨울",
};

const habitatMap: Record<string, string> = {
  MUDFLAT: "갯벌",
  FARMLAND: "경작지/초지",
  FOREST: "산림/공원",
  MARINE: "해양",
  RESIDENTAIL: "거주지",
  RESIDENTIAL: "거주지",
  PLAINS_FOREST: "평지/산림",
  RIVER_LAKE: "하천/호수",
  ARTIFICIAL: "인공시설",
  CAVE: "동굴",
  WETLAND: "습지",
  OTHERS: "기타",
};

const sizeCategoryMap: Record<string, string> = {
  XSMALL: "참새 크기",
  SMALL: "비둘기 크기",
  MEDIUM: "오리 크기",
  LARGE: "기러기 크기",
  xsmall: "참새 크기",
  small: "비둘기 크기",
  medium: "오리 크기",
  large: "기러기 크기",
};

function mapJoin(values: string[] | undefined, mapper: Record<string, string>) {
  if (!values?.length) return "";
  return values.map((v) => mapper[v] ?? v).join(" · ");
}

function getClassificationText(bird: any): string {
  const t = bird?.taxonomy;
  if (t && typeof t === "object") {
    const parts = [t.orderKor, t.familyKor, t.speciesKor].filter(Boolean);
    if (parts.length) return parts.join("  >  ");
  }
  return "-";
}

export default function DexDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAuth();
  const { birdId, returnTo, returnMode, returnCollectionId, returnQ } =
    useLocalSearchParams<{
      birdId: string;
      returnTo?: string;
      returnMode?: string;
      returnCollectionId?: string;
      returnQ?: string;
    }>();

  const numericId = useMemo(() => {
    const n = Number(birdId);
    return Number.isFinite(n) ? n : null;
  }, [birdId]);

  const handleBack = () => {
    if (returnTo === "/saerok/search-bird") {
      router.replace({
        pathname: "/saerok/search-bird",
        params: {
          mode: returnMode,
          collectionId: returnCollectionId,
          q: returnQ,
        },
      });
      return;
    }
    if (returnTo === "/saerok/[collectionId]" && returnCollectionId) {
      router.dismissTo({
        pathname: "/saerok/[collectionId]",
        params: { collectionId: returnCollectionId },
      });
      return;
    }
    router.back();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onHardwareBack = () => {
        if (
          returnTo === "/saerok/search-bird" ||
          (returnTo === "/saerok/[collectionId]" && !!returnCollectionId)
        ) {
          handleBack();
          return true;
        }
        return false;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBack,
      );
      return () => sub.remove();
    }, [returnCollectionId, returnMode, returnQ, returnTo]),
  );

  const [bird, setBird] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const bookmarkedIds = useDexBookmarksState((state) => state.bookmarkedIds);
  const setBookmarked = useDexBookmarksState((state) => state.setBookmarked);
  const bookmarked = numericId ? bookmarkedIds.has(numericId) : false;

  useEffect(() => {
    if (!numericId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchDexDetailApi(numericId);
        if (cancelled) return;
        setBird(res.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [numericId]);

  useEffect(() => {
    if (!numericId) return;
    if (!isLoggedIn) {
      setBookmarked(numericId, false);
      return;
    }

    fetchBookmarkStatusApi(numericId)
      .then((res) => setBookmarked(numericId, !!res.data?.bookmarked))
      .catch(() => {});
  }, [isLoggedIn, numericId, setBookmarked]);

  useEffect(() => {
    const uri =
      bird?.imageUrls?.[0] ?? bird?.thumbImageUrl ?? bird?.thumbnailImageUrl;
    if (!uri) {
      setImageRatio(null);
      return;
    }
    Image.getSize(
      uri,
      (w, h) => {
        if (w && h) setImageRatio(w / h);
      },
      () => setImageRatio(null),
    );
  }, [bird?.imageUrls, bird?.thumbImageUrl, bird?.thumbnailImageUrl]);

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={["left", "right"]}>
        <View
          style={[styles.imageSection, { paddingTop: insets.top + rs(20) }]}
        >
          <View style={styles.imageWrap}>
            <View style={[styles.mainImage, styles.mainImageFallback]} />
          </View>
        </View>
        <View style={styles.dexSkeletonBody}>
          <View style={styles.dexSkeletonTitle} />
          <View style={styles.dexSkeletonLine} />
          <View style={styles.dexSkeletonLineShort} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bird) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={styles.emptyText}>불러오지 못했어요.</Text>
      </SafeAreaView>
    );
  }

  const mainImageUri =
    bird.imageUrls?.[0] ?? bird.thumbImageUrl ?? bird.thumbnailImageUrl ?? "";
  const seasonText = mapJoin(
    (bird.seasonsWithRarity ?? []).map((s: any) => s.season),
    seasonMap,
  );
  const habitatText = mapJoin(bird.habitats ?? [], habitatMap);
  const sizeText =
    sizeCategoryMap[bird.sizeCategory] ?? bird.sizeCategory ?? "비둘기 크기";
  const classificationText = getClassificationText(bird);

  return (
    <SafeAreaView style={styles.root} edges={["left", "right"]}>
      <ScrollView
        style={{ marginBottom: insets.bottom + TAB_BAR_HEIGHT }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[styles.imageSection, { paddingTop: insets.top + rs(20) }]}
        >
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: mainImageUri }}
              resizeMode="contain"
              style={[
                styles.mainImage,
                imageRatio
                  ? { aspectRatio: imageRatio }
                  : styles.mainImageFallback,
              ]}
            />
          </View>

          <View style={styles.chipsRow}>
            {!!seasonText && (
              <View style={styles.chip}>
                <SeasonIcon width={rs(24)} height={rs(24)} color="#FEFEFE" />
                <Text style={styles.chipText}>{seasonText}</Text>
              </View>
            )}
            {!!habitatText && (
              <View style={styles.chip}>
                <HabitatIcon width={rs(24)} height={rs(24)} color="#FEFEFE" />
                <Text style={styles.chipText}>{habitatText}</Text>
              </View>
            )}
            {!!sizeText && (
              <View style={styles.chip}>
                <SizeIcon width={rs(24)} height={rs(24)} color="#FEFEFE" />
                <Text style={styles.chipText}>{sizeText}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.koreanName}>{bird.koreanName}</Text>
          <Text style={styles.scientificName}>{bird.scientificName}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>분류</Text>
          <Text style={styles.classificationText}>{classificationText}</Text>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionLabel}>상세설명</Text>
          <Text style={styles.descriptionText}>{bird.description ?? "-"}</Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.topBar,
          styles.topBarFloating,
          { top: insets.top + rs(30) },
        ]}
      >
        <TouchableOpacity onPress={handleBack} hitSlop={12}>
          <View style={styles.topCircleBtn}>
            <BackButtonIcon size={rs(48)} />
          </View>
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            onPress={() => {
              if (!isLoggedIn) {
                router.push("/login");
                return;
              }
              const nextBookmarked = !bookmarked;
              setBookmarked(bird.id, nextBookmarked);
              toggleBookmarkApi(bird.id).catch(() =>
                setBookmarked(bird.id, bookmarked),
              );
            }}
            hitSlop={8}
          >
            <View style={styles.topCircleBtn}>
              <ScrapIcon
                width={rs(17)}
                height={rs(24)}
                stroke={bookmarked ? "#F7BE65" : "#0D0D0D"}
                fill={bookmarked ? "#F7BE65" : "none"}
                strokeWidth={2}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!isLoggedIn) {
                router.push("/login");
                return;
              }
              router.push({
                pathname: "/saerok/write",
                params: {
                  birdId: String(bird.id),
                  birdName: bird.koreanName,
                },
              });
            }}
            hitSlop={8}
          >
            <View style={styles.topCircleBtn}>
              <AddSaerokDexIcon
                width={rs(24)}
                height={rs(23)}
                color="#0D0D0D"
                strokeWidth={2}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
  },
  emptyText: {
    color: "#979797",
    fontSize: rfs(14),
  },
  scrollContent: {
    paddingBottom: rs(60),
  },
  topBar: {
    paddingHorizontal: rs(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarFloating: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },
  topCircleBtn: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  imageSection: {
    paddingHorizontal: rs(9),
  },
  imageWrap: {
    position: "relative",
    borderRadius: rs(20),
    overflow: "hidden",
    backgroundColor: "#F2F2F2",
  },
  mainImage: {
    width: "100%",
    backgroundColor: "#F2F2F2",
  },
  mainImageFallback: {
    aspectRatio: 1,
  },
  dexSkeletonBody: {
    marginHorizontal: rs(24),
    marginTop: rs(24),
    gap: rs(10),
  },
  dexSkeletonTitle: {
    width: "46%",
    height: rs(24),
    borderRadius: rs(12),
    backgroundColor: "#E5E7EB",
  },
  dexSkeletonLine: {
    width: "72%",
    height: rs(16),
    borderRadius: rs(8),
    backgroundColor: "#E5E7EB",
  },
  dexSkeletonLineShort: {
    width: "50%",
    height: rs(16),
    borderRadius: rs(8),
    backgroundColor: "#E5E7EB",
  },
  chipsRow: {
    marginTop: rs(13),
    marginLeft: rs(15),
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: rs(6),
  },
  chip: {
    paddingTop: rs(9),
    paddingBottom: rs(9),
    paddingLeft: rs(12),
    paddingRight: rs(15),
    borderRadius: rs(30.5),
    backgroundColor: "#91BFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  chipText: {
    color: "#FEFEFE",
    textAlign: "center",
    fontFamily: font.semibold,
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  nameBlock: {
    marginTop: rs(42),
    alignItems: "center",
  },
  koreanName: {
    color: "#0D0D0D",
    textAlign: "center",
    fontFamily: font.money,
    fontSize: rfs(20),
    fontWeight: "400",
    lineHeight: rfs(22),
  },
  scientificName: {
    marginTop: rs(2),
    color: "#979797",
    textAlign: "center",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  sectionCard: {
    marginTop: rs(40),
    marginHorizontal: rs(9),
    paddingHorizontal: rs(20),
    paddingTop: rs(13),
    paddingBottom: rs(14),
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
  },
  descriptionCard: {
    marginTop: rs(7),
    marginHorizontal: rs(9),
    paddingHorizontal: rs(20),
    paddingTop: rs(13),
    paddingBottom: rs(14),
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
  },
  sectionLabel: {
    color: "#979797",
    fontSize: rfs(12),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  classificationText: {
    marginTop: rs(5),
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  descriptionText: {
    marginTop: rs(7),
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(25),
  },
});
