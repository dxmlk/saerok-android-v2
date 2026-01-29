// src/app/saerok/search-place.tsx
import { useRouter } from "expo-router";
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
import { KakaoPlaceDoc, searchKakaoPlaces } from "@/services/kakaoPlaces";
import { useSaerokForm } from "@/states/useSaerokForm";

export default function SearchPlaceScreen() {
  const router = useRouter();
  const { setAddressDetails } = useSaerokForm();

  const inputRef = useRef<TextInput>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<KakaoPlaceDoc[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = async () => {
    const term = q.trim();
    if (!term) return;

    setLoading(true);
    try {
      const docs = await searchKakaoPlaces(term, 1, 15);
      console.log("kakao docs length =", docs.length); // 확인용 콘솔
      setItems(docs);
      setSearched(true);
    } catch (e: any) {
      console.log("kakao search ERROR:", e?.message ?? e); // 확인용 콘솔
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
    const address = p.road_address_name || p.address_name;

    setAddressDetails({
      address,
      locationAlias: p.place_name,
      latitude: lat,
      longitude: lng,
    });

    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <SearchBar
          ref={inputRef}
          value={q}
          onChangeText={setQ}
          placeholder="장소를 검색하세요"
          onSubmit={doSearch}
          onBack={() => router.back()}
          onClear={() => setQ("")}
        />

        {searched ? (
          <FlatList
            style={{ marginTop: 12 }}
            data={items}
            keyExtractor={(it) => it.id}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#6B7280" }}
              >
                {loading ? "불러오는 중..." : "검색 결과가 없습니다."}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => onSelect(item)} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName}>{item.place_name}</Text>
                  <Text style={styles.placeAddr}>
                    {item.road_address_name || item.address_name}
                  </Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </Pressable>
            )}
          />
        ) : (
          <Text
            style={{ marginTop: 18, textAlign: "center", color: "#6B7280" }}
          >
            검색어를 입력하고 엔터를 눌러주세요.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, flex: 1 },
  row: {
    height: 68,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  placeName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  placeAddr: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  chev: { color: "#9CA3AF", fontSize: 22 },
});
