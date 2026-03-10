import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
  Animated,
} from "react-native";
import { login } from "@react-native-seoul/kakao-login";

import { useAuth } from "@/hooks/useAuth";
import { setAccessToken } from "@/lib/tokenStore";
import { loginKakaoApi, refreshAccessTokenApi } from "@/services/api/auth";

import SplashLogo from "@/assets/icon/logo/SplashLogo";
import KakaoLogo from "@/assets/icon/logo/KakaoLogo";
import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    mainText: string;
    subText: string;
    buttonText: string;
    onRight?: (() => void) | null;
  }>({
    visible: false,
    mainText: "",
    subText: "",
    buttonText: "",
    onRight: null,
  });

  const anim = useRef(new Animated.Value(0)).current;
  const isAnyModalOpen = modalOpen || alertModal.visible;

  useEffect(() => {
    if (!isAnyModalOpen) {
      anim.setValue(0);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [isAnyModalOpen, anim]);

  const openAlertModal = (params: {
    mainText: string;
    subText: string;
    buttonText?: string;
    onRight?: (() => void) | null;
  }) => {
    setAlertModal({
      visible: true,
      mainText: params.mainText,
      subText: params.subText,
      buttonText: params.buttonText ?? "확인",
      onRight: params.onRight ?? null,
    });
  };

  const closeAlertModal = () =>
    setAlertModal((prev) => ({ ...prev, visible: false, onRight: null }));

  const onKakaoLogin = async () => {
    try {
      const kakaoToken = await login();
      const kakaoAccessToken = kakaoToken.accessToken;

      if (!kakaoAccessToken) {
        openAlertModal({
          mainText: "카카오 로그인을 완료할 수 없어요.",
          subText: "카카오 토큰을 가져오지 못했습니다.",
        });
        return;
      }

      const res = await loginKakaoApi(kakaoAccessToken);
      console.log("[loginKakaoApi] res =", res);

      await setAccessToken(res.accessToken);
      try {
        const rr = await refreshAccessTokenApi();
        console.log("[Refresh TEST] OK:", rr);
      } catch (e) {
        console.log("[Refresh TEST] FAIL:", e);
      }
      await refreshUser();

      if (res.signupStatus === "PROFILE_REQUIRED") {
        router.replace("/register");
        return;
      }

      router.replace("/(tabs)/nest");
    } catch (e: any) {
      console.log("[Login] Kakao login error:", e);
      openAlertModal({
        mainText: "카카오 로그인에 실패했어요.",
        subText: e?.message ?? "알 수 없는 오류가 발생했어요.",
      });
    }
  };

  const closeModal = () => setModalOpen(false);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const opacity = anim;

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>새를 기록하다</Text>
        <SplashLogo width={rs(103)} height={rs(53)} color="#4190FF" />
      </View>

      <View style={styles.bottom}>
        <Pressable onPress={onKakaoLogin} style={styles.kakaoBtn}>
          <View style={styles.kakaoRow}>
            <KakaoLogo width={rs(18)} height={rs(18)} />
            <Text style={styles.kakaoText}>카카오로 계속하기</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => setModalOpen(true)} style={styles.guestBtn}>
          <Text style={styles.guestText}>로그인 없이 이용하기</Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={modalOpen}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <Animated.View
            style={[styles.modalWrap, { opacity, transform: [{ scale }] }]}
          >
            <Pressable style={styles.card} onPress={() => {}}>
              <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

              <View style={styles.textBlock}>
                <Text style={styles.mainText}>로그인 없이 이용하시겠어요?</Text>
                <Text style={styles.subText}>
                  도감과 지도만 열람할 수 있어요!
                </Text>
              </View>

              <View style={styles.btnRow}>
                <Pressable style={styles.leftBtn} onPress={closeModal}>
                  <Text style={styles.leftBtnText}>취소</Text>
                </Pressable>

                <Pressable
                  style={styles.rightBtn}
                  onPress={() => {
                    closeModal();
                    router.replace("/(tabs)/map");
                  }}
                >
                  <Text style={styles.rightBtnText}>계속하기</Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={alertModal.visible}
        animationType="fade"
        onRequestClose={closeAlertModal}
      >
        <Pressable style={styles.backdrop} onPress={closeAlertModal}>
          <Animated.View
            style={[styles.modalWrap, { opacity, transform: [{ scale }] }]}
          >
            <Pressable style={styles.card} onPress={() => {}}>
              <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

              <View style={styles.textBlock}>
                <Text style={styles.mainText}>{alertModal.mainText}</Text>
                <Text style={styles.subText}>{alertModal.subText}</Text>
              </View>

              <View style={styles.singleBtnRow}>
                <Pressable
                  style={styles.singleRightBtn}
                  onPress={() => {
                    const onRight = alertModal.onRight;
                    closeAlertModal();
                    onRight?.();
                  }}
                >
                  <Text style={styles.rightBtnText}>
                    {alertModal.buttonText}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  title: { fontSize: rfs(18), color: "#4190FF", marginBottom: rs(8) },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: rs(80),
    paddingHorizontal: rs(24),
  },

  kakaoBtn: {
    height: rs(54),
    borderRadius: rs(10),
    backgroundColor: "#FEE500",
    justifyContent: "center",
    alignItems: "center",
  },

  kakaoRow: { flexDirection: "row", alignItems: "center", gap: rs(6) },
  kakaoText: { color: "#111827" },

  guestBtn: { marginTop: rs(24), alignItems: "center" },
  guestText: { color: "#9CA3AF" },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },

  modalWrap: { width: "100%", alignItems: "center" },

  card: {
    width: rs(316),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingHorizontal: rs(16),
    paddingVertical: rs(18),
    alignItems: "center",
    gap: rs(15),
  },

  textBlock: { alignItems: "center", gap: rs(6) },

  mainText: {
    textAlign: "center",
    color: "#111827",
    fontSize: rfs(14),
    fontFamily: font.money,
  },

  subText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: rfs(13),
    lineHeight: rfs(18),
    fontFamily: font.regular,
  },

  btnRow: {
    marginTop: rs(5),
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rs(16),
    paddingHorizontal: rs(4),
  },
  singleBtnRow: {
    marginTop: rs(5),
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  leftBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(15),
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1.5),
    borderColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  leftBtnText: { color: "#91BFFF" },

  rightBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  singleRightBtn: {
    width: "100%",
    height: rs(40),
    paddingHorizontal: rs(20),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  rightBtnText: { color: "#FFFFFF" },
});
