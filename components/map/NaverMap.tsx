import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from "@mj-studio/react-native-naver-map";
import React, {
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  FeBlend,
  FeColorMatrix,
  FeComposite,
  FeFlood,
  FeGaussianBlur,
  FeOffset,
  Filter,
  G,
  Path,
  Rect,
} from "react-native-svg";

import type { NearbyCollectionItem } from "@/services/api/collections";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import cluster1To5Image from "@/assets/images/map/cluster-1-5.png";
import cluster6To15Image from "@/assets/images/map/cluster-6-15.png";
import cluster16To30Image from "@/assets/images/map/cluster-16-30.png";
import cluster31To99Image from "@/assets/images/map/cluster-31-99.png";
import cluster100PlusImage from "@/assets/images/map/cluster-100-plus.png";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";

type Center = { lat: number; lng: number };
type MarkerRenderMode = "cluster" | "single" | "bubble";

interface Props {
  mapRef: MutableRefObject<NaverMapViewRef | null>;
  markers: NearbyCollectionItem[];
  center: Center;
  zoomLevel?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  onCenterChanged?: (lat: number, lng: number, zoom: number) => void;
  onOverlayClick?: (id: number) => void;
}

const CLUSTER_TO_SINGLE_ZOOM = 15.5;
const SINGLE_TO_BUBBLE_ZOOM = 14.3;
const ZOOM_HYSTERESIS = 0.15;
const SINGLE_MARKER_SIZE = 86;
const SINGLE_MARKER_IMAGE_SIZE = 47;
const BUBBLE_MARKER_WIDTH = 236;
const BUBBLE_MARKER_HEIGHT = 278;
const CAMERA_IDLE_COMMIT_MS = 120;
const ENABLE_BUBBLE_MARKERS = true;
const MIN_VISIBLE_BUFFER_METERS = 120;
const MIN_RETAINED_BUFFER_METERS = 180;

const USE_NATIVE_SINGLE_MARKER_IMAGE = false;
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

type ClusterBadgeSpec = {
  width: number;
  height: number;
  viewBox: string;
  filterId: string;
  fill: string;
  filterValues: string;
  bodyPath: string;
  strokePath: string;
};

const clusterBadgeImageCache = new Map<string, string>();

const clusterCountLabel = (count: number) =>
  count > 99 ? "99+" : String(count);

const clusterImageSourceByCount = (count: number) => {
  if (count <= 5) return cluster1To5Image;
  if (count <= 15) return cluster6To15Image;
  if (count <= 30) return cluster16To30Image;
  if (count <= 99) return cluster31To99Image;
  return cluster100PlusImage;
};

const clusterBadgeSpecByCount = (count: number): ClusterBadgeSpec => {
  if (count <= 5) {
    return {
      width: 75,
      height: 75,
      viewBox: "0 0 75 75",
      filterId: "clusterShadow5",
      fill: "#F7BE65",
      filterValues:
        "0 0 0 0 0.969777 0 0 0 0 0.746796 0 0 0 0 0.397782 0 0 0 1 0",
      bodyPath:
        "M55 37.5C55 47.165 47.165 55 37.5 55C27.835 55 20 47.165 20 37.5C20 27.835 27.835 20 37.5 20C47.165 20 55 27.835 55 37.5Z",
      strokePath:
        "M37.5 21.5C46.3366 21.5 53.5 28.6634 53.5 37.5C53.5 46.3366 46.3366 53.5 37.5 53.5C28.6634 53.5 21.5 46.3366 21.5 37.5C21.5 28.6634 28.6634 21.5 37.5 21.5Z",
    };
  }
  if (count <= 15) {
    return {
      width: 80,
      height: 80,
      viewBox: "0 0 80 80",
      filterId: "clusterShadow15",
      fill: "#F7A265",
      filterValues:
        "0 0 0 0 0.968627 0 0 0 0 0.635294 0 0 0 0 0.396078 0 0 0 1 0",
      bodyPath:
        "M60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40C20 28.9543 28.9543 20 40 20C51.0457 20 60 28.9543 60 40Z",
      strokePath:
        "M40 21.5C50.2173 21.5 58.5 29.7827 58.5 40C58.5 50.2173 50.2173 58.5 40 58.5C29.7827 58.5 21.5 50.2173 21.5 40C21.5 29.7827 29.7827 21.5 40 21.5Z",
    };
  }
  if (count <= 30) {
    return {
      width: 90,
      height: 90,
      viewBox: "0 0 90 90",
      filterId: "clusterShadow30",
      fill: "#F77965",
      filterValues:
        "0 0 0 0 0.968627 0 0 0 0 0.47451 0 0 0 0 0.396078 0 0 0 1 0",
      bodyPath:
        "M70 45C70 58.8071 58.8071 70 45 70C31.1929 70 20 58.8071 20 45C20 31.1929 31.1929 20 45 20C58.8071 20 70 31.1929 70 45Z",
      strokePath:
        "M45 21.5C57.9787 21.5 68.5 32.0213 68.5 45C68.5 57.9787 57.9787 68.5 45 68.5C32.0213 68.5 21.5 57.9787 21.5 45C21.5 32.0213 32.0213 21.5 45 21.5Z",
    };
  }
  if (count <= 99) {
    return {
      width: 95,
      height: 95,
      viewBox: "0 0 95 95",
      filterId: "clusterShadow99",
      fill: "#F76565",
      filterValues:
        "0 0 0 0 0.968627 0 0 0 0 0.396078 0 0 0 0 0.396078 0 0 0 1 0",
      bodyPath:
        "M75 47.5C75 62.6878 62.6878 75 47.5 75C32.3122 75 20 62.6878 20 47.5C20 32.3122 32.3122 20 47.5 20C62.6878 20 75 32.3122 75 47.5Z",
      strokePath:
        "M47.5 21.5C61.8594 21.5 73.5 33.1406 73.5 47.5C73.5 61.8594 61.8594 73.5 47.5 73.5C33.1406 73.5 21.5 61.8594 21.5 47.5C21.5 33.1406 33.1406 21.5 47.5 21.5Z",
    };
  }
  return {
    width: 95,
    height: 95,
    viewBox: "0 0 95 95",
    filterId: "clusterShadow100",
    fill: "#F23D21",
    filterValues: "0 0 0 0 0.94902 0 0 0 0 0.239216 0 0 0 0 0.129412 0 0 0 1 0",
    bodyPath:
      "M75 47.5C75 62.6878 62.6878 75 47.5 75C32.3122 75 20 62.6878 20 47.5C20 32.3122 32.3122 20 47.5 20C62.6878 20 75 32.3122 75 47.5Z",
    strokePath:
      "M47.5 21.5C61.8594 21.5 73.5 33.1406 73.5 47.5C73.5 61.8594 61.8594 73.5 47.5 73.5C33.1406 73.5 21.5 61.8594 21.5 47.5C21.5 33.1406 33.1406 21.5 47.5 21.5Z",
  };
};

const createClusterBadgeDataUri = (count: number): string => {
  const spec = clusterBadgeSpecByCount(count);
  const cacheKey = `${spec.filterId}-${count}`;
  const cached = clusterBadgeImageCache.get(cacheKey);
  if (cached) return cached;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}" viewBox="${spec.viewBox}" fill="none"><g filter="url(#${spec.filterId})"><path d="${spec.bodyPath}" fill="${spec.fill}"/><path d="${spec.strokePath}" stroke="#FEFEFE" stroke-width="3"/></g><defs><filter id="${spec.filterId}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="10"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="${spec.filterValues}"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  clusterBadgeImageCache.set(cacheKey, uri);
  return uri;
};

function ClusterBadge({ count }: { count: number }) {
  const spec = clusterBadgeSpecByCount(count);

  return (
    <View
      style={[
        styles.clusterBadgeWrap,
        { width: rs(spec.width), height: rs(spec.height) },
      ]}
    >
      <Svg
        width={rs(spec.width)}
        height={rs(spec.height)}
        viewBox={spec.viewBox}
        fill="none"
      >
        <G filter={`url(#${spec.filterId})`}>
          <Path d={spec.bodyPath} fill={spec.fill} />
          <Path d={spec.strokePath} stroke="#FEFEFE" strokeWidth={3} />
        </G>
        <Defs>
          <Filter
            id={spec.filterId}
            x="0"
            y="0"
            width="100%"
            height="100%"
            filterUnits="userSpaceOnUse"
          >
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <FeOffset />
            <FeGaussianBlur stdDeviation="10" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values={spec.filterValues} />
            <FeBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <FeBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </Filter>
        </Defs>
      </Svg>

      <View style={styles.clusterTextOverlay}>
        <Text style={styles.clusterText}>{count}</Text>
      </View>
    </View>
  );
}

const clusterStepByZoom = (zoom: number): number => {
  if (zoom >= CLUSTER_TO_SINGLE_ZOOM) return 0;

  const zoomDelta = Math.max(0, 14 - zoom);
  const step = 0.018 * Math.pow(2.0, zoomDelta);

  return step;
};

const getModeFromZoom = (zoom: number): MarkerRenderMode => {
  if (zoom < CLUSTER_TO_SINGLE_ZOOM) return "cluster";
  if (!ENABLE_BUBBLE_MARKERS) return "single";
  if (zoom < SINGLE_TO_BUBBLE_ZOOM) return "single";
  return "bubble";
};

const getNextMarkerMode = (
  prevMode: MarkerRenderMode,
  zoom: number,
): MarkerRenderMode => {
  if (prevMode === "cluster") {
    if (zoom >= CLUSTER_TO_SINGLE_ZOOM) return "single";
    return "cluster";
  }
  if (prevMode === "single") {
    if (!ENABLE_BUBBLE_MARKERS) return "single";
    if (zoom >= SINGLE_TO_BUBBLE_ZOOM) return "bubble";
    if (zoom < CLUSTER_TO_SINGLE_ZOOM - ZOOM_HYSTERESIS) return "cluster";
    return "single";
  }
  if (!ENABLE_BUBBLE_MARKERS) return "single";
  if (zoom < SINGLE_TO_BUBBLE_ZOOM - ZOOM_HYSTERESIS) return "single";
  return "bubble";
};

export default function NaverMap({
  mapRef,
  markers,
  center,
  zoomLevel = 15,
  viewportWidth,
  viewportHeight,
  onCenterChanged,
  onOverlayClick,
}: Props) {
  const [zoom, setZoom] = useState(zoomLevel);
  // Keep internal zoom state in sync when parent requests a specific zoom level
  useEffect(() => {
    if (!Number.isFinite(zoomLevel)) return;
    setZoom((prev) => (Math.abs(prev - zoomLevel) >= 0.01 ? zoomLevel : prev));
  }, [zoomLevel]);
  const [viewCenter, setViewCenter] = useState(center);
  const markerMode = getModeFromZoom(zoom);
  const prevCenterRef = useRef(center);
  const cameraIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOverlayTapRef = useRef<{ id: number; at: number } | null>(null);

  const visibleSingleIdsRef = useRef<Set<number>>(new Set());
  const visibleBubbleIdsRef = useRef<Set<string>>(new Set());

  const handleOverlayPress = useCallback(
    (id: number) => {
      const now = Date.now();
      const lastTap = lastOverlayTapRef.current;
      if (lastTap?.id === id && now - lastTap.at < 500) {
        return;
      }
      lastOverlayTapRef.current = { id, at: now };
      onOverlayClick?.(id);
    },
    [onOverlayClick],
  );

  useEffect(() => {
    const prev = prevCenterRef.current;
    const moved =
      Math.abs(prev.lat - center.lat) > 0.000001 ||
      Math.abs(prev.lng - center.lng) > 0.000001;

    if (moved) {
      mapRef.current?.animateCameraTo({
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoomLevel,
        duration: 250,
      });
      prevCenterRef.current = center;
    }
  }, [center, mapRef, zoomLevel]);

  useEffect(() => {
    setViewCenter(center);
  }, [center]);

  useEffect(() => {
    return () => {
      if (cameraIdleTimerRef.current) {
        clearTimeout(cameraIdleTimerRef.current);
      }
    };
  }, []);

  const renderedItems = useMemo(() => {
    const step = clusterStepByZoom(zoom);
    const visibleWidth = viewportWidth ?? Dimensions.get("window").width;
    const visibleHeight = viewportHeight ?? Dimensions.get("window").height;
    const metersPerPixel =
      (156543.03392 * Math.cos((viewCenter.lat * Math.PI) / 180)) /
      Math.pow(2, zoom);
    const halfWidthMeters =
      (visibleWidth * 1.6 * metersPerPixel) / 2 + MIN_VISIBLE_BUFFER_METERS;
    const halfHeightMeters =
      (visibleHeight * 1.6 * metersPerPixel) / 2 + MIN_VISIBLE_BUFFER_METERS;
    const metersPerLatDegree = 111320;
    const metersPerLngDegree = Math.max(
      1,
      metersPerLatDegree * Math.cos((viewCenter.lat * Math.PI) / 180),
    );
    const halfLatDelta = halfHeightMeters / metersPerLatDegree;
    const halfLngDelta = halfWidthMeters / metersPerLngDegree;
    const retainedHalfLatDelta =
      (halfHeightMeters + MIN_RETAINED_BUFFER_METERS) / metersPerLatDegree;
    const retainedHalfLngDelta =
      (halfWidthMeters + MIN_RETAINED_BUFFER_METERS) / metersPerLngDegree;
    const previousVisibleSingleIds = visibleSingleIdsRef.current;

    const visibleMarkers = markers.filter((item) => {
      const isInsideBase =
        Math.abs(item.latitude - viewCenter.lat) <= halfLatDelta &&
        Math.abs(item.longitude - viewCenter.lng) <= halfLngDelta;
      if (isInsideBase) return true;

      const wasVisible = previousVisibleSingleIds.has(item.collectionId);
      if (!wasVisible) return false;

      return (
        Math.abs(item.latitude - viewCenter.lat) <= retainedHalfLatDelta &&
        Math.abs(item.longitude - viewCenter.lng) <= retainedHalfLngDelta
      );
    });
    visibleSingleIdsRef.current = new Set(
      visibleMarkers.map((item) => item.collectionId),
    );
    const hiddenMarkers = markers.filter(
      (item) => !visibleSingleIdsRef.current.has(item.collectionId),
    );
    const clusterMarkers = (
      source: NearbyCollectionItem[],
      clusterStep: number,
    ) => {
      const grouped = new Map<
        string,
        {
          latitudeSum: number;
          longitudeSum: number;
          items: NearbyCollectionItem[];
        }
      >();

      for (const item of source) {
        const latCell = Math.floor(item.latitude / clusterStep);
        const lngCell = Math.floor(item.longitude / clusterStep);
        const key = `${latCell}:${lngCell}`;
        const prev = grouped.get(key);
        if (prev) {
          prev.latitudeSum += item.latitude;
          prev.longitudeSum += item.longitude;
          prev.items.push(item);
        } else {
          grouped.set(key, {
            latitudeSum: item.latitude,
            longitudeSum: item.longitude,
            items: [item],
          });
        }
      }

      return Array.from(grouped.entries()).map(([key, value]) => {
        const count = value.items.length;
        if (count === 1) {
          const singleItem = value.items[0];
          return {
            type: "single" as const,
            id: `single-${singleItem.collectionId}`,
            latitude: singleItem.latitude,
            longitude: singleItem.longitude,
            item: singleItem,
          };
        }

        return {
          type: "cluster" as const,
          id: `cluster-${key}`,
          latitude: value.latitudeSum / count,
          longitude: value.longitudeSum / count,
          count,
        };
      });
    };

    if (!step || markerMode !== "cluster") {
      const hiddenClusterStep = Math.max(
        clusterStepByZoom(CLUSTER_TO_SINGLE_ZOOM - ZOOM_HYSTERESIS) * 0.35,
        0.003,
      );
      const visibleSingles = visibleMarkers.map((item) => ({
        type: "single" as const,
        id: `single-${item.collectionId}`,
        latitude: item.latitude,
        longitude: item.longitude,
        item,
      }));
      const hiddenClusters = clusterMarkers(
        hiddenMarkers,
        hiddenClusterStep,
      ).filter((entry) => entry.type === "cluster");

      return [...hiddenClusters, ...visibleSingles];
    }

    return clusterMarkers(markers, step);
  }, [
    markerMode,
    markers,
    viewCenter.lat,
    viewCenter.lng,
    viewportHeight,
    viewportWidth,
    zoom,
  ]);

  const visibleBubbleItems = useMemo(() => {
    if (markerMode !== "bubble") return [];

    const previousVisibleBubbleIds = visibleBubbleIdsRef.current;
    const sortedSingles = renderedItems
      .filter(
        (
          entry,
        ): entry is Extract<
          (typeof renderedItems)[number],
          { type: "single" }
        > => entry.type === "single",
      )
      .sort((a, b) => {
        const aDist =
          Math.abs(a.latitude - viewCenter.lat) +
          Math.abs(a.longitude - viewCenter.lng);
        const bDist =
          Math.abs(b.latitude - viewCenter.lat) +
          Math.abs(b.longitude - viewCenter.lng);
        return aDist - bDist;
      });

    const nextBubbleCandidates = sortedSingles;
    const nextBubbleCandidateIdSet = new Set(
      nextBubbleCandidates.map((entry) => entry.id),
    );
    const retainedBubbleItems = sortedSingles.filter((entry) =>
      previousVisibleBubbleIds.has(entry.id),
    );
    const prioritizedBubbleItems = [
      ...retainedBubbleItems.filter((entry) =>
        nextBubbleCandidateIdSet.has(entry.id),
      ),
      ...nextBubbleCandidates.filter(
        (entry) => !previousVisibleBubbleIds.has(entry.id),
      ),
    ];

    visibleBubbleIdsRef.current = new Set(
      prioritizedBubbleItems.map((entry) => entry.id),
    );
    return prioritizedBubbleItems;
  }, [markerMode, renderedItems, viewCenter.lat, viewCenter.lng]);

  return (
    <View style={styles.mapWrap}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        initialCamera={{
          latitude: center.lat,
          longitude: center.lng,
          zoom: zoomLevel,
        }}
        isUseTextureViewAndroid={true}
        isShowZoomControls={false}
        onCameraChanged={() => {
          if (cameraIdleTimerRef.current) {
            clearTimeout(cameraIdleTimerRef.current);
          }
        }}
        onCameraIdle={(e: any) => {
          const nextLat = Number(e.latitude);
          const nextLng = Number(e.longitude);
          const rawZoom = Number(e.zoom);
          const nextZoom = Number.isFinite(rawZoom)
            ? Math.round(rawZoom * 10) / 10
            : zoom;

          if (cameraIdleTimerRef.current) {
            clearTimeout(cameraIdleTimerRef.current);
          }
          cameraIdleTimerRef.current = setTimeout(() => {
            if (Number.isFinite(nextZoom)) {
              setZoom((prev) =>
                Math.abs(prev - nextZoom) >= 0.1 ? nextZoom : prev,
              );
            }
            if (Number.isFinite(nextLat) && Number.isFinite(nextLng)) {
              setViewCenter({ lat: nextLat, lng: nextLng });
              onCenterChanged?.(nextLat, nextLng, nextZoom);
            }
          }, CAMERA_IDLE_COMMIT_MS);
        }}
      >
        {renderedItems.map((entry) => {
          if (entry.type === "cluster") {
            const spec = clusterBadgeSpecByCount(entry.count);
            return (
              <NaverMapMarkerOverlay
                key={entry.id}
                latitude={entry.latitude}
                longitude={entry.longitude}
                width={rs(spec.width)}
                height={rs(spec.height)}
                image={clusterImageSourceByCount(entry.count)}
                caption={{
                  text: clusterCountLabel(entry.count),
                  align: "Center",
                  color: "#FEFEFE",
                  haloColor: "transparent",
                  textSize: 15,
                  offset: 0,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                onTap={() => {
                  mapRef.current?.animateCameraTo({
                    latitude: entry.latitude,
                    longitude: entry.longitude,
                    zoom: Math.min(zoom + 2, CLUSTER_TO_SINGLE_ZOOM),
                    duration: 250,
                  });
                }}
              />
            );
          }

          const markerImageUri =
            entry.item.thumbnailImageUrl || entry.item.imageUrl || null;

          const singleMarkerImage =
            USE_NATIVE_SINGLE_MARKER_IMAGE && markerImageUri
              ? {
                  httpUri: markerImageUri,
                  reuseIdentifier: `single-${entry.item.collectionId}`,
                }
              : {
                  httpUri: TRANSPARENT_PIXEL,
                  reuseIdentifier: "transparent-single",
                };

          return (
            <NaverMapMarkerOverlay
              key={entry.id}
              latitude={entry.latitude}
              longitude={entry.longitude}
              width={
                USE_NATIVE_SINGLE_MARKER_IMAGE
                  ? rs(SINGLE_MARKER_IMAGE_SIZE)
                  : SINGLE_MARKER_SIZE
              }
              height={
                USE_NATIVE_SINGLE_MARKER_IMAGE
                  ? rs(SINGLE_MARKER_IMAGE_SIZE)
                  : SINGLE_MARKER_SIZE
              }
              image={singleMarkerImage}
              anchor={{
                x: 0.5,
                y: USE_NATIVE_SINGLE_MARKER_IMAGE ? 0.5 : 0.56,
              }}
              onTap={() => handleOverlayPress(entry.item.collectionId)}
            >
              {USE_NATIVE_SINGLE_MARKER_IMAGE ? null : (
                <TouchableOpacity
                  style={styles.singleBubbleStack}
                  onPress={() => handleOverlayPress(entry.item.collectionId)}
                >
                  <MarkerCircle imageUri={markerImageUri} />
                </TouchableOpacity>
              )}
            </NaverMapMarkerOverlay>
          );
        })}
        {visibleBubbleItems.map((entry) => (
          <NaverMapMarkerOverlay
            key={`bubble-${entry.item.collectionId}`}
            latitude={entry.latitude}
            longitude={entry.longitude}
            width={BUBBLE_MARKER_WIDTH}
            height={BUBBLE_MARKER_HEIGHT}
            image={{
              httpUri: TRANSPARENT_PIXEL,
              reuseIdentifier: "transparent-bubble",
            }}
            anchor={{ x: 0.5, y: 0.865 }}
            onTap={() => handleOverlayPress(entry.item.collectionId)}
          >
            <TouchableOpacity
              style={styles.singleBubbleStack}
              onPress={() => handleOverlayPress(entry.item.collectionId)}
            >
              <BubbleWithShadow
                title={entry.item.koreanName || "이름 모를 새"}
                note={entry.item.note || ""}
              />
            </TouchableOpacity>
          </NaverMapMarkerOverlay>
        ))}
      </NaverMapView>
    </View>
  );
}

const MarkerCircle = React.memo(function MarkerCircle({
  imageUri,
}: {
  imageUri: string | null;
}) {
  return (
    <View style={styles.markerShadowWrap}>
      <View style={styles.markerWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.markerImage} />
        ) : (
          <View style={styles.markerFallback} />
        )}
      </View>
    </View>
  );
});

const BubbleWithShadow = React.memo(function BubbleWithShadow({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <View style={styles.bubbleWrap}>
      <View style={styles.bubbleCanvas}>
        <View style={styles.bubbleBody}>
          <Text style={styles.bubbleTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text
            style={styles.bubbleNote}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {note}
          </Text>
        </View>
        <View style={styles.bubbleTail} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mapWrap: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  map: { flex: 1 },
  singleBubbleStack: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "visible",
  },
  markerShadowWrap: {
    position: "absolute",
    bottom: rs(12),
    left: "50%",
    width: rs(SINGLE_MARKER_IMAGE_SIZE),
    height: rs(SINGLE_MARKER_IMAGE_SIZE),
    borderRadius: rs(SINGLE_MARKER_IMAGE_SIZE / 2),
    transform: [{ translateX: -rs(SINGLE_MARKER_IMAGE_SIZE / 2) }],
  },
  markerWrap: {
    width: rs(SINGLE_MARKER_IMAGE_SIZE),
    height: rs(SINGLE_MARKER_IMAGE_SIZE),
    borderRadius: rs(SINGLE_MARKER_IMAGE_SIZE / 2),
    borderWidth: rs(3),
    borderColor: "#FEFEFE",
    overflow: "hidden",
    backgroundColor: "#D3D3D3",
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
  markerFallback: {
    flex: 1,
    backgroundColor: "#D9D9D9",
  },
  bubbleWrap: {
    position: "absolute",
    bottom: rs(64),
    width: "100%",
    alignItems: "center",
  },
  bubbleCanvas: {
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },
  bubbleBody: {
    maxWidth: rs(181),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    marginBottom: -rs(2),
    backgroundColor: "#FEFEFE",
    borderRadius: rs(20),
    borderWidth: rs(1),
    borderColor: "#D9D9D9",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  bubbleTail: {
    width: rs(16),
    height: rs(16),
    marginTop: -rs(7),
    backgroundColor: "#FEFEFE",
    borderRightWidth: rs(1),
    borderBottomWidth: rs(1),
    borderColor: "#D9D9D9",
    transform: [{ rotate: "45deg" }],
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.28,
    shadowRadius: 2,
    elevation: 4,
    zIndex: 2,
  },
  bubbleTitle: {
    color: "#0D0D0D",
    fontFamily: font.money,
    fontSize: rfs(14),
    fontWeight: "400",
    lineHeight: rfs(17),
    marginBottom: rs(5),
    textAlign: "center",
  },
  bubbleNote: {
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(12),
    fontWeight: "400",
    lineHeight: rfs(16),
    textAlign: "center",
  },
  clusterBadgeWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  clusterTextOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterText: {
    color: "#FEFEFE",
    fontFamily: "Pretendard",
    fontSize: rfs(15),
    fontWeight: "700",
    lineHeight: rfs(18),
  },
});
