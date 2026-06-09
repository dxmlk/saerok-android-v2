import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import FilterCheckIcon from "@/assets/icon/dex/FilterCheckIcon";
import EditFooter from "@/components/common/EditFooter";
import AppAlertModal from "@/components/common/AppAlertModal";
import { useAuth } from "@/hooks/useAuth";
import { signupComplete, SignupSource } from "@/services/api/user";
import { font, rfs, rs } from "@/theme";

const SURVEY_OPTIONS = [
  "인스타그램",
  "그 외 SNS\n(X, 블로그 등)",
  "지인 추천, 홍보물",
  "탐조 관련 커뮤니티\n(카페, 오픈채팅 등)",
  "기타 (그 외)",
] as const;

const SIGNUP_SOURCE_MAP: Record<(typeof SURVEY_OPTIONS)[number], SignupSource> =
  {
    인스타그램: "INSTAGRAM",
    "그 외 SNS\n(X, 블로그 등)": "OTHER_SNS",
    "지인 추천, 홍보물": "FRIEND",
    "탐조 관련 커뮤니티\n(카페, 오픈채팅 등)": "COMMUNITY",
    "기타 (그 외)": "ETC",
  };

const PAGE_HORIZONTAL = 25;
const OPTION_CARD_HEIGHT = 123;
const GRID_ROW_GAP = 12;
const GRID_MIN_MARGIN_TOP = 60;
const GRID_BOTTOM_TO_BUTTON = 30;

export default function RegisterSurveyScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { nickname } = useLocalSearchParams<{ nickname?: string }>();

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    mainText: string;
    subText: string;
  }>({ visible: false, mainText: "", subText: "" });

  const canComplete = useMemo(
    () => selectedOptions.length > 0 && !submitting,
    [selectedOptions, submitting],
  );
  const optionRows = useMemo(() => {
    const rows: Array<Array<(typeof SURVEY_OPTIONS)[number] | null>> = [];

    for (let index = 0; index < SURVEY_OPTIONS.length; index += 2) {
      rows.push([SURVEY_OPTIONS[index], SURVEY_OPTIONS[index + 1] ?? null]);
    }

    return rows;
  }, []);
  const cardWidth = useMemo(() => {
    return (width - rs(PAGE_HORIZONTAL * 2) - rs(GRID_ROW_GAP)) / 2;
  }, [width]);
  const dynamicGridMarginTop = useMemo(() => {
    const footerPaddingBottom = Math.max(rs(20), insets.bottom + rs(16));
    const footerReservedHeight = rs(53) + footerPaddingBottom;
    const titleBlockTop = rs(97);
    const titleHeight = rfs(33);
    const subtitleGap = rs(4.75);
    const subtitleHeight = rfs(18);
    const gridHeight = rs(OPTION_CARD_HEIGHT) * 3 + rs(GRID_ROW_GAP) * 2;

    const remaining =
      height -
      insets.top -
      footerReservedHeight -
      rs(GRID_BOTTOM_TO_BUTTON) -
      titleBlockTop -
      titleHeight -
      subtitleGap -
      subtitleHeight -
      gridHeight;

    return Math.max(rs(GRID_MIN_MARGIN_TOP), remaining);
  }, [height, insets.bottom, insets.top]);

  const closeAlertModal = () =>
    setAlertModal({ visible: false, mainText: "", subText: "" });

  const toggleOption = (option: (typeof SURVEY_OPTIONS)[number]) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const handleComplete = async () => {
    const trimmedNickname = (nickname ?? "").trim();
    const selectedSourceLabel = selectedOptions[0] as
      | (typeof SURVEY_OPTIONS)[number]
      | undefined;
    if (!trimmedNickname || submitting || !selectedSourceLabel) return;

    try {
      setSubmitting(true);

      const payload = {
        nickname: trimmedNickname,
        signupSource: SIGNUP_SOURCE_MAP[selectedSourceLabel],
      };

      await signupComplete(payload);
      await refreshUser({ silent: true });
      router.replace("/register-complete");
    } catch (e: any) {
      setAlertModal({
        visible: true,
        mainText: "회원가입 실패",
        subText:
          e?.response?.data?.message ||
          e?.message ||
          "회원가입 요청 중 오류가 발생했어요.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.page}>
        <Text style={styles.title}>어디서 보고 오셨나요?</Text>
        <Text style={styles.subtitle}>마지막 단계예요!</Text>

        <View style={[styles.grid, { marginTop: dynamicGridMarginTop }]}>
          {optionRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
              {row.map((option, colIndex) => {
                if (!option) {
                  return (
                    <View
                      key={`empty-${rowIndex}-${colIndex}`}
                      style={{ width: cardWidth }}
                    />
                  );
                }

                const checked = selectedOptions.includes(option);

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.optionCard,
                      { width: cardWidth },
                      checked && styles.optionCardSelected,
                    ]}
                    onPress={() => toggleOption(option)}
                  >
                    <View style={styles.optionHeader}>
                      <Text
                        style={[
                          styles.optionLabel,
                          checked && styles.optionLabelSelected,
                        ]}
                      >
                        {option}
                      </Text>
                      <Checkbox checked={checked} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <EditFooter
          text="완료"
          disabled={!canComplete}
          onClick={handleComplete}
        />
      </View>

      <AppAlertModal
        visible={alertModal.visible}
        mainText={alertModal.mainText}
        subText={alertModal.subText}
        onClose={closeAlertModal}
      />

      <Modal transparent visible={submitting} animationType="none">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked ? (
        <FilterCheckIcon width={rs(12)} height={rs(12)} color="#91BFFF" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  page: {
    flex: 1,
    paddingHorizontal: rs(PAGE_HORIZONTAL),
  },
  title: {
    marginTop: rs(97),
    color: "#0D0D0D",
    fontSize: rfs(30),
    lineHeight: rfs(33),
    letterSpacing: -0.6,
    fontFamily: font.haru,
    fontWeight: "400",
  },
  subtitle: {
    marginTop: rs(4.75),
    color: "#979797",
    fontSize: rfs(16),
    lineHeight: rfs(18),
    fontFamily: font.regular,
    fontWeight: "400",
  },
  grid: {
    gap: rs(GRID_ROW_GAP),
  },
  gridRow: {
    flexDirection: "row",
    gap: rs(GRID_ROW_GAP),
  },
  optionCard: {
    height: rs(OPTION_CARD_HEIGHT),
    borderRadius: rs(10),
    backgroundColor: "#F2F2F2",
    paddingHorizontal: rs(14),
    paddingTop: rs(15),
  },
  optionCardSelected: {
    borderWidth: rs(1.5),
    borderColor: "#91BFFF",
    backgroundColor: "#91BFFF",
  },
  optionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rs(12),
  },
  optionLabel: {
    flex: 1,
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  optionLabelSelected: {
    color: "#FEFEFE",
    fontWeight: "600",
  },
  checkbox: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(4),
    borderWidth: rs(1.5),
    borderColor: "#DAE0DE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    borderRadius: rs(5),
    borderColor: "#FEFEFE",
    backgroundColor: "#FEFEFE",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
});
