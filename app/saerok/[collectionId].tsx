import AppAlertModal from "@/components/common/AppAlertModal";
import {
  FreeBoardUploadErrorToast,
  FreeBoardUploadSuccessToast,
} from "@/components/common/AppToast";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import SaerokDetailHeader from "@/components/saerok/SaerokDetailHeader";
import SaerokInfo from "@/components/saerok/SaerokInfo";
import {
  CollectionDetail,
  fetchCollectionDetail,
} from "@/services/api/collections";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Pressable,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Rect } from "react-native-svg";
import { font } from "@/theme";
import { rfs, rs } from "@/theme/scale";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import Share, { Social } from "react-native-share";

const INSTAGRAM_PACKAGE_NAME = "com.instagram.android";
const INSTAGRAM_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.instagram.android";
const INSTAGRAM_STORIES_APP_ID = process.env.EXPO_PUBLIC_META_APP_ID ?? "0";

function FloatingSendIcon() {
  return (
    <Svg width={rs(36)} height={rs(36)} viewBox="0 0 36 36" fill="none">
      <Path
        d="M29.1534 2.81907L4.08551 18.8383C2.75535 19.6884 3.25686 21.7408 4.82913 21.8816L18.2443 23.0831C18.7396 23.1275 19.1887 23.3922 19.4675 23.8041L26.0792 33.5747C26.9509 34.8629 28.957 34.3464 29.0983 32.7975L31.693 4.3642C31.8181 2.99363 30.3131 2.07799 29.1534 2.81907Z"
        fill="#FEFEFE"
      />
      <Path
        d="M28 8L21 20"
        stroke="#4190FF"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.4277 2.42871C19.1133 2.42871 20.501 3.81559 20.501 5.55176C20.5008 7.28778 19.1132 8.67383 17.4277 8.67383C15.7425 8.67357 14.3556 7.28761 14.3555 5.55176C14.3555 3.81575 15.7424 2.42897 17.4277 2.42871Z"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Path
        d="M5.57227 9.35938C7.25783 9.35938 8.64551 10.7463 8.64551 12.4824C8.64534 14.2184 7.25773 15.6045 5.57227 15.6045C3.88702 15.6042 2.50017 14.2183 2.5 12.4824C2.5 10.7464 3.88692 9.35964 5.57227 9.35938Z"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Path
        d="M17.4277 15.3262C19.1133 15.3262 20.501 16.713 20.501 18.4492C20.5008 20.1852 19.1132 21.5713 17.4277 21.5713C15.7425 21.571 14.3556 20.1851 14.3555 18.4492C14.3555 16.7132 15.7424 15.3264 17.4277 15.3262Z"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Path
        d="M8.24414 10.6689L14.5312 7.27441"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Path
        d="M8.24414 14.3262L14.5313 17.3154"
        stroke="#91BFFF"
        strokeWidth={2}
      />
    </Svg>
  );
}

function InstagramIcon() {
  return (
    <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="4"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Rect
        x="8.44336"
        y="8.44336"
        width="7.1123"
        height="7.1123"
        rx="3.55615"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Path
        d="M17.4336 5.01172A1.5 1.5 0 1 1 17.4336 8.01172A1.5 1.5 0 0 1 17.4336 5.01172Z"
        fill="#91BFFF"
      />
    </Svg>
  );
}

function SaveImageIcon() {
  return (
    <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.57666 7.71387C4.04904 7.71387 2 9.76291 2 12.2905V16.9996C2 19.761 4.23858 21.9996 7 21.9996H12.5263"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Path
        d="M17.4233 7.71387C19.951 7.71387 22 9.76291 22 12.2905V16.9996C22 19.761 19.7614 21.9996 17 21.9996H11.4737"
        stroke="#91BFFF"
        strokeWidth={2}
      />
      <Path
        d="M12 17V2M16 13.2586L12 17L8 13.2586"
        stroke="#91BFFF"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CloseShareIcon() {
  return (
    <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 3.4873L20.5 20.4873"
        stroke="#0D0D0D"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M20.5 3.4873L3.5 20.4873"
        stroke="#0D0D0D"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SaerokShareLogoIcon() {
  return (
    <Svg width={rs(28)} height={rs(31)} viewBox="0 0 28 31" fill="none">
      <Path
        d="M14.5765 16.7091C16.8988 18.1192 20.5549 17.9897 23.3636 16.4527C25.9052 15.2158 27.8688 12.127 27.9694 9.20805C28.2405 6.30085 26.6864 2.96893 24.3242 1.39291C23.186 0.567709 21.6578 0.0543198 20.0195 0.00410441C18.3813 -0.046111 16.633 0.366847 15.122 1.11084C4.06427 6.47897 -1.69947 18.8644 0.441688 30.799C0.453319 30.9068 0.572467 31.0086 0.676278 30.9994C0.78027 31.006 0.897046 30.9013 0.906199 30.7933C1.23377 28.6108 1.98376 25.9677 2.73508 24.2315C3.70481 25.4118 5.29859 26.3464 6.98186 26.579C8.66514 26.8116 10.4379 26.342 11.6698 25.466C12.8608 24.6799 13.933 23.3024 14.436 21.7144C14.9391 20.1265 14.873 18.328 14.3385 16.9251C14.3126 16.8629 14.3343 16.773 14.3854 16.7309C14.4324 16.6839 14.5209 16.6738 14.5765 16.7091Z"
        fill="#91BFFF"
      />
    </Svg>
  );
}

function formatShareDate(dateString?: string | null) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return "";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${day} ${months[month - 1]}, ${year}`;
}

export default function SaerokDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const shareCardRef = useRef<View>(null);
  const shareCaptureCardRef = useRef<View>(null);
  const instagramStickerCaptureRef = useRef<View>(null);
  const params = useLocalSearchParams<{
    collectionId: string;
    from?: string;
    returnTo?: string;
    returnCollectionId?: string;
    returnLat?: string;
    returnLng?: string;
  }>();
  const idNum = Number(params.collectionId);
  const navigation = useNavigation();

  const { user, loading: authLoading } = useAuth();

  const [item, setItem] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharingShareImage, setSharingShareImage] = useState(false);
  const [sharingInstagramImage, setSharingInstagramImage] = useState(false);
  const [savingShareImage, setSavingShareImage] = useState(false);
  const [showSaveSuccessToast, setShowSaveSuccessToast] = useState(false);
  const [showSaveErrorToast, setShowSaveErrorToast] = useState(false);
  const [showShareErrorToast, setShowShareErrorToast] = useState(false);
  const shareLayout = useMemo(() => {
    const buttonTop = height - insets.bottom - rs(34) - rs(62);
    const cardWidth = width - rs(50);
    const imageWidth = cardWidth - rs(20);
    const metadataHeight = rs(101);
    const topGap = rs(58);
    const headerHeight = rs(40);
    const titleCardGap = rs(20);
    const defaultGap2 = rs(23);
    const minGap2 = rs(12);
    const actionHeight = rs(136);
    const imageHeight = rs(320);
    const cardHeight = rs(10) + imageHeight + rs(10) + metadataHeight;
    const actionTop = buttonTop - rs(12) - actionHeight;
    const cardTop = topGap + headerHeight + titleCardGap;
    const gap2 = Math.max(
      minGap2,
      Math.min(defaultGap2, actionTop - cardTop - cardHeight),
    );

    return {
      topGap,
      gap2,
      cardWidth,
      cardHeight,
      imageWidth,
      imageHeight,
    };
  }, [height, insets.bottom, width]);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setLoading(false);
      setAlertModalOpen(true);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetchCollectionDetail(idNum);
        setItem(res);
      } catch {
        setItem(null);
        setAlertModalOpen(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [idNum]);

  const captureShareImage = useCallback(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    return captureRef(shareCaptureCardRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
  }, []);

  const captureInstagramStoryImage = useCallback(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const base64 = await captureRef(instagramStickerCaptureRef, {
      format: "png",
      quality: 1,
      result: "base64",
    });

    return `data:image/png;base64,${base64}`;
  }, []);

  const shareShareImage = useCallback(async () => {
    if (!shareCaptureCardRef.current || sharingShareImage) return;

    try {
      setSharingShareImage(true);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        setShowShareErrorToast(true);
        return;
      }

      const uri = await captureShareImage();
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "새록 공유하기",
        UTI: "public.png",
      });
    } catch {
      setShowShareErrorToast(true);
    } finally {
      setSharingShareImage(false);
    }
  }, [captureShareImage, sharingShareImage]);

  const shareToInstagramStory = useCallback(async () => {
    if (!instagramStickerCaptureRef.current || sharingInstagramImage) return;

    try {
      setSharingInstagramImage(true);

      if (Platform.OS === "android") {
        const instagram = await Share.isPackageInstalled(
          INSTAGRAM_PACKAGE_NAME
        ).catch(() => ({ isInstalled: false }));

        if (!instagram.isInstalled) {
          await Linking.openURL(INSTAGRAM_PLAY_STORE_URL);
          return;
        }
      }

      const uri = await captureInstagramStoryImage();
      await Share.shareSingle({
        social: Social.InstagramStories,
        appId: INSTAGRAM_STORIES_APP_ID,
        stickerImage: uri,
        backgroundTopColor: "#FEFEFE",
        backgroundBottomColor: "#DDEBFF",
      });
    } catch {
      setShowShareErrorToast(true);
    } finally {
      setSharingInstagramImage(false);
    }
  }, [captureInstagramStoryImage, sharingInstagramImage]);

  const saveShareImage = useCallback(async () => {
    if (!shareCaptureCardRef.current || savingShareImage) return;

    try {
      setSavingShareImage(true);

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        setShowSaveSuccessToast(false);
        setShowSaveErrorToast(true);
        return;
      }

      const uri = await captureShareImage();

      await MediaLibrary.saveToLibraryAsync(uri);
      setShowSaveErrorToast(false);
      setShowSaveSuccessToast(true);
    } catch {
      setShowSaveSuccessToast(false);
      setShowSaveErrorToast(true);
    } finally {
      setSavingShareImage(false);
    }
  }, [captureShareImage, savingShareImage]);

  // Handle hardware back button to respect returnTo
  // Must be placed before the early return to avoid Hook order violations
  useEffect(() => {
    const returnTo = params.returnTo as string | undefined;
    const returnCollectionId = params.returnCollectionId as string | undefined;
    const returnLat = params.returnLat as string | undefined;
    const returnLng = params.returnLng as string | undefined;

    if (!returnTo) return;

    const onHardwareBack = () => {
      // Prefer react-navigation canGoBack when available
      // @ts-ignore
      if (
        navigation &&
        (navigation.canGoBack ? navigation.canGoBack() : false)
      ) {
        // @ts-ignore
        navigation.goBack();
        return true;
      }
      // Otherwise replace to the provided returnTo path
      const paramsObj: any = {};
      if (returnTo === "/map" && returnLat && returnLng) {
        paramsObj.lat = returnLat;
        paramsObj.lng = returnLng;
      } else if (returnCollectionId) {
        paramsObj.collectionId = returnCollectionId;
      }
      router.replace({ pathname: returnTo as any, params: paramsObj } as any);
      return true;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBack,
    );
    return () => sub.remove();
  }, [
    params.returnTo,
    params.returnCollectionId,
    params.returnLat,
    params.returnLng,
    navigation,
    router,
  ]);

  useEffect(() => {
    if (!shareOpen) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setShareOpen(false);
      return true;
    });

    return () => sub.remove();
  }, [shareOpen]);

  if (loading || authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4190FF" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <AppAlertModal
          visible={alertModalOpen}
          mainText="오류"
          subText="잘못된 접근입니다."
          onClose={() => {
            setAlertModalOpen(false);
            router.back();
          }}
          onConfirm={() => router.back()}
        />
      </View>
    );
  }

  const isMine =
    !!user && item.user?.nickname && item.user.nickname === user.nickname;

  const renderShareCardContent = () => (
    <>
      {item.imageUrl ? (
        <View
          style={[
            styles.shareImageFrame,
            {
              width: shareLayout.imageWidth,
              height: shareLayout.imageHeight,
            },
          ]}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.shareImage}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <View style={styles.shareMetadata}>
        <Text style={styles.shareBirdName} numberOfLines={1}>
          {item.bird?.koreanName ?? "이름 모를 새"}
        </Text>
        <Text style={styles.shareDateText} numberOfLines={1}>
          {formatShareDate(item.discoveredDate)}
        </Text>
        <Text style={styles.shareLocationText} numberOfLines={1}>
          {item.locationAlias}
        </Text>
        <View style={styles.shareLogoWrap}>
          <SaerokShareLogoIcon />
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F2F2F2" }}
      edges={["top"]}
    >
      <SaerokDetailHeader
        birdId={item.bird?.birdId ?? null}
        collectionId={item.collectionId}
        isMine={isMine}
        user={{
          userId: item.user?.userId,
          nickname: item.user?.nickname,
          thumbnailProfileImageUrl: item.user?.thumbnailProfileImageUrl ?? null,
        }}
        returnTo={params.returnTo}
        returnCollectionId={params.returnCollectionId}
        returnLat={params.returnLat}
        returnLng={params.returnLng}
      />
      <SaerokInfo
        collectionId={item.collectionId}
        img={item.imageUrl ?? null}
        date={item.discoveredDate}
        createdAt={item.createdAt}
        latitude={item.latitude}
        longitude={item.longitude}
        accessLevel={item.accessLevel}
        address={item.address}
        locationAlias={item.locationAlias}
        note={item.note}
        birdInfo={{
          birdId: item.bird?.birdId ?? null,
          koreanName: item.bird?.koreanName ?? null,
          scientificName: item.bird?.scientificName ?? null,
        }}
        user={{
          userId: item.user?.userId,
          nickname: item.user?.nickname,
          thumbnailProfileImageUrl: item.user?.thumbnailProfileImageUrl ?? null,
        }}
        isMine={isMine}
      />
      {isMine && shareOpen ? (
        <View style={[styles.shareOverlay, { top: -insets.top }]}>
          <Pressable
            style={styles.shareBackdrop}
            onPress={() => setShareOpen(false)}
          />
          <View style={{ height: shareLayout.topGap }} />
          <View style={styles.shareHeader}>
            <Text style={styles.shareTitle}>내 새록을 공유해보세요!</Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.shareCloseButton}
              onPress={() => setShareOpen(false)}
            >
              <CloseShareIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.shareTitleCardGap} />
          <View
            ref={shareCardRef}
            collapsable={false}
            style={[styles.shareImageCard, { height: shareLayout.cardHeight }]}
          >
            {renderShareCardContent()}
          </View>

          <View
            ref={shareCaptureCardRef}
            collapsable={false}
            pointerEvents="none"
            style={[
              styles.shareImageCard,
              styles.shareImageCardCapture,
              {
                width: shareLayout.cardWidth,
                height: shareLayout.cardHeight,
              },
            ]}
          >
            {renderShareCardContent()}
          </View>

          <View
            ref={instagramStickerCaptureRef}
            collapsable={false}
            pointerEvents="none"
            style={[
              styles.shareImageCard,
              styles.instagramStickerCapture,
              {
                width: shareLayout.cardWidth,
                height: shareLayout.cardHeight,
              },
            ]}
          >
            {renderShareCardContent()}
          </View>

          <View style={{ height: shareLayout.gap2 }} />
          <View
            style={[
              styles.shareActionColumn,
              { bottom: insets.bottom + rs(34) + rs(62) + rs(12) },
            ]}
          >
            <TouchableOpacity
              style={styles.shareActionButton}
              disabled={sharingShareImage}
              onPress={shareShareImage}
            >
              <ShareIcon />
              <Text style={styles.shareActionText}>공유하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareActionButton}
              disabled={sharingInstagramImage}
              onPress={shareToInstagramStory}
            >
              <InstagramIcon />
              <Text style={styles.shareActionText}>
                인스타그램으로 공유하기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareActionButton}
              disabled={savingShareImage}
              onPress={saveShareImage}
            >
              <SaveImageIcon />
              <Text style={styles.shareActionText}>이미지 저장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
      {isMine ? (
        <TouchableOpacity
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.floatingButtonWrap,
            { bottom: insets.bottom + rs(34) },
            shareOpen && styles.floatingButtonWrapOpen,
            !pressed && styles.floatingButtonShadow,
          ]}
          onPress={() => setShareOpen((v) => !v)}
        >
          <View style={styles.floatingButton}>
            <View style={styles.floatingIconWrap}>
              <FloatingSendIcon />
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
      <FreeBoardUploadSuccessToast
        visible={showSaveSuccessToast}
        message="이미지를 저장했어요."
        onClose={() => setShowSaveSuccessToast(false)}
      />
      <FreeBoardUploadErrorToast
        visible={showSaveErrorToast}
        message="이미지 저장에 실패했어요."
        onClose={() => setShowSaveErrorToast(false)}
      />
      <FreeBoardUploadErrorToast
        visible={showShareErrorToast}
        message="이미지 공유에 실패했어요."
        onClose={() => setShowShareErrorToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  shareOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 80,
    elevation: 20,
  },
  shareBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 13, 13, 0.60)",
  },
  shareHeader: {
    height: rs(40),
    paddingLeft: rs(24),
    paddingRight: rs(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },
  shareTitle: {
    color: "#FFFFFF",
    fontFamily: font.haru,
    fontSize: rfs(22),
    fontWeight: "400",
    lineHeight: rfs(33),
  },
  shareCloseButton: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "rgba(254, 254, 254, 0.60)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: rs(8),
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  shareTitleCardGap: {
    height: rs(20),
  },
  shareImageCard: {
    marginLeft: rs(25),
    marginRight: rs(25),
    borderRadius: rs(20),
    backgroundColor: "#F2F2F2",
    paddingTop: rs(10),
    alignItems: "center",
    zIndex: 1,
    overflow: "hidden",
  },
  shareImageCardCapture: {
    position: "absolute",
    left: -10000,
    top: -10000,
    marginLeft: 0,
    marginRight: 0,
    borderRadius: 0,
    zIndex: -1,
  },
  instagramStickerCapture: {
    position: "absolute",
    left: -10000,
    top: -10000,
    marginLeft: 0,
    marginRight: 0,
    zIndex: -1,
  },
  shareImageFrame: {
    borderRadius: rs(10),
    overflow: "hidden",
    backgroundColor: "#E5E5E5",
  },
  shareImage: {
    width: "100%",
    height: "100%",
  },
  shareMetadata: {
    alignSelf: "stretch",
    height: rs(101),
    marginTop: rs(10),
    position: "relative",
  },
  shareBirdName: {
    position: "absolute",
    left: rs(15),
    top: rs(2),
    right: rs(150),
    color: "#000000",
    fontFamily: font.money,
    fontSize: rfs(22),
    fontWeight: "400",
  },
  shareDateText: {
    position: "absolute",
    right: rs(15),
    top: 0,
    maxWidth: rs(155),
    color: "#6D6D6D",
    fontFamily: font.regular,
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
    textAlign: "right",
  },
  shareLocationText: {
    position: "absolute",
    right: rs(15),
    top: rs(18),
    maxWidth: rs(155),
    color: "#6D6D6D",
    fontFamily: font.regular,
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
    textAlign: "right",
  },
  shareLogoWrap: {
    position: "absolute",
    right: rs(16.12),
    top: rs(58),
  },
  shareActionColumn: {
    position: "absolute",
    right: rs(25),
    alignItems: "flex-end",
    gap: rs(8),
    zIndex: 1,
  },
  shareActionButton: {
    height: rs(40),
    paddingVertical: rs(9),
    paddingHorizontal: rs(15),
    borderRadius: rs(20),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(10),
  },
  shareActionText: {
    color: "#0D0D0D",
    fontFamily: font.medium,
    fontSize: rfs(15),
    lineHeight: rfs(18),
  },
  floatingButtonWrap: {
    position: "absolute",
    right: rs(23),
    width: rs(62),
    height: rs(62),
    borderRadius: rs(31),
    backgroundColor: "#4190FF",
    zIndex: 30,
  },
  floatingButtonWrapOpen: {
    zIndex: 90,
    elevation: 24,
  },
  floatingButtonShadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: rs(10),
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  floatingButton: {
    width: rs(62),
    height: rs(62),
    borderRadius: rs(31),
  },
  floatingIconWrap: {
    position: "absolute",
    left: rs(10.16),
    top: (rs(62) - rs(35.5738)) / 2,
    width: rs(36),
    height: rs(36),
  },
});
