import React, { useMemo, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import TouchableOpacity from "@/components/common/TouchableOpacity";
import { rfs, rs } from "@/theme";

type Props = {
  nickname: string;
  setNickname: (v: string) => void;
  initialNickname?: string;
  onCheckResult?: (isAvailable: boolean, error?: string) => void;
  validateNickname?: (v: string) => string | null;
  checkNicknameAvailable: (params: { nickname: string }) => Promise<{
    isAvailable: boolean;
    reason?: string;
  }>;
  helperText?: string;
};

const ACTIVE_BLUE = "#91BFFF";
const SUCCESS_BLUE = "#002FCB";
const ERROR_RED = "#D90000";
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
  const [inputRef, setInputRef] = useState<TextInput | null>(null);
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
    if (!isButtonClicked) {
      return isIdleState ? INACTIVE_GRAY : ACTIVE_BLUE;
    }

    return isNicknameAvailable ? SUCCESS_BLUE : ERROR_RED;
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
    if (loading || isButtonClicked || isEmpty) return false;
    if (initialTrimmed.length > 0 && trimmed === initialTrimmed) return true;
    return !isIdleState;
  }, [
    initialTrimmed,
    isButtonClicked,
    isEmpty,
    isIdleState,
    loading,
    trimmed,
  ]);

  const helperOrEmpty = useMemo(() => {
    if (errorMessage) return { type: "error" as const, text: errorMessage };
    if (isButtonClicked && isNicknameAvailable) {
      return { type: "success" as const, text: "사용 가능한 닉네임입니다." };
    }
    if (helperText) return { type: "helper" as const, text: helperText };
    return { type: "none" as const, text: "" };
  }, [errorMessage, isButtonClicked, isNicknameAvailable, helperText]);

  const placeholderText = useMemo(() => {
    const value = (initialNickname ?? "").trim();
    return value.length > 0 ? value : "닉네임을 입력해주세요.";
  }, [initialNickname]);

  const handleDuplicationCheck = async () => {
    if (!canPressCheck) return;

    inputRef?.blur();
    Keyboard.dismiss();

    const value = nickname.trim();
    if (initialTrimmed.length > 0 && value === initialTrimmed) {
      const msg = "기존 닉네임과 동일합니다.";
      setErrorMessage(msg);
      setIsNicknameAvailable(false);
      setIsButtonClicked(true);
      onCheckResult(false, msg);
      return;
    }

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
        <TouchableOpacity
          style={[styles.inputBox, { borderColor: inputBorderColor }]}
          onPress={() => inputRef?.focus()}
        >
          <TextInput
            ref={setInputRef}
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

          {isButtonClicked ? (
            isNicknameAvailable ? (
              <SuccessStatusIcon />
            ) : (
              <ErrorStatusIcon />
            )
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDuplicationCheck}
          disabled={!canPressCheck}
          style={[
            styles.checkBox,
            {
              borderColor: checkBorderColor,
              backgroundColor: checkBgColor,
            },
          ]}
          hitSlop={rs(6)}
        >
          <Text style={styles.checkText}>중복확인</Text>
        </TouchableOpacity>
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

function SuccessStatusIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="9" fill={SUCCESS_BLUE} />
      <Path
        d="M5 10.25L7.50008 12.7501L13.7503 6.49988"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ErrorStatusIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="9" fill={ERROR_RED} />
      <Path
        d="M9.68182 10.8622H8.35938L8.07812 5.34375H9.96875L9.68182 10.8622ZM9.01989 13.2031C8.74148 13.2031 8.50663 13.108 8.31534 12.918C8.12784 12.728 8.03409 12.5 8.03409 12.2344C8.03409 11.9688 8.12784 11.7427 8.31534 11.5561C8.50663 11.3659 8.74148 11.2708 9.01989 11.2708C9.29451 11.2708 9.52557 11.3659 9.71307 11.5561C9.90436 11.7427 10 11.9688 10 12.2344C10 12.5 9.90436 12.728 9.71307 12.918C9.52557 13.108 9.29451 13.2031 9.01989 13.2031Z"
        fill={WHITE}
      />
    </Svg>
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
    minHeight: rs(44),
    borderWidth: rs(2),
    borderRadius: rs(17),
    backgroundColor: "#FFFFFF",
    paddingLeft: rs(18),
    paddingRight: rs(13),
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: TEXT_BLACK,
    fontSize: rfs(15),
    paddingVertical: rs(13),
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
  checkText: {
    color: WHITE,
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  msg: {
    marginLeft: rs(13),
    marginTop: rs(6),
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  helper: { color: "#979797" },
  error: { color: ERROR_RED },
  success: { color: SUCCESS_BLUE },
});
