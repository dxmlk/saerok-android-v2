import { useRouter } from "expo-router";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBar from "@/components/common/SearchBar";
import SimpleHeader from "@/components/common/SimpleHeader";
import MapIcon from "@/assets/icon/nav/MapIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import { KakaoPlaceDoc, searchKakaoPlaces } from "@/services/kakaoPlaces";
import { font, rfs, rs } from "@/theme";

export default function SearchPlaceScreen() {
  const router = useRouter();

  const inputRef = useRef<TextInput>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<KakaoPlaceDoc[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myCoords, setMyCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({});
        if (!mounted) return;
        setMyCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {
        // noop
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!myCoords) return;
    if (!q.trim()) return;
    void doSearch();
  }, [myCoords]);

  const doSearch = async () => {
    const term = q.trim();
    if (!term) return;

    setLoading(true);
    try {
      const docs = await searchKakaoPlaces(term, 1, 15, {
        latitude: myCoords?.latitude,
        longitude: myCoords?.longitude,
      });
      console.log("kakao docs length =", docs.length);
      setItems(docs);
      setSearched(true);
    } catch (e: any) {
      console.log("kakao search ERROR:", e?.message ?? e);
      setItems([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }

    console.log("KAKAO KEY exists?", !!process.env.EXPO_PUBLIC_KAKAO_REST_KEY);
  };

  const onSelect = (p: KakaoPlaceDoc) => {
    const lat = parseFloat(p.y);
    const lng = parseFloat(p.x);
    router.push({
      pathname: "/saerok/search-place/confirm" as any,
      params: {
        placeName: p.place_name,
        roadAddress: p.road_address_name || "",
        jibunAddress: p.address_name || "",
        lat: String(lat),
        lng: String(lng),
      },
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <SimpleHeader title="장소 찾기" />

      <View style={styles.searchSection}>
        <SearchBar
          ref={inputRef}
          value={q}
          onChangeText={setQ}
          placeholder="발견 장소를 선택해주세요"
          onSubmit={doSearch}
          onBack={() => router.back()}
          onClear={() => setQ("")}
        />
      </View>

      <View style={styles.container}>
        {searched ? (
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  marginTop: rs(20),
                  color: "#6B7280",
                }}
              >
                {loading ? "검색 중..." : "검색 결과가 없습니다."}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => onSelect(item)} style={styles.row}>
                <MapIcon
                  width={rs(24)}
                  height={rs(24)}
                  stroke="none"
                  fill="#DAE0DE"
                />
                <View style={styles.rowTextWrap}>
                  <Text style={styles.placeName}>{item.place_name}</Text>
                  <Text style={styles.placeAddr}>
                    {item.road_address_name || item.address_name}
                  </Text>
                </View>
                <InfoChevronIcon
                  width={rs(17)}
                  height={rs(17)}
                  color="#0D0D0D"
                />
              </Pressable>
            )}
          />
        ) : (
          <Text
            style={{ marginTop: rs(18), textAlign: "center", color: "#6B7280" }}
          >
            발견 장소를 선택해주세요
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F7F7" },
  searchSection: {
    paddingHorizontal: rs(24),
    paddingTop: rs(10),
    paddingBottom: rs(20),
    backgroundColor: "#FFFFFF",
  },
  container: { flex: 1 },
  row: {
    paddingTop: rs(16),
    paddingRight: rs(23.842),
    paddingBottom: rs(17),
    paddingLeft: rs(24),
    backgroundColor: "#FFFEFE",
    borderTopWidth: rs(1),
    borderTopColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(19),
  },
  rowTextWrap: { flex: 1, justifyContent: "center" },
  placeName: {
    color: "#000000",
    fontFamily: font.haru,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(22),
  },
  placeAddr: {
    marginTop: rs(-2),
    color: "#979797",
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
});
