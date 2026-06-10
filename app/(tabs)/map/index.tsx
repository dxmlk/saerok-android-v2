import { type NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SearchBar from "@/components/common/SearchBar";
import { MapAllToast, MapMineOnlyToast } from "@/components/common/AppToast";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import CurrentLocationButton from "@/components/map/CurrentLocationButton";
import MapCollectionsSheet from "@/components/map/MapCollectionsSheet";
import NaverMap from "@/components/map/NaverMap";
import ToggleMapMode from "@/components/map/ToggleMapMode";
import {
  fetchNearbyCollections,
  type NearbyCollectionItem,
} from "@/services/api/collections";
import { useMapSearchState } from "@/states/useMapSearchState";
import { rs } from "@/theme";
import {
  BOOTSTRAP_LOCATION_TIMEOUT_MS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MOVED_EPSILON,
  NEARBY_LIMITED_COUNT,
  NEARBY_LIMITED_ZOOM,
  RESEARCH_BUTTON_HEIGHT,
  RESEARCH_TOP_MARGIN,
  SEARCH_BAR_HEIGHT,
  SEARCH_TOP_MARGIN,
  SHEET_PEEK_HEIGHT,
  TAB_BAR_HEIGHT,
  MAP_TEXT,
} from "./constants";
import { styles } from "./styles";
import {
  calcRadiusMetersByScreen,
  getReadableAddress,
  withTimeout,
} from "./utils";

export default function MapIndex() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    from?: string;
    returnTo?: string;
    returnCollectionId?: string;
  }>();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [myLocation, setMyLocation] = useState(DEFAULT_CENTER);
  const [isMineOnly, setIsMineOnly] = useState(false);
  const [mapToastType, setMapToastType] = useState<"mine" | "all" | null>(null);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [markers, setMarkers] = useState<NearbyCollectionItem[]>([]);
  const [rootSize, setRootSize] = useState(() => ({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }));
  const [addressText, setAddressText] = useState<string>(
    MAP_TEXT.currentLocation,
  );
  const [pendingCenter, setPendingCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const geocodeSeqRef = useRef(0);
  const locationRequestSeqRef = useRef(0);
  const handledRouteLocationRef = useRef<string | null>(null);
  const { selectedCenter, setSelectedCenter } = useMapSearchState();

  const moved = useMemo(() => {
    if (!pendingCenter) return false;
    return (
      Math.abs(pendingCenter.latitude - center.latitude) > MOVED_EPSILON ||
      Math.abs(pendingCenter.longitude - center.longitude) > MOVED_EPSILON
    );
  }, [pendingCenter, center.latitude, center.longitude]);

  const coveredBottomHeight = rs(TAB_BAR_HEIGHT) + insets.bottom;
  const topOverlayBottom = useMemo(() => {
    const searchBottom =
      insets.top + rs(SEARCH_TOP_MARGIN) + rs(SEARCH_BAR_HEIGHT);
    const researchBottom =
      insets.top + rs(RESEARCH_TOP_MARGIN) + rs(RESEARCH_BUTTON_HEIGHT);
    return Math.max(searchBottom, researchBottom);
  }, [insets.top]);

  const visibleMapViewport = useMemo(
    () => ({
      width: rootSize.width,
      height: Math.max(
        rs(120),
        rootSize.height -
          topOverlayBottom -
          coveredBottomHeight -
          rs(SHEET_PEEK_HEIGHT),
      ),
    }),
    [coveredBottomHeight, rootSize.height, rootSize.width, topOverlayBottom],
  );

  const fetchNearby = async (
    latitude: number,
    longitude: number,
    mineOnly: boolean,
    zoom = mapZoom,
  ) => {
    try {
      const shouldLimitNearby = zoom >= NEARBY_LIMITED_ZOOM;
      const items = await fetchNearbyCollections({
        latitude,
        longitude,
        radiusMeters: calcRadiusMetersByScreen(
          latitude,
          zoom,
          visibleMapViewport.width,
          visibleMapViewport.height,
        ),
        isMineOnly: mineOnly,
        mode: shouldLimitNearby ? "EVEN" : undefined,
        limit: shouldLimitNearby ? NEARBY_LIMITED_COUNT : undefined,
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
      setAddressText(text || MAP_TEXT.currentLocation);
    } catch {
      if (seq === geocodeSeqRef.current) setAddressText(MAP_TEXT.currentLocation);
    }
  };

  const researchAt = useCallback(
    async (
      next: { latitude: number; longitude: number },
      mineOnly: boolean,
      zoom = mapZoom,
    ) => {
      setCenter(next);
      setPendingCenter(null);
      await Promise.all([
        fetchNearby(next.latitude, next.longitude, mineOnly, zoom),
        updateCenterAddress(next.latitude, next.longitude),
      ]);
    },
    [mapZoom, visibleMapViewport.height, visibleMapViewport.width],
  );

  const previewLocation = useCallback(
    (
      next: { latitude: number; longitude: number },
      options?: { saveAsMyLocation?: boolean; zoom?: number; openBubble?: boolean },
    ) => {
      if (options?.saveAsMyLocation) {
        setMyLocation(next);
      }
      setPendingCenter(next);
      // If caller requests an opened bubble, ensure zoom is high enough to render bubble markers
      // Use 16 to exceed cluster->single threshold in NaverMap (15.5)
      const targetZoomBase = options?.zoom ?? DEFAULT_ZOOM;
      const targetZoom = options?.openBubble ? Math.max(targetZoomBase, 16) : targetZoomBase;
      setMapZoom(targetZoom);
      mapRef.current?.animateCameraTo({
        latitude: next.latitude,
        longitude: next.longitude,
        zoom: targetZoom,
        duration: 280,
      });
    },
    [],
  );

  const resolveCurrentLocation = async () => {
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      const status =
        permission.status === "granted"
          ? permission.status
          : (await Location.requestForegroundPermissionsAsync()).status;

      if (status !== "granted") {
        setMyLocation(DEFAULT_CENTER);
        setCenter(DEFAULT_CENTER);
        setLoading(false);
        void researchAt(DEFAULT_CENTER, isMineOnly, DEFAULT_ZOOM);
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        const quickLocation = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
        setMyLocation(quickLocation);
        setCenter(quickLocation);
        setLoading(false);
        void researchAt(quickLocation, isMineOnly, DEFAULT_ZOOM);
      }

      const loc = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        BOOTSTRAP_LOCATION_TIMEOUT_MS,
      );
      const next = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setMyLocation(next);
      if (loading) {
        setCenter(next);
        setLoading(false);
      }
      void researchAt(next, isMineOnly, DEFAULT_ZOOM);
    } catch {
      setMyLocation(DEFAULT_CENTER);
      setCenter(DEFAULT_CENTER);
      setLoading(false);
      void researchAt(DEFAULT_CENTER, isMineOnly, DEFAULT_ZOOM);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lat = Number(params.lat);
    const lng = Number(params.lng);
    // If a route provided explicit coordinates, prefer them and skip auto-resolve
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setLoading(false);
      return;
    }
    void resolveCurrentLocation();
  }, [params.lat, params.lng]);

  // When the map is opened with a returnTo param, intercept hardware back and
  // return explicitly to the requested destination.
  useEffect(() => {
    if (!isFocused) return;

    const returnTo = params.returnTo as string | undefined;
    const returnCollectionId = params.returnCollectionId as string | undefined;
    const origin = params.from as string | undefined;
    // eslint-disable-next-line no-console
    console.log("[MapIndex] params received:", {
      focused: isFocused,
      from: origin,
      returnTo,
      returnCollectionId,
      lat: params.lat,
      lng: params.lng,
    });
    if (!returnTo) return;

    const onHardwareBack = () => {
      const canGoBack = navigation && navigation.canGoBack ? navigation.canGoBack() : false;
      // eslint-disable-next-line no-console
      console.log(
        "[MapIndex] hardware back pressed, from:",
        origin,
        "returnTo:",
        returnTo,
        "canGoBack:",
        canGoBack,
      );

      const explicitDetailPath =
        returnTo?.startsWith("/saerok/") && !returnTo?.includes("[collectionId]")
          ? returnTo
          : returnCollectionId
          ? `/saerok/${returnCollectionId}`
          : undefined;

      if (
        origin === "saerok_detail" &&
        explicitDetailPath
      ) {
        // Saerok detail opens the tab map with replace, so returning with replace
        // restores one detail screen without leaving detail -> detail in history.
        // eslint-disable-next-line no-console
        console.log("[MapIndex] replace to explicit saerok detail", explicitDetailPath);
        router.replace(explicitDetailPath);
        return true;
      }

      if (canGoBack) {
        // If there is some other stack history, preserve it.
        // eslint-disable-next-line no-console
        console.log("[MapIndex] router.back() default");
        router.back();
        return true;
      }

      // If we cannot go back, use explicit path when available.
      if (explicitDetailPath) {
        // eslint-disable-next-line no-console
        console.log("[MapIndex] replace to explicit returnTo fallback", explicitDetailPath);
        router.replace(explicitDetailPath);
        return true;
      }

      // Otherwise fall back to the original returnTo route object.
      const paramsObj: any = {};
      if (returnCollectionId) paramsObj.collectionId = returnCollectionId;
      // eslint-disable-next-line no-console
      console.log("[MapIndex] replace to returnTo fallback", returnTo, paramsObj);
      router.replace({ pathname: returnTo as any, params: paramsObj } as any);
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [isFocused, params.from, params.returnTo, params.returnCollectionId, navigation, router]);

  const refreshAndMoveToCurrentLocation = async () => {
    const requestId = ++locationRequestSeqRef.current;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (requestId !== locationRequestSeqRef.current) return;

      const next = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setMyLocation(next);
      setMapZoom(DEFAULT_ZOOM);
      mapRef.current?.animateCameraTo({
        latitude: next.latitude,
        longitude: next.longitude,
        zoom: DEFAULT_ZOOM,
        duration: 280,
      });
      await researchAt(next, isMineOnly, DEFAULT_ZOOM);
    } catch {
      if (requestId !== locationRequestSeqRef.current) return;
      previewLocation(myLocation, { zoom: DEFAULT_ZOOM });
    }
  };

  useEffect(() => {
    const lat = Number(params.lat);
    const lng = Number(params.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const routeKey = `${lat},${lng}`;
    if (handledRouteLocationRef.current === routeKey) return;
    handledRouteLocationRef.current = routeKey;
    const next = { latitude: lat, longitude: lng };
    // center on the provided coordinates and open bubble marker at a higher zoom
    previewLocation(next, { zoom: DEFAULT_ZOOM, openBubble: true });
    void researchAt(next, isMineOnly, Math.max(DEFAULT_ZOOM, 16));
  }, [isMineOnly, params.lat, params.lng, previewLocation, researchAt]);

  useEffect(() => {
    if (!selectedCenter) return;
    previewLocation(selectedCenter, { zoom: DEFAULT_ZOOM });
    setSelectedCenter(null);
  }, [selectedCenter, setSelectedCenter, previewLocation]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#4190FF" />
      </View>
    );
  }

  const sheetBottomOffset = 0;
  const floatingBottom = coveredBottomHeight + rs(SHEET_PEEK_HEIGHT + 10);

  return (
    <View
      style={styles.root}
      onLayout={(event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setRootSize((prev) =>
          Math.abs(prev.width - width) < 0.5 &&
          Math.abs(prev.height - height) < 0.5
            ? prev
            : { width, height },
        );
      }}
    >
      <NaverMap
        mapRef={mapRef}
        markers={markers}
        center={{ lat: center.latitude, lng: center.longitude }}
        zoomLevel={mapZoom}
        viewportWidth={visibleMapViewport.width}
        viewportHeight={visibleMapViewport.height}
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
        onOverlayClick={(id) => {
          const { openSaerokDetail } = require("@/lib/navigation");
          // Pass return location so back button returns to this map view
          openSaerokDetail(router, id, {
            from: "map_overlay",
            extraParams: {
              returnTo: "/map",
              returnLat: String(pendingCenter?.latitude ?? center.latitude),
              returnLng: String(pendingCenter?.longitude ?? center.longitude),
            },
          });
        }}
      />

      <View style={[styles.searchWrap, { top: insets.top + rs(20) }]}>
        <TouchableOpacity onPress={() => router.push("/map/search" as any)}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder={MAP_TEXT.searchPlaceholder}
            editable={false}
            onClear={() => {}}
          />
        </TouchableOpacity>
      </View>

      {moved ? (
        <View style={[styles.researchWrap, { top: insets.top + rs(80) }]}>
          <TouchableOpacity
            onPress={() => {
              if (!pendingCenter) return;
              void researchAt(pendingCenter, isMineOnly, mapZoom);
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
            <Text style={styles.researchText}>{MAP_TEXT.researchButton}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <CurrentLocationButton
        bottom={floatingBottom}
        onPress={refreshAndMoveToCurrentLocation}
      />

      <ToggleMapMode
        isMineOnly={isMineOnly}
        onToggle={(next) => {
          setIsMineOnly(next);
          setMapToastType(next ? "mine" : "all");
          void fetchNearby(
            (pendingCenter ?? center).latitude,
            (pendingCenter ?? center).longitude,
            next,
            mapZoom,
          );
        }}
        bottom={floatingBottom}
      />

      <MapMineOnlyToast
        visible={mapToastType === "mine"}
        onClose={() => setMapToastType((prev) => (prev === "mine" ? null : prev))}
        bottomOffset={rs(TAB_BAR_HEIGHT + 61)}
      />

      <MapAllToast
        visible={mapToastType === "all"}
        onClose={() => setMapToastType((prev) => (prev === "all" ? null : prev))}
        bottomOffset={rs(TAB_BAR_HEIGHT + 61)}
      />

      <MapCollectionsSheet
        addressText={addressText}
        items={markers}
        bottomInset={coveredBottomHeight + rs(16)}
        bottomOffset={sheetBottomOffset}
        coveredBottomHeight={coveredBottomHeight}
        onPressItem={(collectionId) => {
          const { openSaerokDetail } = require("@/lib/navigation");
          openSaerokDetail(router, collectionId, { from: "map_collections_sheet" });
        }}
      />
    </View>
  );
}
