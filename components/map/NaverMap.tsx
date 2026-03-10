import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from "@mj-studio/react-native-naver-map";
import React, {
  type MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { NearbyCollectionItem } from "@/services/api/collections";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";

type Center = { lat: number; lng: number };
type MarkerRenderMode = "cluster" | "single" | "bubble";

interface Props {
  mapRef: MutableRefObject<NaverMapViewRef | null>;
  markers: NearbyCollectionItem[];
  center: Center;
  zoomLevel?: number;
  onCenterChanged?: (lat: number, lng: number, zoom: number) => void;
  onOverlayClick?: (id: number) => void;
}

const CLUSTER_TO_SINGLE_ZOOM = 14.7;
const SINGLE_TO_BUBBLE_ZOOM = 15.0;
const ZOOM_HYSTERESIS = 0.15;
const MAX_BUBBLE_OVERLAYS = 5;

const SINGLE_MARKER_SIZE = 86;
const SINGLE_MARKER_IMAGE_SIZE = 60;
const BUBBLE_MARKER_WIDTH = 236;
const BUBBLE_MARKER_HEIGHT = 278;

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

type ClusterBucket = {
  size: number;
  color: string;
};

const clusterBucketByCount = (count: number): ClusterBucket => {
  if (count <= 5) return { size: 35, color: "#F7BE65" };
  if (count <= 15) return { size: 40, color: "#F7A265" };
  if (count <= 30) return { size: 50, color: "#F77965" };
  if (count <= 99) return { size: 55, color: "#F76565" };
  return { size: 55, color: "#F23D21" };
};

const clusterStepByZoom = (zoom: number): number => {
  if (zoom >= CLUSTER_TO_SINGLE_ZOOM) return 0;
  if (zoom >= 14) return 0.012;
  if (zoom >= 13) return 0.02;
  if (zoom >= 12) return 0.03;
  if (zoom >= 11) return 0.04;
  return 0.06;
};

const getModeFromZoom = (zoom: number): MarkerRenderMode => {
  if (zoom < CLUSTER_TO_SINGLE_ZOOM) return "cluster";
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
    if (zoom >= SINGLE_TO_BUBBLE_ZOOM) return "bubble";
    if (zoom < CLUSTER_TO_SINGLE_ZOOM - ZOOM_HYSTERESIS) return "cluster";
    return "single";
  }
  if (zoom < SINGLE_TO_BUBBLE_ZOOM - ZOOM_HYSTERESIS) return "single";
  return "bubble";
};

export default function NaverMap({
  mapRef,
  markers,
  center,
  zoomLevel = 15,
  onCenterChanged,
  onOverlayClick,
}: Props) {
  const [zoom, setZoom] = useState(zoomLevel);
  const [markerMode, setMarkerMode] = useState<MarkerRenderMode>(
    getModeFromZoom(zoomLevel),
  );
  const prevCenterRef = useRef(center);

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

  const renderedItems = useMemo(() => {
    const step = clusterStepByZoom(zoom);

    if (!step || markerMode !== "cluster") {
      return markers.map((item) => ({
        type: "single" as const,
        id: `single-${item.collectionId}`,
        latitude: item.latitude,
        longitude: item.longitude,
        item,
      }));
    }

    const grouped = new Map<
      string,
      { latitudeSum: number; longitudeSum: number; items: NearbyCollectionItem[] }
    >();

    for (const item of markers) {
      const latCell = Math.floor(item.latitude / step);
      const lngCell = Math.floor(item.longitude / step);
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
  }, [markers, zoom, markerMode]);

  const bubbleVisibleIdSet = useMemo(() => {
    if (markerMode !== "bubble") return new Set<string>();

    const singles = renderedItems
      .filter((entry) => entry.type === "single")
      .map((entry) => ({
        id: entry.id,
        dist:
          Math.pow(entry.latitude - center.lat, 2) +
          Math.pow(entry.longitude - center.lng, 2),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, MAX_BUBBLE_OVERLAYS)
      .map((v) => v.id);

    return new Set(singles);
  }, [markerMode, renderedItems, center.lat, center.lng]);

  return (
    <NaverMapView
      ref={mapRef}
      style={styles.map}
      initialCamera={{
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoomLevel,
      }}
      isUseTextureViewAndroid
      onCameraIdle={(e: any) => {
        const nextLat = Number(e.latitude);
        const nextLng = Number(e.longitude);
        const rawZoom = Number(e.zoom);
        const nextZoom = Number.isFinite(rawZoom)
          ? Math.round(rawZoom * 10) / 10
          : zoom;

        if (Number.isFinite(nextZoom)) {
          setZoom((prev) => (Math.abs(prev - nextZoom) >= 0.1 ? nextZoom : prev));
          setMarkerMode((prev) => {
            const nextMode = getNextMarkerMode(prev, nextZoom);
            return prev === nextMode ? prev : nextMode;
          });
        }
        if (Number.isFinite(nextLat) && Number.isFinite(nextLng)) {
          onCenterChanged?.(nextLat, nextLng, nextZoom);
        }
      }}
    >
      {renderedItems.map((entry) => {
        if (entry.type === "cluster") {
          const bucket = clusterBucketByCount(entry.count);
          return (
            <NaverMapMarkerOverlay
              key={entry.id}
              latitude={entry.latitude}
              longitude={entry.longitude}
              width={bucket.size}
              height={bucket.size}
              image={{
                httpUri: TRANSPARENT_PIXEL,
                reuseIdentifier: "transparent-cluster",
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
            >
              <View
                style={[
                  styles.clusterWrap,
                  {
                    width: rs(bucket.size),
                    height: rs(bucket.size),
                    borderRadius: rs(bucket.size / 2),
                    backgroundColor: bucket.color,
                    shadowColor: bucket.color,
                  },
                ]}
              >
                <Text style={styles.clusterText}>{entry.count}</Text>
              </View>
            </NaverMapMarkerOverlay>
          );
        }

        const showBubble =
          markerMode === "bubble" && bubbleVisibleIdSet.has(entry.id);
        const markerAnchorY = showBubble ? 0.865 : 0.56;
        const markerImageUri =
          entry.item.thumbnailImageUrl || entry.item.imageUrl || null;

        return (
          <NaverMapMarkerOverlay
            key={entry.id}
            latitude={entry.latitude}
            longitude={entry.longitude}
            width={showBubble ? BUBBLE_MARKER_WIDTH : SINGLE_MARKER_SIZE}
            height={showBubble ? BUBBLE_MARKER_HEIGHT : SINGLE_MARKER_SIZE}
            image={{
              httpUri: TRANSPARENT_PIXEL,
              reuseIdentifier: "transparent-single",
            }}
            anchor={{ x: 0.5, y: markerAnchorY }}
            onTap={() => onOverlayClick?.(entry.item.collectionId)}
          >
            <View style={showBubble ? styles.singleStack : styles.singleMarkerOnly}>
              {showBubble ? (
                <BubbleWithShadow
                  title={entry.item.koreanName || "이름 모를 새"}
                  note={entry.item.note || ""}
                />
              ) : null}

              <MarkerCircle imageUri={markerImageUri} />
            </View>
          </NaverMapMarkerOverlay>
        );
      })}
    </NaverMapView>
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
          <Text style={styles.bubbleNote} numberOfLines={2} ellipsizeMode="tail">
            {note}
          </Text>
        </View>
        <View style={styles.tailWrap}>
          <BubbleTailIcon />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  map: { flex: 1 },
  singleStack: {
    width: rs(BUBBLE_MARKER_WIDTH),
    height: rs(BUBBLE_MARKER_HEIGHT),
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "visible",
  },
  singleMarkerOnly: {
    width: rs(SINGLE_MARKER_SIZE),
    height: rs(SINGLE_MARKER_SIZE),
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "visible",
  },

  markerShadowWrap: {
    position: "absolute",
    bottom: rs(12),
    width: rs(SINGLE_MARKER_IMAGE_SIZE),
    height: rs(SINGLE_MARKER_IMAGE_SIZE),
    borderRadius: rs(SINGLE_MARKER_IMAGE_SIZE / 2),
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
    bottom: rs(72),
    alignItems: "center",
  },
  bubbleCanvas: {
    alignItems: "center",
    paddingHorizontal: rs(12),
    paddingTop: rs(10),
    paddingBottom: rs(10),
    overflow: "visible",
  },
  bubbleBody: {
    maxWidth: rs(181),
    minWidth: rs(96),
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
    paddingHorizontal: rs(15),
    paddingVertical: rs(15),
  },
  bubbleTitle: {
    color: "#0D0D0D",
    fontFamily: font.money,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(17),
    marginBottom: rs(7),
    textAlign: "center",
  },
  bubbleNote: {
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
    textAlign: "center",
  },
  tailWrap: {
    marginTop: -rs(6),
    width: rs(20.407),
    height: rs(18.985),
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  clusterWrap: {
    borderWidth: rs(3),
    borderColor: "#FEFEFE",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 18,
  },
  clusterText: {
    color: "#FEFEFE",
    fontFamily: "Pretendard",
    fontSize: rfs(15),
    fontWeight: "700",
    lineHeight: rfs(18),
  },
});

function BubbleTailIcon({
  color = "#FEFEFE",
  opacity = 1,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <Svg width={rs(20.407)} height={rs(18.985)} viewBox="0 0 21 19" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.4045 0C19.9237 0.00011776 20.8877 1.62721 20.1584 2.95996L11.9582 17.9453C11.1994 19.3318 9.20816 19.3318 8.4494 17.9453L0.248226 2.95996C-0.480968 1.62718 0.483838 -1.409e-07 2.00311 0H18.4045Z"
        fill={color}
        fillOpacity={opacity}
      />
    </Svg>
  );
}
