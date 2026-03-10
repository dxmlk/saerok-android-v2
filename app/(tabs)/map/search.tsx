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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapIcon from "@/assets/icon/nav/MapIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import SearchBar from "@/components/common/SearchBar";
import SimpleHeader from "@/components/common/SimpleHeader";
import { searchKakaoPlaces, type KakaoPlaceDoc } from "@/services/kakaoPlaces";
import { useMapSearchState } from "@/states/useMapSearchState";
import { font, rfs, rs } from "@/theme";

export default function MapSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const setSelectedCenter = useMapSearchState((s) => s.setSelectedCenter);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<KakaoPlaceDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
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
    const term = q.trim();
    if (!term) {
      setItems([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const t = setTimeout(() => {
      void doSearch();
    }, 300);

    return () => clearTimeout(t);
  }, [q, myCoords]);

  const doSearch = async () => {
    const term = q.trim();
    if (!term) return;

    setLoading(true);
    try {
      const docs = await searchKakaoPlaces(term, 1, 15, {
        latitude: myCoords?.latitude,
        longitude: myCoords?.longitude,
      });
      setItems(docs);
      setSearched(true);
    } catch {
      setItems([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (p: KakaoPlaceDoc) => {
    const lat = Number(p.y);
    const lng = Number(p.x);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setSelectedCenter({ latitude: lat, longitude: lng });
    router.back();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topWrap, { paddingTop: insets.top }]}>
        <SimpleHeader title="장소 찾기" />
        <View style={styles.searchSection}>
          <SearchBar
            ref={inputRef}
            value={q}
            onChangeText={setQ}
            placeholder="원하는 장소 검색"
            onSubmit={doSearch}
            onBack={() => router.back()}
            onClear={() => setQ("")}
          />
        </View>
      </View>

      <View style={styles.listWrap}>
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            searched ? (
              <Text style={styles.emptyText}>
                {loading ? "검색 중..." : "검색 결과가 없어요."}
              </Text>
            ) : (
              <Text style={styles.emptyText}>원하는 장소를 검색해보세요</Text>
            )
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelect(item)} style={styles.row}>
              <MapIcon width={rs(24)} height={rs(24)} stroke="#DAE0DE" fill="none" />
              <View style={styles.rowTextWrap}>
                <Text style={styles.placeName}>{item.place_name}</Text>
                <Text style={styles.placeAddr}>
                  {item.road_address_name || item.address_name}
                </Text>
              </View>
              <InfoChevronIcon width={rs(17)} height={rs(17)} color="#0D0D0D" />
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F7F7" },
  topWrap: {
    backgroundColor: "#FFFFFF",
  },
  searchSection: {
    paddingHorizontal: rs(24),
    paddingTop: rs(10),
    paddingBottom: rs(20),
    backgroundColor: "#FFFFFF",
  },
  listWrap: { flex: 1 },
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
  emptyText: {
    marginTop: rs(20),
    color: "#6B7280",
    textAlign: "center",
    fontSize: rfs(14),
  },
});
