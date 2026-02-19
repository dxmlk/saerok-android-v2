import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import NicknameInput from "@/components/common/NicknameInput";
import { updateUserInfo } from "@/services/api/user";
import { rfs, rs } from "@/theme";

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
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateUserInfo({ nickname: nickname.trim() });

      if (result?.nickname) {
        setSubmitted(true);
      }
    } catch (e) {
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
              <Pressable onPress={() => router.back()} hitSlop={rs(10)}>
                <Text style={styles.back}>←</Text>
              </Pressable>
            </View>

            <Text style={styles.title}>회원가입</Text>
            <View style={{ marginTop: rs(22) }}>
              <Text style={styles.label}>닉네임 입력</Text>

              <View style={{ marginTop: rs(8) }}>
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
          <Text style={[styles.title, { marginTop: rs(92) }]}>
            회원가입이 완료됐습니다
          </Text>
        )}

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
  page: { flex: 1, paddingHorizontal: rs(24), paddingTop: rs(10) },
  header: { height: rs(60), justifyContent: "center" },
  back: { fontSize: rfs(18), fontWeight: "900", color: "#111827" },
  title: {
    marginTop: rs(10),
    fontSize: rfs(28),
    fontWeight: "900",
    color: "#111827",
  },
  label: { marginLeft: rs(4), color: "#111827", fontWeight: "700" },

  bottomBtn: {
    position: "absolute",
    left: rs(24),
    right: rs(24),
    bottom: rs(44),
    height: rs(52),
    borderRadius: rs(10),
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBtnText: { color: "#fff", fontSize: rfs(16), fontWeight: "800" },
});
