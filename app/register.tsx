import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import NicknameInput from "@/components/common/NicknameInput";
import { updateUserInfo } from "@/services/api/user";

export default function RegisterScreen() {
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isNicknameOk, setIsNicknameOk] = useState(false);
  const [nicknameErr, setNicknameErr] = useState<string | undefined>(undefined);

  const canSubmit = useMemo(() => {
    return !isLoading && !!nickname.trim() && isNicknameOk && !nicknameErr;
  }, [isLoading, nickname, isNicknameOk, nicknameErr]);

  const handleSubmit = async () => {
    if (!nickname.trim()) return;

    if (!isNicknameOk || nicknameErr) {
      // 중복확인 안 했거나 실패한 상태
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateUserInfo({ nickname: nickname.trim() });

      if (result?.nickname) {
        setSubmitted(true);
      }
    } catch (e) {
      // 필요하면 Alert로 바꾸셔도 됩니다.
      console.log("[Register] updateUserInfo ERROR", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        {!submitted ? (
          <>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} hitSlop={10}>
                <Text style={styles.back}>←</Text>
              </Pressable>
            </View>

            <Text style={styles.title}>회원가입</Text>

            <View style={{ marginTop: 22 }}>
              <Text style={styles.label}>닉네임 입력(필수)</Text>

              <View style={{ marginTop: 8 }}>
                <NicknameInput
                  nickname={nickname}
                  setNickname={setNickname}
                  onCheckResult={(ok, err) => {
                    setIsNicknameOk(ok);
                    setNicknameErr(err);
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <Text style={[styles.title, { marginTop: 92 }]}>
            회원가입이 완료됐어요
          </Text>
        )}

        {/* 하단 버튼 */}
        {!submitted ? (
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.bottomBtn, { opacity: canSubmit ? 1 : 0.45 }]}
          >
            <Text style={styles.bottomBtnText}>
              {isLoading ? "처리 중..." : "다음"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.replace("/(tabs)/nest")}
            style={styles.bottomBtn}
          >
            <Text style={styles.bottomBtnText}>새록 시작하기</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  page: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  header: { height: 60, justifyContent: "center" },
  back: { fontSize: 18, fontWeight: "900", color: "#111827" },
  title: { marginTop: 10, fontSize: 28, fontWeight: "900", color: "#111827" },
  label: { marginLeft: 4, color: "#111827", fontWeight: "700" },

  bottomBtn: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 44,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
