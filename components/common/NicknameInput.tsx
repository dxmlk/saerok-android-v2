// src/components/register/NicknameInput.tsx
import { validateNickname } from "@/lib/validateNickname";
import { checkNicknameAvailable } from "@/services/api/user";
import React, { FC, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { rfs, rs } from "@/theme";

type Props = {
  nickname: string;
  setNickname: React.Dispatch<React.SetStateAction<string>>;
  onCheckResult?: (isAvailable: boolean, error?: string) => void;
};

const NicknameInput: FC<Props> = ({
  nickname,
  setNickname,
  onCheckResult = () => {},
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDuplicationCheck = async () => {
    const n = nickname.trim();

    // 1) 유효성
    const validationError = validateNickname(n);
    if (validationError) {
      setErrorMessage(validationError);
      setIsAvailable(false);
      setChecked(true);
      onCheckResult(false, validationError);
      return;
    }

    // 2) 중복확인 API
    try {
      const res = await checkNicknameAvailable({ nickname: n });
      const ok = !!res.isAvailable;

      if (!ok) {
        const reason = res.reason || "이미 사용 중인 닉네임입니다.";
        setIsAvailable(false);
        setErrorMessage(reason);
        onCheckResult(false, reason);
      } else {
        setIsAvailable(true);
        setErrorMessage("");
        onCheckResult(true);
      }
    } catch (e) {
      const msg = "중복 확인 요청에 실패했습니다.";
      setErrorMessage(msg);
      setIsAvailable(false);
      onCheckResult(false, msg);
    } finally {
      setChecked(true);
    }
  };

  const borderColor = (() => {
    if (!checked) return isFocused ? "#2563eb" : "#E5E7EB";
    return isAvailable ? "#0EA5E9" : "#EF4444";
  })();

  return (
    <View>
      <View style={[styles.box, { borderColor }]}>
        <TextInput
          value={nickname}
          onChangeText={(t) => {
            setNickname(t);
            setChecked(false);
            setIsAvailable(null);
            setErrorMessage("");
            onCheckResult(false);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="닉네임을 입력하세요"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />

        {!checked ? (
          <Pressable
            onPress={handleDuplicationCheck}
            hitSlop={rs(10)}
            style={styles.checkBtn}
          >
            <Text style={styles.checkBtnText}>중복 확인</Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.badge,
              { backgroundColor: isAvailable ? "#0EA5E9" : "#EF4444" },
            ]}
          >
            <Text style={styles.badgeText}>{isAvailable ? "✓" : "!"}</Text>
          </View>
        )}
      </View>

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {checked && isAvailable && !errorMessage && (
        <Text style={styles.okText}>사용 가능한 닉네임입니다.</Text>
      )}
    </View>
  );
};

export default NicknameInput;

const styles = StyleSheet.create({
  box: {
    width: "100%",
    height: rs(44),
    borderWidth: rs(2),
    borderRadius: rs(10),
    paddingHorizontal: rs(14),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: { flex: 1, height: "100%", fontSize: rfs(14), color: "#111827" },
  checkBtn: { paddingLeft: rs(12), paddingVertical: rs(6) },
  checkBtnText: { color: "#2563eb", fontWeight: "700", fontSize: rfs(12) },
  badge: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(9),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: rs(10),
  },
  badgeText: { color: "#fff", fontSize: rfs(12), fontWeight: "900" },
  errorText: {
    marginTop: rs(6),
    marginLeft: rs(6),
    color: "#EF4444",
    fontSize: rfs(12),
  },
  okText: {
    marginTop: rs(6),
    marginLeft: rs(6),
    color: "#0EA5E9",
    fontSize: rfs(12),
  },
});
