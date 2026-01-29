import {
  fetchBookmarkStatusApi,
  fetchDexDetailApi,
  toggleBookmarkApi,
} from "@/services/api/birds";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ArrowLeftIcon from "@/assets/icon/button/arrow-left.svg";
import BracketIcon from "@/assets/icon/button/bracket.svg";
import HabitatIcon from "@/assets/icon/button/habitat.svg";
import ScrapIcon from "@/assets/icon/button/scrap.svg";
import SeasonIcon from "@/assets/icon/button/season.svg";
import SizeIcon from "@/assets/icon/button/size.svg";

// PNG (require 형태 추천)
const addSaerokPng = require("@/assets/icon/button/write.png");

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

function joinWithSeparator(
  items: string[],
  map: Record<string, string>,
  separator: string,
) {
  return items.map((x) => map[x] || x).join(separator);
}

interface TaxonomyType {
  orderKor: string;
  familyKor: string;
  genusKor: string;
}

interface SeasonsWithRarityType {
  season: string;
  rarity: string;
  priority: number;
}

interface BirdDetail {
  id: number;
  koreanName: string;
  scientificName: string;
  taxonomy: TaxonomyType;
  description: string;
  imageUrls: string[];
  sizeCategory: string;
  habitats: string[];
  seasonsWithRarity: SeasonsWithRarityType[];
}

export default function DexDetailScreen() {
  const router = useRouter();
  const { birdId } = useLocalSearchParams<{ birdId: string }>();

  const numericId = useMemo(() => {
    const n = Number(birdId);
    return Number.isFinite(n) ? n : null;
  }, [birdId]);

  const [bird, setBird] = useState<BirdDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 북마크는 401 가능성이 높으니 "UI만" 유지되게
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!numericId) {
        setError("잘못된 birdId 입니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetchDexDetailApi(numericId);
        setBird(res.data);
      } catch {
        setError("존재하지 않는 새입니다.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [numericId]);

  useEffect(() => {
    const run = async () => {
      if (!numericId) return;
      try {
        const res = await fetchBookmarkStatusApi(numericId);
        setBookmarked(!!res.data?.bookmarked);
      } catch {
        // 로그인 안 된 경우 401 나도 앱 안 깨지게 조용히 무시
      }
    };
    run();
  }, [numericId]);

  const seasonText = useMemo(() => {
    if (!bird) return "";
    const seasons = bird.seasonsWithRarity?.map((s) => s.season) ?? [];
    return seasons.length ? joinWithSeparator(seasons, seasonMap, " • ") : "";
  }, [bird]);

  const habitatText = useMemo(() => {
    if (!bird) return "";
    const habitats = bird.habitats ?? [];
    return habitats.length
      ? joinWithSeparator(habitats, habitatMap, " • ")
      : "";
  }, [bird]);

  const onToggleBookmark = async () => {
    if (!bird || bookmarkBusy) return;

    setBookmarkBusy(true);
    // 낙관적 업데이트
    setBookmarked((prev) => !prev);

    try {
      await toggleBookmarkApi(bird.id);
    } catch {
      // 실패 롤백 (현재 401이면 여기 걸림)
      setBookmarked((prev) => !prev);
    } finally {
      setBookmarkBusy(false);
    }
  };

  const onAddSaerok = () => {
    if (!bird) return;
    // ✅ RN에서는 navigate state 대신 route param이나 store 추천
    // 일단 간단히 query로 넘깁니다.
    router.push({
      pathname: "/saerok/write",
      params: { birdId: String(bird.id), birdName: bird.koreanName },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: "#666" }}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !bird) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text style={{ color: "#111" }}>{error ?? "데이터가 없습니다."}</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 14 }}>
            <Text style={{ color: "#2563eb" }}>뒤로가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const heroUrl = bird.imageUrls?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          {/* Hero Image */}
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: heroUrl }}
              style={{ width: "100%", height: 260, borderRadius: 20 }}
              resizeMode="cover"
            />

            {/* Back */}
            <Pressable
              onPress={() => router.back()}
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeftIcon width={17} height={17} />
            </Pressable>

            {/* Bookmark */}
            <Pressable
              onPress={onToggleBookmark}
              style={{
                position: "absolute",
                bottom: 12,
                right: 56,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ScrapIcon
                width={24}
                height={24}
                // svg가 currentColor 기반이면 이 방식이 먹습니다
                color={bookmarked ? "#F6C343" : "#111"}
              />
            </Pressable>

            {/* Add Saerok */}
            <Pressable
              onPress={onAddSaerok}
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={addSaerokPng}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          {/* Chips row (horizontal) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 16 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
          >
            {!!seasonText && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  height: 33,
                  borderRadius: 999,
                  backgroundColor: "#2563eb",
                }}
              >
                <SeasonIcon width={17} height={17} />
                <Text style={{ color: "white", fontSize: 12 }}>
                  {seasonText}
                </Text>
              </View>
            )}

            {!!habitatText && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  height: 33,
                  borderRadius: 999,
                  backgroundColor: "#2563eb",
                }}
              >
                <HabitatIcon width={17} height={17} />
                <Text style={{ color: "white", fontSize: 12 }}>
                  {habitatText}
                </Text>
              </View>
            )}

            {!!bird.sizeCategory && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  height: 33,
                  borderRadius: 999,
                  backgroundColor: "#2563eb",
                }}
              >
                <SizeIcon width={17} height={17} />
                <Text style={{ color: "white", fontSize: 12 }}>
                  {bird.sizeCategory}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Names */}
        <View style={{ marginTop: 26, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#111" }}>
            {bird.koreanName}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 13, color: "#6b7280" }}>
            {bird.scientificName}
          </Text>
        </View>

        {/* Taxonomy */}
        <View style={{ marginTop: 28, paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
            분류
          </Text>

          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Text style={{ color: "#374151", fontSize: 12 }}>
              {bird.taxonomy?.orderKor}
            </Text>
            <View style={{ marginHorizontal: 6 }}>
              <BracketIcon width={12} height={12} />
            </View>
            <Text style={{ color: "#374151", fontSize: 12 }}>
              {bird.taxonomy?.familyKor}
            </Text>
            <View style={{ marginHorizontal: 6 }}>
              <BracketIcon width={12} height={12} />
            </View>
            <Text style={{ color: "#374151", fontSize: 12 }}>
              {bird.taxonomy?.genusKor}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={{ marginTop: 22, paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
            상세 설명
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "#111",
              lineHeight: 20,
            }}
          >
            {bird.description}
          </Text>
        </View>

        {/* ScrollToTopButton은 기존 컴포넌트가 ScrollView ref 기반이면 별도 작업 필요.
            지금은 DexMain에만 있으니 DexDetail에선 우선 스킵하거나,
            추후 "scrollRef 전달" 버전으로 개선 추천 */}
      </ScrollView>
    </SafeAreaView>
  );
}
