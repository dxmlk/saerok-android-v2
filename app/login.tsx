import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { login } from "@react-native-seoul/kakao-login";

import { useAuth } from "@/hooks/useAuth";
import { setAccessToken } from "@/lib/tokenStore";
import { loginKakaoApi } from "@/services/api/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const onKakaoLogin = async () => {
    try {
      // 1) 카카오 네이티브 로그인 → 카카오 accessToken 획득
      const kakaoToken = await login();
      console.log("[Kakao] token =", kakaoToken);
      const kakaoAccessToken = kakaoToken.accessToken;

      if (!kakaoAccessToken) {
        Alert.alert("로그인 실패", "카카오 토큰을 가져오지 못했습니다.");
        return;
      }

      // 2) 백엔드로 카카오 accessToken 전달 → 우리 서비스 accessToken(JWT 등) 발급
      const res = await loginKakaoApi(kakaoAccessToken);

      // 3) 우리 서비스 토큰 저장 + 유저 로드
      await setAccessToken(res.accessToken);
      await refreshUser();

      // 4) 가입 상태 분기
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

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{ textAlign: "center", marginBottom: 18, fontWeight: "800" }}
      >
        새를 기록하다
      </Text>

      <Pressable
        onPress={onKakaoLogin}
        style={{
          height: 54,
          borderRadius: 10,
          backgroundColor: "#FEE500",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "800" }}>카카오로 계속하기</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/(tabs)/nest")}
        style={{ marginTop: 18 }}
      >
        <Text style={{ textAlign: "center", color: "#6B7280" }}>
          로그인 없이 이용하기
        </Text>
      </Pressable>
    </View>
  );
}
