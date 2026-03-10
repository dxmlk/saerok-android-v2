import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  type NaverMapViewRef,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";

import SearchBar from "@/components/common/SearchBar";
import SimpleHeader from "@/components/common/SimpleHeader";
import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import { useSaerokForm } from "@/states/useSaerokForm";
import { reverseGeocodeNaver } from "@/services/naverReverseGeocode";
import PlaceConfirmMarkerIcon from "@/assets/icon/saerok/PlaceConfirmMarkerIcon";
import { font, rfs, rs } from "@/theme";

export default function SearchPlaceConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAddressDetails } = useSaerokForm();
  const { placeName, roadAddress, jibunAddress, lat, lng } =
    useLocalSearchParams<{
      placeName?: string;
      roadAddress?: string;
      jibunAddress?: string;
      lat?: string;
      lng?: string;
    }>();

  const [alias, setAlias] = useState("");
  const [aliasModalOpen, setAliasModalOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [marker, setMarker] = useState(() => ({
    latitude: Number(lat) || 37.5665,
    longitude: Number(lng) || 126.978,
  }));
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [resolving, setResolving] = useState(false);
  const mapRef = useRef<NaverMapViewRef>(null);

  const selectedAddress = useMemo(
    () => (resolvedAddress || roadAddress || jibunAddress || "").trim(),
    [resolvedAddress, roadAddress, jibunAddress],
  );

  React.useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates?.height ?? 0;
      setKeyboardHeight(Math.max(0, h - insets.bottom));
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom]);

  const resolveAddressAt = async (latitude: number, longitude: number) => {
    setResolving(true);
    try {
      const result = await reverseGeocodeNaver(latitude, longitude);
      setResolvedAddress(result.roadAddress || result.jibunAddress || "");
    } catch {
      // keep initial kakao address fallback
    } finally {
      setResolving(false);
    }
  };

  React.useEffect(() => {
    void resolveAddressAt(marker.latitude, marker.longitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyLocation = (withAlias: boolean) => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return;

    setAddressDetails({
      address: selectedAddress,
      locationAlias: withAlias ? alias.trim() : "",
      latitude: parsedLat,
      longitude: parsedLng,
    });

    setAliasModalOpen(false);
    if ((router as any).dismiss) {
      (router as any).dismiss(2);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      <SimpleHeader title="장소 찾기" />

      <View style={styles.searchSection}>
        <SearchBar
          value={placeName ?? ""}
          onChangeText={() => {}}
          placeholder=""
          onBack={() => router.back()}
          onClear={() => {}}
          editable={false}
        />
      </View>

      <View style={styles.mapArea}>
        <NaverMapView
          ref={mapRef}
          style={styles.map}
          initialCamera={{
            latitude: marker.latitude,
            longitude: marker.longitude,
            zoom: 16,
          }}
          onCameraChanged={(e: any) => {
            setMarker({
              latitude: Number(e.latitude),
              longitude: Number(e.longitude),
            });
          }}
          onCameraIdle={(e: any) => {
            const next = {
              latitude: Number(e.latitude),
              longitude: Number(e.longitude),
            };
            setMarker(next);
            void resolveAddressAt(next.latitude, next.longitude);
          }}
        ></NaverMapView>

        <View pointerEvents="none" style={styles.markerOverlay}>
          <PlaceConfirmMarkerIcon width={rs(71)} height={rs(85)} />
        </View>

        {resolving ? (
          <View style={styles.mapLoadingChip}>
            <ActivityIndicator size="small" color="#91BFFF" />
            <Text style={styles.mapLoadingText}>
              {"\uc8fc\uc18c \ud655\uc778 \uc911..."}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => setAliasModalOpen(true)}
          style={styles.confirmBtn}
        >
          <Text style={styles.confirmBtnText}>
            {"\uc120\ud0dd\ud558\uae30"}
          </Text>
        </Pressable>
      </View>

      <Modal visible={aliasModalOpen} transparent animationType="fade">
        <Pressable style={styles.dim} onPress={() => setAliasModalOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                paddingBottom: rs(58) + insets.bottom,
                marginBottom: keyboardHeight,
              },
            ]}
            onPress={() => {}}
          >
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{"어디서 봤냐면요..."}</Text>
                <Text style={styles.sheetSub}>
                  {"이 장소가 어디인지 소개해주세요!"}
                </Text>
              </View>
              <Pressable hitSlop={12} onPress={() => setAliasModalOpen(false)}>
                <CloseLineIcon width={rs(24)} height={rs(24)} color="#979797" />
              </Pressable>
            </View>

            <TextInput
              value={alias}
              onChangeText={setAlias}
              placeholder="ex. 난지한강공원, 푸르른 산속 ..."
              placeholderTextColor="#D0D5D4"
              style={styles.aliasInput}
            />

            <Text style={styles.addressText}>{selectedAddress}</Text>

            <Pressable
              style={styles.applyBtn}
              onPress={() => applyLocation(true)}
            >
              <Text style={styles.applyBtnText}>
                {"\ubc1c\uacac \uc7a5\uc18c \ub4f1\ub85d"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.skipBtn}
              onPress={() => applyLocation(false)}
            >
              <Text style={styles.skipBtnText}>
                {"\uac74\ub108\ub6f0\uae30"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  mapArea: {
    flex: 1,
    backgroundColor: "#EDEFF0",
    justifyContent: "flex-end",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerOverlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -rs(35.5),
    marginTop: -rs(75),
  },
  mapLoadingChip: {
    position: "absolute",
    top: rs(14),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: rs(14),
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
  },
  mapLoadingText: {
    color: "#979797",
    fontFamily: "Pretendard",
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  confirmBtn: {
    marginHorizontal: rs(24),
    height: rs(56),
    borderRadius: rs(16),
    backgroundColor: "#A8BFF6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(24),
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontFamily: "Pretendard",
    fontWeight: "600",
    fontSize: rfs(16),
    lineHeight: rfs(19),
  },
  dim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    paddingHorizontal: rs(24),
    paddingTop: rs(18),
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(8),
  },
  sheetTitle: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(18),
    lineHeight: rfs(22),
  },
  sheetSub: {
    marginTop: rs(4),
    color: "#979797",
    fontFamily: "Pretendard",
    fontSize: rfs(14),
    lineHeight: rfs(18),
  },
  aliasInput: {
    marginTop: rs(18),
    height: rs(48),
    borderRadius: rs(14),
    borderWidth: rs(1.5),
    borderColor: "#D7D9D9",
    paddingHorizontal: rs(16),
    color: "#0D0D0D",
    fontFamily: "Pretendard",
    fontSize: rfs(14),
  },
  addressText: {
    marginTop: rs(12),
    color: "#979797",
    fontFamily: "Pretendard",
    fontSize: rfs(13),
    lineHeight: rfs(16),
  },
  applyBtn: {
    marginTop: rs(24),
    height: rs(56),
    borderRadius: rs(16),
    backgroundColor: "#A8BFF6",
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontFamily: "Pretendard",
    fontWeight: "600",
    fontSize: rfs(16),
    lineHeight: rfs(19),
  },
  skipBtn: {
    marginTop: rs(14),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtnText: {
    color: "#979797",
    fontFamily: "Pretendard",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "500",
  },
});
