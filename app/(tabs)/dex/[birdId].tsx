import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Pressable,
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

import {
  fetchBookmarkStatusApi,
  fetchDexDetailApi,
  toggleBookmarkApi,
} from "@/services/api/birds";
import BackButtonIcon from "@/assets/icon/button/BackButtonIcon";
import ScrapIcon from "@/assets/icon/button/ScrapIcon";
import AddSaerokDexIcon from "@/assets/icon/button/AddSaerokDexIcon";
import SeasonIcon from "@/assets/icon/icon/SeasonIcon";
import HabitatIcon from "@/assets/icon/icon/HabitatIcon";
import SizeIcon from "@/assets/icon/icon/SizeIcon";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";

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
    const parts = [
      t.phylumKor,
      t.classKor,
      t.orderKor,
      t.familyKor,
      t.genusKor,
      t.speciesKor,
    ].filter(Boolean);
    if (parts.length) return parts.join(" > ");
  }
  return "-";
}

export default function DexDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    }, [returnTo, returnMode, returnCollectionId, returnQ]),
  );

  const [bird, setBird] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [imageRatio, setImageRatio] = useState<number | null>(null);

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
    fetchBookmarkStatusApi(numericId)
      .then((res) => setBookmarked(!!res.data?.bookmarked))
      .catch(() => {});
  }, [numericId]);

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
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator />
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.imageSection, { paddingTop: rs(34) }]}>
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

            <Pressable
              onPress={() => {
                setBookmarked((prev) => !prev);
                toggleBookmarkApi(bird.id).catch(() =>
                  setBookmarked((prev) => !prev),
                );
              }}
              style={styles.overlayBtnBottomRightLeft}
              hitSlop={8}
            >
              <View style={styles.overlayCircle}>
                <ScrapIcon
                  width={rs(17)}
                  height={rs(24)}
                  stroke={bookmarked ? "#F7BE65" : "#0D0D0D"}
                  fill={bookmarked ? "#F7BE65" : "none"}
                  strokeWidth={1.5}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/saerok/write",
                  params: {
                    birdId: String(bird.id),
                    birdName: bird.koreanName,
                  },
                })
              }
              style={styles.overlayBtnBottomRight}
              hitSlop={8}
            >
              <View style={styles.overlayCircle}>
                <AddSaerokDexIcon
                  width={rs(24)}
                  height={rs(23)}
                  color="#0D0D0D"
                />
              </View>
            </Pressable>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>분류</Text>
          <Text style={styles.classificationText}>{classificationText}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세설명</Text>
          <Text style={styles.descriptionText}>{bird.description ?? "-"}</Text>
        </View>
      </ScrollView>

      <Pressable
        onPress={handleBack}
        style={[styles.floatingBackBtn, { top: insets.top + rs(20) }]}
        hitSlop={12}
      >
        <BackButtonIcon size={rs(40)} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  emptyText: {
    color: "#979797",
    fontSize: rfs(14),
  },
  scrollContent: {
    paddingBottom: rs(100),
  },
  imageSection: {
    paddingHorizontal: rs(16),
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
  overlayBtnBottomRightLeft: {
    position: "absolute",
    right: rs(56),
    bottom: rs(12),
  },
  overlayBtnBottomRight: {
    position: "absolute",
    right: rs(12),
    bottom: rs(12),
  },
  overlayCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "rgba(254,254,254,0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  floatingBackBtn: {
    position: "absolute",
    left: rs(28),
    zIndex: 10,
  },
  chipsRow: {
    marginTop: rs(16),
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
    fontStyle: "normal",
    lineHeight: rfs(18),
    fontWeight: "600",
  },
  nameBlock: {
    marginTop: rs(37),
    alignItems: "center",
    paddingHorizontal: rs(24),
  },
  koreanName: {
    color: "#0D0D0D",
    textAlign: "center",
    fontFamily: font.money,
    fontSize: rfs(20),
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: rfs(22),
  },
  scientificName: {
    marginTop: rs(2),
    color: "#979797",
    textAlign: "center",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  section: {
    marginTop: rs(40),
    paddingHorizontal: rs(25),
  },
  sectionTitle: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(18),
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  classificationText: {
    marginTop: rs(14),
    color: "#6D6D6D",
    fontFamily: font.regular,
    fontSize: rfs(13),
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  descriptionText: {
    marginTop: rs(14),
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: rfs(25),
  },
});
