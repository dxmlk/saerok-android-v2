import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  BackHandler,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import BackSmallIcon from "@/assets/icon/button/BackSmallIcon";
import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import FilterCheckIcon from "@/assets/icon/dex/FilterCheckIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import EditFooter from "@/components/common/EditFooter";
import NicknameInput from "@/components/my/NicknameInput";
import { checkNicknameAvailable } from "@/services/api/user";
import { font, rfs, rs } from "@/theme";

type AgreementKey = "age" | "terms" | "privacy" | "location";

type AgreementState = Record<AgreementKey, boolean>;

const INITIAL_AGREEMENTS: AgreementState = {
  age: false,
  terms: false,
  privacy: false,
  location: false,
};

const AGREEMENT_ITEMS: Array<{
  key: AgreementKey;
  label: string;
  hasChevron?: boolean;
  href?: string;
  title?: string;
}> = [
  { key: "age", label: "만 14세 이상 확인" },
  {
    key: "terms",
    label: "새록 이용 약관 동의",
    hasChevron: true,
    title: "새록 이용 약관",
    href: "https://shine-guppy-3de.notion.site/29e7cea87e058098adffe574164bb447",
  },
  {
    key: "privacy",
    label: "개인정보 수집 및 이용 동의",
    hasChevron: true,
    title: "개인정보 수집 및 이용 동의",
    href: "https://shine-guppy-3de.notion.site/29d7cea87e058088a7cde5f3fc6622ad",
  },
  {
    key: "location",
    label: "위치정보 이용 약관 동의",
    hasChevron: true,
    title: "위치정보 이용 약관",
    href: "https://shine-guppy-3de.notion.site/2a07cea87e0580a9b966c6268754f7b6",
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const [nickname, setNickname] = useState("");
  const [isNicknameOk, setIsNicknameOk] = useState(false);
  const [nicknameErr, setNicknameErr] = useState<string | undefined>(undefined);
  const [termsSheetVisible, setTermsSheetVisible] = useState(false);
  const [agreements, setAgreements] =
    useState<AgreementState>(INITIAL_AGREEMENTS);

  const canSubmit = useMemo(() => {
    return !!nickname.trim() && isNicknameOk && !nicknameErr;
  }, [nickname, isNicknameOk, nicknameErr]);

  const allRequiredChecked = useMemo(() => {
    return Object.values(agreements).every(Boolean);
  }, [agreements]);

  useEffect(() => {
    if (!termsSheetVisible) {
      sheetAnim.setValue(0);
      return;
    }

    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sheetAnim, termsSheetVisible]);

  const openTermsSheet = () => {
    if (!canSubmit) return;
    setTermsSheetVisible(true);
  };

  const closeTermsSheet = () => {
    setTermsSheetVisible(false);
  };

  const toggleAgreement = (key: AgreementKey) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllAgreements = () => {
    const nextValue = !allRequiredChecked;
    setAgreements({
      age: nextValue,
      terms: nextValue,
      privacy: nextValue,
      location: nextValue,
    });
  };

  const goToSurvey = () => {
    if (!allRequiredChecked) return;
    setTermsSheetVisible(false);
    router.push({
      pathname: "/register-survey",
      params: { nickname: nickname.trim() },
    });
  };

  const goBackOrToOnboarding = useCallback(() => {
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    const onHardwareBack = () => {
      goBackOrToOnboarding();
      return true; // handled
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [goBackOrToOnboarding]);

  const openAgreementDetail = (title: string, url: string) => {
    router.push({
      pathname: "/register-agreement",
      params: { title, url },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable
            onPress={() => goBackOrToOnboarding()}
            hitSlop={rs(10)}
            style={styles.backButton}
          >
            <BackSmallIcon width={17} height={17} color="#0D0D0D" />
          </Pressable>
        </View>

        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>새록에서 사용할 닉네임을 정해주세요</Text>

        <View style={styles.nicknameSection}>
          <Text style={styles.label}>닉네임 입력(필수)</Text>

          <View style={styles.nicknameInputWrap}>
            <NicknameInput
              nickname={nickname}
              setNickname={setNickname}
              checkNicknameAvailable={checkNicknameAvailable}
              onCheckResult={(ok, err) => {
                setIsNicknameOk(ok);
                setNicknameErr(err);
              }}
            />
          </View>
        </View>

        <EditFooter
          text="다음"
          disabled={!canSubmit}
          onClick={openTermsSheet}
        />
      </View>

      <Modal
        visible={termsSheetVisible}
        transparent
        animationType="none"
        onRequestClose={closeTermsSheet}
      >
        <Pressable style={styles.dim} onPress={closeTermsSheet}>
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [rs(420), 0],
                    }),
                  },
                ],
              },
              { paddingBottom: Math.max(rs(28), insets.bottom + rs(12)) },
            ]}
          >
            <Pressable style={styles.sheetTouchBlock} onPress={() => {}}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderText}>
                  <Text style={styles.sheetTitle}>약관 동의가 필요해요.</Text>
                  <Text style={styles.sheetSubtitle}>
                    <Text style={styles.requiredMark}>* </Text>
                    표시는 필수 항목이에요.
                  </Text>
                </View>

                <Pressable hitSlop={12} onPress={closeTermsSheet}>
                  <CloseLineIcon
                    width={rs(14)}
                    height={rs(14)}
                    color="#979797"
                  />
                </Pressable>
              </View>

              <Pressable
                style={styles.allAgreeRow}
                onPress={toggleAllAgreements}
              >
                <Text style={styles.allAgreeText}>필수항목 전체 동의하기</Text>
                <Checkbox checked={allRequiredChecked} />
              </Pressable>

              <View style={styles.divider} />

              <View style={styles.listWrap}>
                {AGREEMENT_ITEMS.map((item) => (
                  <Pressable
                    key={item.key}
                    style={styles.itemRow}
                    onPress={() => toggleAgreement(item.key)}
                  >
                    <View style={styles.itemLabelWrap}>
                      <Text style={styles.requiredMark}>*</Text>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                      {item.hasChevron ? (
                        <Pressable
                          hitSlop={rs(10)}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (item.title && item.href) {
                              openAgreementDetail(item.title, item.href);
                            }
                          }}
                          style={styles.chevronButton}
                        >
                          <InfoChevronIcon
                            width={rs(11)}
                            height={rs(22)}
                            color="#979797"
                          />
                        </Pressable>
                      ) : null}
                    </View>

                    <Checkbox checked={agreements[item.key]} />
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={goToSurvey}
                disabled={!allRequiredChecked}
                style={[
                  styles.sheetNextButton,
                  !allRequiredChecked && styles.sheetNextButtonDisabled,
                ]}
              >
                <Text style={styles.sheetNextButtonText}>다음</Text>
              </Pressable>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked ? (
        <FilterCheckIcon width={rs(17)} height={rs(17)} color="#FEFEFE" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  page: { flex: 1, paddingHorizontal: rs(24) },
  header: {
    height: rs(84),
    justifyContent: "center",
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: rs(23),
    fontSize: rfs(30),
    fontFamily: font.haru,
    lineHeight: rfs(33),
    fontWeight: "400",
    color: "#0D0D0D",
  },
  subtitle: {
    marginTop: rs(5),
    color: "#979797",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  nicknameSection: {
    marginTop: rs(39),
  },
  label: {
    marginLeft: rs(13),
    color: "#0D0D0D",
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  nicknameInputWrap: {
    marginTop: rs(7.25),
  },
  dim: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#F7F7F7",
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
  },
  sheetTouchBlock: {
    paddingHorizontal: rs(24),
    paddingTop: rs(22),
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetTitle: {
    color: "#0D0D0D",
    fontSize: rfs(20),
    lineHeight: rfs(19),
    fontWeight: "700",
  },
  sheetSubtitle: {
    marginTop: rs(7),
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  requiredMark: {
    color: "#D90000",
    fontSize: rfs(16),
    lineHeight: rfs(19),
    fontWeight: "700",
  },
  allAgreeRow: {
    marginTop: rs(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  allAgreeText: {
    color: "#0D0D0D",
    fontSize: rfs(16),
    lineHeight: rfs(19),
    fontWeight: "700",
  },
  divider: {
    marginTop: rs(15),
    paddingHorizontal: rs(1),
    height: 0.5,
    backgroundColor: "#DAE0DE",
  },
  listWrap: {
    marginTop: rs(17),
    gap: rs(14),
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLabelWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemLabel: {
    marginLeft: rs(2),
    marginRight: rs(12),
    color: "#6D6D6D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  chevronButton: {
    paddingHorizontal: rs(2),
    paddingVertical: rs(2),
  },
  checkbox: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(5),
    borderWidth: 1.5,
    borderColor: "#DAE0DE",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    borderColor: "#91BFFF",
    backgroundColor: "#91BFFF",
  },
  sheetNextButton: {
    marginTop: rs(50),
    height: rs(56),
    borderRadius: rs(20),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetNextButtonDisabled: {
    backgroundColor: "#D4D7D6",
  },
  sheetNextButtonText: {
    color: "#FFFFFF",
    fontSize: rfs(18),
    lineHeight: rfs(21),
    fontWeight: "500",
  },
});
