import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { fetchNearbyCollections } from "@/services/api/collections";
import { useRouter } from "expo-router";

type Marker = {
  id: number;
  latitude: number;
  longitude: number;
  birdName?: string;
};

const DEFAULT_CENTER = { lat: 37.58939182281775, lng: 127.02990237554194 };

export default function MapIndex() {
  const router = useRouter();
  const webRef = useRef<WebView | null>(null);

  const NAVER_ID = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isMineOnly, setIsMineOnly] = useState(false);
  const [ready, setReady] = useState(false);

  /** 위치 권한 + 현재 위치 */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCenter(DEFAULT_CENTER);
        setReady(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCenter({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setReady(true);
    })();
  }, []);

  /** 주변 컬렉션 불러오기 */
  const loadNearby = async (c = center) => {
    try {
      const items = await fetchNearbyCollections({
        latitude: c.lat,
        longitude: c.lng,
        radiusMeters: 500,
        isMineOnly,
      });

      const mapped: Marker[] = items.map((x) => ({
        id: x.collectionId,
        latitude: x.latitude,
        longitude: x.longitude,
        birdName: x.koreanName ?? undefined,
      }));

      setMarkers(mapped);

      // WebView 지도에 마커 반영
      webRef.current?.postMessage(
        JSON.stringify({ type: "SET_MARKERS", markers: mapped })
      );
    } catch {
      setMarkers([]);
      webRef.current?.postMessage(
        JSON.stringify({ type: "SET_MARKERS", markers: [] })
      );
    }
  };

  useEffect(() => {
    if (!ready) return;
    loadNearby(center);
    webRef.current?.postMessage(JSON.stringify({ type: "SET_CENTER", center }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, center, isMineOnly]);

  const html = useMemo(() => {
    if (!NAVER_ID) {
      return `<html><body><h3>Missing EXPO_PUBLIC_NAVER_MAP_CLIENT_ID</h3></body></html>`;
    }

    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    html, body, #map { margin:0; padding:0; width:100%; height:100%; }
    .bubble {
      background: white; border-radius: 12px; padding: 8px 10px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.25);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
    }
  </style>
  <script src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_ID}"></script>
</head>
<body>
<div id="map"></div>
<script>
  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(${center.lat}, ${center.lng}),
    zoom: 14
  });

  var markers = [];

  function clearMarkers(){
    markers.forEach(m => m.setMap(null));
    markers = [];
  }

  function setCenter(lat,lng){
    map.setCenter(new naver.maps.LatLng(lat,lng));
  }

  function setMarkers(list){
    clearMarkers();
    list.forEach(function(it){
      var m = new naver.maps.Marker({
        position: new naver.maps.LatLng(it.latitude, it.longitude),
        map: map
      });
      naver.maps.Event.addListener(m, 'click', function(){
        window.ReactNativeWebView.postMessage(JSON.stringify({ type:'MARKER_CLICK', id: it.id }));
      });
      markers.push(m);
    });
  }

  document.addEventListener("message", function(e){
    try {
      var msg = JSON.parse(e.data);
      if(msg.type === "SET_CENTER"){
        setCenter(msg.center.lat, msg.center.lng);
      }
      if(msg.type === "SET_MARKERS"){
        setMarkers(msg.markers || []);
      }
    } catch {}
  });

  // RN WebView에서 postMessage 들어오는 경로(안드로이드 호환)
  window.addEventListener("message", function(e){
    try {
      var msg = JSON.parse(e.data);
      if(msg.type === "SET_CENTER"){
        setCenter(msg.center.lat, msg.center.lng);
      }
      if(msg.type === "SET_MARKERS"){
        setMarkers(msg.markers || []);
      }
    } catch {}
  });

</script>
</body>
</html>
`;
  }, [NAVER_ID, center.lat, center.lng]);

  return (
    <View style={{ flex: 1 }}>
      {/* 상단 컨트롤 */}
      <View
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          zIndex: 10,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => router.push("/saerok/search-place")}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: "#2563eb",
            backgroundColor: "#fff",
            justifyContent: "center",
            paddingHorizontal: 14,
          }}
        >
          <Text style={{ color: "#6b7280" }}>원하는 장소 검색</Text>
        </Pressable>

        <Pressable
          onPress={() => setIsMineOnly((x) => !x)}
          style={{
            height: 44,
            borderRadius: 10,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ddd",
            paddingHorizontal: 12,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "800" }}>
            {isMineOnly ? "내 것만" : "전체"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => loadNearby(center)}
          style={{
            height: 44,
            borderRadius: 10,
            backgroundColor: "#2563eb",
            paddingHorizontal: 12,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>재검색</Text>
        </Pressable>
      </View>

      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === "MARKER_CLICK") {
              router.push(`/saerok/${msg.id}`); // 상세 라우트에 맞게 수정
            }
          } catch {}
        }}
      />
    </View>
  );
}
