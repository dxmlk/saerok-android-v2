import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { rfs, rs } from "@/theme";

type Props = {
  nickname: string;
  setNickname: (v: string) => void;
  initialNickname?: string; // placeholder용
  onCheckResult?: (isAvailable: boolean, error?: string) => void;
  validateNickname?: (v: string) => string | null;
  checkNicknameAvailable: (params: { nickname: string }) => Promise<{
    isAvailable: boolean;
    reason?: string;
  }>;
  helperText?: string;
};

const ACTIVE_BLUE = "#91BFFF";
const INACTIVE_GRAY = "#D1D5DB";
const TEXT_BLACK = "#0D0D0D";
const PLACEHOLDER = "#DAE0DE";
const WHITE = "#FEFEFE";

export default function NicknameInput({
  nickname,
  setNickname,
  initialNickname,
  onCheckResult = () => {},
  validateNickname = defaultValidateNickname,
  checkNicknameAvailable,
  helperText,
}: Props) {
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<
    boolean | null
  >(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const trimmed = useMemo(() => nickname.trim(), [nickname]);
  const initialTrimmed = useMemo(
    () => (initialNickname ?? "").trim(),
    [initialNickname],
  );

  const isEmpty = trimmed.length === 0;
  const isDirty = useMemo(
    () => trimmed !== initialTrimmed,
    [trimmed, initialTrimmed],
  );
  const isIdleState = isEmpty || !isDirty;

  const inputBorderColor = useMemo(() => {
    if (isButtonClicked) {
      if (isNicknameAvailable) return ACTIVE_BLUE;
      return "#EF4444";
    }
    return isIdleState ? INACTIVE_GRAY : ACTIVE_BLUE;
  }, [isButtonClicked, isNicknameAvailable, isIdleState]);

  const checkBorderColor = useMemo(() => {
    if (isButtonClicked) {
      if (isNicknameAvailable) return ACTIVE_BLUE;
      return INACTIVE_GRAY;
    }
    return isIdleState ? INACTIVE_GRAY : ACTIVE_BLUE;
  }, [isButtonClicked, isNicknameAvailable, isIdleState]);

  const checkBgColor = useMemo(() => {
    if (isButtonClicked) {
      if (isNicknameAvailable) return ACTIVE_BLUE;
      return INACTIVE_GRAY;
    }
    return isIdleState ? INACTIVE_GRAY : ACTIVE_BLUE;
  }, [isButtonClicked, isNicknameAvailable, isIdleState]);

  const canPressCheck = useMemo(() => {
    return !isIdleState && !loading && !isButtonClicked;
  }, [isIdleState, loading, isButtonClicked]);

  const helperOrEmpty = useMemo(() => {
    if (errorMessage) return { type: "error" as const, text: errorMessage };
    if (isButtonClicked && isNicknameAvailable)
      return { type: "success" as const, text: "사용 가능한 닉네임입니다." };
    if (helperText) return { type: "helper" as const, text: helperText };
    return { type: "none" as const, text: "" };
  }, [errorMessage, isButtonClicked, isNicknameAvailable, helperText]);

  const placeholderText = useMemo(() => {
    const s = (initialNickname ?? "").trim();
    return s.length > 0 ? s : "닉네임 입력";
  }, [initialNickname]);

  const handleDuplicationCheck = async () => {
    if (!canPressCheck) return;

    const value = nickname.trim();
    const validationError = validateNickname(value);
    if (validationError) {
      setErrorMessage(validationError);
      setIsNicknameAvailable(false);
      setIsButtonClicked(true);
      onCheckResult(false, validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await checkNicknameAvailable({ nickname: value });
      const ok = !!res.isAvailable;

      if (!ok) {
        const msg = res.reason || "이미 사용 중인 닉네임입니다.";
        setIsNicknameAvailable(false);
        setErrorMessage(msg);
        onCheckResult(false, msg);
      } else {
        setIsNicknameAvailable(true);
        setErrorMessage("");
        onCheckResult(true);
      }
    } catch {
      const msg = "중복 확인 요청에 실패했습니다.";
      setIsNicknameAvailable(false);
      setErrorMessage(msg);
      onCheckResult(false, msg);
    } finally {
      setIsButtonClicked(true);
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <View style={[styles.inputBox, { borderColor: inputBorderColor }]}>
          <TextInput
            value={nickname}
            onChangeText={(text) => {
              setNickname(text);
              setIsButtonClicked(false);
              setIsNicknameAvailable(null);
              setErrorMessage("");
              onCheckResult(false);
            }}
            style={styles.input}
            placeholder={placeholderText}
            placeholderTextColor={PLACEHOLDER}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {!isButtonClicked ? (
          <Pressable
            onPress={handleDuplicationCheck}
            disabled={!canPressCheck}
            style={[
              styles.checkBox,
              { borderColor: checkBorderColor, backgroundColor: checkBgColor },
            ]}
            hitSlop={rs(6)}
          >
            <Text style={[styles.checkText, { color: WHITE }]}>중복확인</Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.checkBox,
              {
                borderColor: isNicknameAvailable ? ACTIVE_BLUE : INACTIVE_GRAY,
                backgroundColor: isNicknameAvailable
                  ? ACTIVE_BLUE
                  : INACTIVE_GRAY,
              },
            ]}
          >
            <Text style={[styles.checkText, { color: WHITE }]} />
          </View>
        )}
      </View>

      {helperOrEmpty.type !== "none" ? (
        <Text
          style={[
            styles.msg,
            helperOrEmpty.type === "error" && styles.error,
            helperOrEmpty.type === "success" && styles.success,
            helperOrEmpty.type === "helper" && styles.helper,
          ]}
        >
          {helperOrEmpty.text}
        </Text>
      ) : null}
    </View>
  );
}

function defaultValidateNickname(v: string) {
  if (!v) return "닉네임을 입력해주세요.";
  if (v.length < 2) return "닉네임은 2자 이상이어야 합니다.";
  if (v.length > 10) return "닉네임은 10자 이하여야 합니다.";
  if (/\s/.test(v)) return "공백은 사용할 수 없습니다.";
  return null;
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    gap: rs(6),
    alignItems: "center",
  },

  inputBox: {
    flex: 1,
    borderWidth: rs(2),
    borderRadius: rs(17),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(16),
    paddingVertical: rs(13),
    justifyContent: "center",
  },
  input: {
    width: "100%",
    color: TEXT_BLACK,
    fontSize: rfs(15),
    paddingVertical: rs(0),
    lineHeight: rfs(18),
  },

  checkBox: {
    borderWidth: rs(2),
    borderRadius: rs(17),
    paddingHorizontal: rs(16),
    paddingVertical: rs(13),
    minWidth: rs(92),
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { fontSize: rfs(15), fontWeight: "600", lineHeight: rfs(18) },

  msg: {
    marginLeft: rs(13),
    marginTop: rs(6),
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  helper: { color: "#979797" },
  error: { color: "#EF4444" },
  success: { color: ACTIVE_BLUE },
});
