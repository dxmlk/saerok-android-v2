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
import { rfs, rs } from "@/theme";

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

export default function DexDetailScreen() {
  const router = useRouter();
  const { birdId } = useLocalSearchParams<{ birdId: string }>();

  const numericId = useMemo(() => {
    const n = Number(birdId);
    return Number.isFinite(n) ? n : null;
  }, [birdId]);

  const [bird, setBird] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!numericId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchDexDetailApi(numericId);
        setBird(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [numericId]);

  useEffect(() => {
    if (!numericId) return;
    fetchBookmarkStatusApi(numericId)
      .then((res) => setBookmarked(!!res.data?.bookmarked))
      .catch(() => {});
  }, [numericId]);

  if (loading || !bird) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const seasonText = joinWithSeparator(
    bird.seasonsWithRarity.map((s: any) => s.season),
    seasonMap,
    " ??",
  );

  const habitatText = joinWithSeparator(bird.habitats, habitatMap, " ??");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: rs(120) }}>
        <View style={{ paddingHorizontal: rs(16), paddingTop: rs(12) }}>
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: bird.imageUrls[0] }}
              style={{ width: "100%", height: rs(260), borderRadius: rs(20) }}
            />

            {/* BACK */}
            <Pressable
              onPress={() => router.back()}
              style={{
                position: "absolute",
                top: rs(12),
                left: rs(12),
                width: rs(40),
                height: rs(40),
                borderRadius: rs(20),
                backgroundColor: "rgba(255,255,255,0.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: rfs(20) }}>←</Text>
            </Pressable>

            {/* BOOKMARK */}
            <Pressable
              onPress={() => {
                setBookmarked((p) => !p);
                toggleBookmarkApi(bird.id).catch(() =>
                  setBookmarked((p) => !p),
                );
              }}
              style={{
                position: "absolute",
                bottom: rs(12),
                right: rs(56),
                width: rs(40),
                height: rs(40),
                borderRadius: rs(20),
                backgroundColor: "rgba(255,255,255,0.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: rfs(18) }}>
                {bookmarked ? "★" : "☆"}
              </Text>
            </Pressable>

            {/* ADD SAEROK */}
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
              style={{
                position: "absolute",
                bottom: rs(12),
                right: rs(12),
                width: rs(40),
                height: rs(40),
                borderRadius: rs(20),
                backgroundColor: "rgba(255,255,255,0.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={addSaerokPng}
                style={{ width: rs(24), height: rs(24) }}
              />
            </Pressable>
          </View>

          {/* CHIPS */}
          <ScrollView
            horizontal
            style={{ marginTop: rs(16) }}
            showsHorizontalScrollIndicator={false}
          >
            {seasonText ? (
              <View
                style={{
                  paddingHorizontal: rs(12),
                  height: rs(33),
                  backgroundColor: "#2563eb",
                  borderRadius: rs(999),
                  justifyContent: "center",
                  marginRight: rs(8),
                }}
              >
                <Text style={{ color: "white", fontSize: rfs(12) }}>
                  {seasonText}
                </Text>
              </View>
            ) : null}

            {habitatText ? (
              <View
                style={{
                  paddingHorizontal: rs(12),
                  height: rs(33),
                  backgroundColor: "#2563eb",
                  borderRadius: rs(999),
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: rfs(12) }}>
                  {habitatText}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>

        {/* NAME */}
        <View style={{ marginTop: rs(26), alignItems: "center" }}>
          <Text style={{ fontSize: rfs(20), fontWeight: "700" }}>
            {bird.koreanName}
          </Text>
          <Text
            style={{ marginTop: rs(4), fontSize: rfs(13), color: "#6b7280" }}
          >
            {bird.scientificName}
          </Text>
        </View>

        {/* DESCRIPTION */}
        <View style={{ marginTop: rs(22), paddingHorizontal: rs(24) }}>
          <Text style={{ fontSize: rfs(16), fontWeight: "700" }}>
            ?곸꽭 ?ㅻ챸
          </Text>
          <Text
            style={{
              marginTop: rs(10),
              fontSize: rfs(13),
              lineHeight: rfs(20),
            }}
          >
            {bird.description}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
