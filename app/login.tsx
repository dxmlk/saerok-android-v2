import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!modalOpen) {
      anim.setValue(0);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [modalOpen, anim]);

  const onKakaoLogin = async () => {
    try {
      const kakaoToken = await login();
      const kakaoAccessToken = kakaoToken.accessToken;

      if (!kakaoAccessToken) {
        Alert.alert("로그인 실패", "카카오 토큰을 가져오지 못했습니다.");
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
      Alert.alert("카카오 로그인 실패", e?.message ?? "알 수 없는 오류");
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
              <NoticeIcon width={rs(30)} height={rs(30)} color="#4190FF" />

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
    borderRadius: rs(10),
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

  leftBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(10),
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1.5),
    borderColor: "#4190FF",
    alignItems: "center",
    justifyContent: "center",
  },
  leftBtnText: { color: "#4190FF" },

  rightBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(10),
    backgroundColor: "#4190FF",
    alignItems: "center",
    justifyContent: "center",
  },
  rightBtnText: { color: "#FFFFFF" },
});
