import { type NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SearchBar from "@/components/common/SearchBar";
import CurrentLocationButton from "@/components/map/CurrentLocationButton";
import MapCollectionsSheet from "@/components/map/MapCollectionsSheet";
import NaverMap from "@/components/map/NaverMap";
import ToggleMapMode from "@/components/map/ToggleMapMode";
import {
  fetchNearbyCollections,
  type NearbyCollectionItem,
} from "@/services/api/collections";
import { useMapSearchState } from "@/states/useMapSearchState";
import { rfs, rs } from "@/theme";

const DEFAULT_CENTER = {
  latitude: 37.58939182281775,
  longitude: 127.02990237554194,
};
const MOVED_EPSILON = 0.0001;
const SHEET_PEEK_HEIGHT = 60;
const TAB_BAR_HEIGHT = 60;
const DEFAULT_ZOOM = 15;

function calcRadiusMetersByScreen(latitude: number, zoom: number) {
  const screenWidth = Dimensions.get("window").width;
  const metersPerPixel =
    (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  const halfScreenMeters = (screenWidth * metersPerPixel) / 2;
  const withMargin = halfScreenMeters * 1.1;
  return Math.max(100, Math.round(withMargin));
}

function getReadableAddress(p?: Location.LocationGeocodedAddress) {
  if (!p) return "";
  const city = p.city || p.subregion || p.region || "";
  const district = p.district || "";
  const street = p.street || "";
  const name = p.name || "";
  return [city, district, street || name].filter(Boolean).join(" ");
}

export default function MapIndex() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [myLocation, setMyLocation] = useState(DEFAULT_CENTER);
  const [isMineOnly, setIsMineOnly] = useState(false);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [markers, setMarkers] = useState<NearbyCollectionItem[]>([]);
  const [addressText, setAddressText] = useState("현재 위치");
  const [pendingCenter, setPendingCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const geocodeSeqRef = useRef(0);
  const { selectedCenter, setSelectedCenter } = useMapSearchState();

  const moved = useMemo(() => {
    if (!pendingCenter) return false;
    return (
      Math.abs(pendingCenter.latitude - center.latitude) > MOVED_EPSILON ||
      Math.abs(pendingCenter.longitude - center.longitude) > MOVED_EPSILON
    );
  }, [pendingCenter, center.latitude, center.longitude]);

  const fetchNearby = async (
    latitude: number,
    longitude: number,
    mineOnly: boolean,
  ) => {
    try {
      const items = await fetchNearbyCollections({
        latitude,
        longitude,
        radiusMeters: calcRadiusMetersByScreen(latitude, mapZoom),
        isMineOnly: mineOnly,
      });
      setMarkers(items);
    } catch {
      setMarkers([]);
    }
  };

  const updateCenterAddress = async (latitude: number, longitude: number) => {
    const seq = ++geocodeSeqRef.current;
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (seq !== geocodeSeqRef.current) return;
      const text = getReadableAddress(places?.[0]);
      setAddressText(text || "현재 위치");
    } catch {
      if (seq === geocodeSeqRef.current) setAddressText("현재 위치");
    }
  };

  const resolveCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCenter(DEFAULT_CENTER);
        setMyLocation(DEFAULT_CENTER);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const next = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCenter(next);
      setMyLocation(next);
    } catch {
      setCenter(DEFAULT_CENTER);
      setMyLocation(DEFAULT_CENTER);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void resolveCurrentLocation();
  }, []);

  useEffect(() => {
    if (loading) return;
    void fetchNearby(center.latitude, center.longitude, isMineOnly);
    void updateCenterAddress(center.latitude, center.longitude);
  }, [loading, center.latitude, center.longitude, isMineOnly]);

  useEffect(() => {
    const lat = Number(params.lat);
    const lng = Number(params.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const next = { latitude: lat, longitude: lng };
    setCenter(next);
    setMapZoom(DEFAULT_ZOOM);
    setPendingCenter(null);
    mapRef.current?.animateCameraTo({
      latitude: next.latitude,
      longitude: next.longitude,
      zoom: DEFAULT_ZOOM,
      duration: 280,
    });
  }, [params.lat, params.lng]);

  useEffect(() => {
    if (!selectedCenter) return;
    setCenter(selectedCenter);
    setMapZoom(DEFAULT_ZOOM);
    setPendingCenter(null);
    mapRef.current?.animateCameraTo({
      latitude: selectedCenter.latitude,
      longitude: selectedCenter.longitude,
      zoom: DEFAULT_ZOOM,
      duration: 280,
    });
    setSelectedCenter(null);
  }, [selectedCenter, setSelectedCenter]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  const coveredBottomHeight = rs(TAB_BAR_HEIGHT) + insets.bottom;
  const sheetBottomOffset = 0;
  const floatingBottom = coveredBottomHeight + rs(SHEET_PEEK_HEIGHT + 10);

  return (
    <View style={styles.root}>
      <NaverMap
        mapRef={mapRef}
        markers={markers}
        center={{ lat: center.latitude, lng: center.longitude }}
        zoomLevel={mapZoom}
        onCenterChanged={(lat, lng, zoom) => {
          setPendingCenter((prev) => {
            if (
              prev &&
              Math.abs(prev.latitude - lat) < 0.000001 &&
              Math.abs(prev.longitude - lng) < 0.000001
            ) {
              return prev;
            }
            return { latitude: lat, longitude: lng };
          });
          if (Number.isFinite(zoom)) {
            setMapZoom((prev) => (Math.abs(prev - zoom) >= 0.1 ? zoom : prev));
          }
        }}
        onOverlayClick={(id) =>
          router.push({
            pathname: "/saerok/[collectionId]",
            params: { collectionId: String(id) },
          })
        }
      />

      <View style={[styles.searchWrap, { top: insets.top + rs(20) }]}>
        <Pressable onPress={() => router.push("/map/search" as any)}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="원하는 장소 검색"
            editable={false}
            onClear={() => {}}
          />
        </Pressable>
      </View>

      {moved ? (
        <View style={[styles.researchWrap, { top: insets.top + rs(80) }]}>
          <Pressable
            onPress={() => {
              if (!pendingCenter) return;
              setCenter(pendingCenter);
              setPendingCenter(null);
            }}
            style={styles.researchBtn}
          >
            <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 13.35C20.345 17.6801 16.5877 21 12.0506 21C7.05208 21 3 16.9706 3 12C3 7.02944 7.05208 3 12.0506 3C15.7619 3 18.9514 5.22137 20.3481 8.4M20.3481 8.4V3M20.3481 8.4H15.6708"
                stroke="#4190FF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.researchText}>이 지역 재검색하기</Text>
          </Pressable>
        </View>
      ) : null}

      <CurrentLocationButton
        bottom={floatingBottom}
        onPress={async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({});
            const next = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setMyLocation(next);
            setCenter(next);
            setPendingCenter(null);
            mapRef.current?.animateCameraTo({
              latitude: next.latitude,
              longitude: next.longitude,
              duration: 280,
            });
          } catch {
            setCenter(myLocation);
            mapRef.current?.animateCameraTo({
              latitude: myLocation.latitude,
              longitude: myLocation.longitude,
              duration: 280,
            });
          }
        }}
      />

      <ToggleMapMode
        isMineOnly={isMineOnly}
        onToggle={(next) => setIsMineOnly(next)}
        bottom={floatingBottom}
      />

      <MapCollectionsSheet
        addressText={addressText}
        items={markers}
        bottomInset={coveredBottomHeight + rs(16)}
        bottomOffset={sheetBottomOffset}
        coveredBottomHeight={coveredBottomHeight}
        onPressItem={(collectionId) =>
          router.push({
            pathname: "/saerok/[collectionId]",
            params: { collectionId: String(collectionId) },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingWrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    position: "absolute",
    left: rs(24),
    right: rs(24),
  },
  researchWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  researchBtn: {
    paddingHorizontal: rs(16),
    height: rs(44),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: rs(8),
    backgroundColor: "#FEFEFE",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  researchText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontWeight: "400",
  },
});
