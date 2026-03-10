import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  NativeModules,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BracketIcon from "@/assets/icon/common/BracketIcon";
import FilterCheckIcon from "@/assets/icon/dex/FilterCheckIcon";
import {
  SizeDuckBirdIcon,
  SizeGooseBirdIcon,
  SizePigeonBirdIcon,
  SizeSparrowBirdIcon,
} from "@/assets/icon/dex/FilterSizeBirdIcons";
import SeasonIcon from "@/assets/icon/icon/SeasonIcon";
import HabitatIcon from "@/assets/icon/icon/HabitatIcon";
import SizeIcon from "@/assets/icon/icon/SizeIcon";
import ResetIcon from "@/assets/icon/icon/ResetIcon";
import { font, rfs, rs } from "@/theme";

export type SelectedFilters = {
  seasons: string[];
  habitats: string[];
  sizeCategories: string[];
};

type Props = {
  selectedFilters: SelectedFilters;
  onFilterChange: (group: keyof SelectedFilters, values: string[]) => void;
  onResetSearch?: () => void;
};

type FilterKind = "seasons" | "habitats" | "sizeCategories";

type ResultMap = {
  seasons?: string[];
  habitats?: string[];
  sizeCategories?: string[];
};

type OptionItem = { value: string; label: string };

type SizeOptionItem = OptionItem & {
  subLabel: string;
  silhouetteWidth: number;
  silhouetteHeight: number;
  topOffset: number;
  gapRight: number;
  icon: "sparrow" | "pigeon" | "duck" | "goose";
};

const FILTER_ORDER: FilterKind[] = ["seasons", "habitats", "sizeCategories"];

const LABELS: Record<FilterKind, string> = {
  seasons: "계절 선택",
  habitats: "서식지 선택",
  sizeCategories: "크기 선택",
};

const BUTTON_LABELS: Record<FilterKind, string> = {
  seasons: "계절",
  habitats: "서식지",
  sizeCategories: "크기",
};

// NOTE: values intentionally preserve existing (legacy/garbled) tokens used by dex filter mapping in the app.
const SEASONS: OptionItem[] = [
  { value: "봄", label: "봄" },
  { value: "여름", label: "여름" },
  { value: "가을", label: "가을" },
  { value: "겨울", label: "겨울" },
];

const HABITATS: OptionItem[] = [
  { value: "갯벌", label: "갯벌" },
  { value: "경작지/들판", label: "경작지/들판" },
  { value: "산림/계곡", label: "산림/계곡" },
  { value: "해양", label: "해양" },
  { value: "거주지역", label: "거주지역" },
  { value: "평지숲", label: "평지숲" },
  { value: "하천/호수", label: "하천/호수" },
  { value: "인공시설", label: "인공시설" },
  { value: "동굴", label: "동굴" },
  { value: "습지", label: "습지" },
  { value: "기타", label: "기타" },
].map((item, i) => ({
  // map to current legacy tokens by index order to avoid breaking existing dex mapping
  value: [
    "갯벌",
    "경작지/들판",
    "산림/계곡",
    "해양",
    "거주지역",
    "평지숲",
    "하천/호수",
    "인공시설",
    "동굴",
    "습지",
    "기타",
  ][i],
  label: item.label,
}));

const SIZES: SizeOptionItem[] = [
  {
    value: "참새",
    label: "참새",
    subLabel: "~15cm",
    silhouetteWidth: 30,
    silhouetteHeight: 20,
    topOffset: 91,
    gapRight: -10,
    icon: "sparrow",
  },
  {
    value: "비둘기",
    label: "비둘기",
    subLabel: "~30cm",
    silhouetteWidth: 41,
    silhouetteHeight: 35,
    topOffset: 80,
    gapRight: -10,
    icon: "pigeon",
  },
  {
    value: "오리",
    label: "오리",
    subLabel: "~54cm",
    silhouetteWidth: 63,
    silhouetteHeight: 61,
    topOffset: 54,
    gapRight: 20,
    icon: "duck",
  },
  {
    value: "기러기",
    label: "기러기 이상",
    subLabel: "55cm~",
    silhouetteWidth: 172,
    silhouetteHeight: 84,
    topOffset: 0,
    gapRight: 0,
    icon: "goose",
  },
];

export default function FilterHeader({
  selectedFilters,
  onFilterChange,
  onResetSearch,
}: Props) {
  const [fallbackMounted, setFallbackMounted] = useState(false);
  const [fallbackGroup, setFallbackGroup] = useState<FilterKind>("seasons");
  const [draftFilters, setDraftFilters] = useState<SelectedFilters>({
    seasons: [],
    habitats: [],
    sizeCategories: [],
  });
  const [sizeRowWidth, setSizeRowWidth] = useState(0);
  const sheetTranslateY = useRef(new Animated.Value(40)).current;

  const openFallback = (groupKey: FilterKind) => {
    setFallbackGroup(groupKey);
    setDraftFilters({
      seasons: [...selectedFilters.seasons],
      habitats: [...selectedFilters.habitats],
      sizeCategories: [...selectedFilters.sizeCategories],
    });
    setFallbackMounted(true);
    sheetTranslateY.setValue(40);
    requestAnimationFrame(() => {
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const closeFallback = () => {
    Animated.timing(sheetTranslateY, {
      toValue: 30,
      duration: 100,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setFallbackMounted(false));
  };

  const openNativeSheet = async (groupKey: FilterKind) => {
    if (Platform.OS !== "android") {
      openFallback(groupKey);
      return;
    }
    Keyboard.dismiss();
    const mod = (NativeModules as any).FilterSheetModule;
    if (!mod?.show) {
      openFallback(groupKey);
      return;
    }
    try {
      const result: ResultMap = await mod.show(
        groupKey,
        {
          seasons: SEASONS.map((o) => o.value),
          habitats: HABITATS.map((o) => o.value),
          sizeCategories: SIZES.map((o) => o.value),
        },
        selectedFilters,
      );
      if (result?.seasons) onFilterChange("seasons", result.seasons);
      if (result?.habitats) onFilterChange("habitats", result.habitats);
      if (result?.sizeCategories)
        onFilterChange("sizeCategories", result.sizeCategories);
    } catch (e) {
      console.log("[FilterHeader] FilterSheetModule.show failed", e);
      openFallback(groupKey);
    }
  };

  const resetAll = () => {
    onFilterChange("seasons", []);
    onFilterChange("habitats", []);
    onFilterChange("sizeCategories", []);
    onResetSearch?.();
  };

  const currentIndex = FILTER_ORDER.indexOf(fallbackGroup);
  const canPrev = true;
  const canNext = true;
  const goPrevGroup = () => {
    const nextIndex =
      currentIndex === 0 ? FILTER_ORDER.length - 1 : currentIndex - 1;
    setFallbackGroup(FILTER_ORDER[nextIndex]);
  };
  const goNextGroup = () => {
    const nextIndex =
      currentIndex === FILTER_ORDER.length - 1 ? 0 : currentIndex + 1;
    setFallbackGroup(FILTER_ORDER[nextIndex]);
  };

  const setGroupValues = (group: FilterKind, values: string[]) => {
    const next = { ...draftFilters, [group]: values };
    setDraftFilters(next);
    onFilterChange("seasons", next.seasons);
    onFilterChange("habitats", next.habitats);
    onFilterChange("sizeCategories", next.sizeCategories);
  };

  const toggleInGroup = (group: FilterKind, value: string) => {
    const list = draftFilters[group];
    const nextValues = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    const nextDraft = { ...draftFilters, [group]: nextValues };
    setDraftFilters(nextDraft);
    onFilterChange("seasons", nextDraft.seasons);
    onFilterChange("habitats", nextDraft.habitats);
    onFilterChange("sizeCategories", nextDraft.sizeCategories);
  };

  const renderCheckbox = (checked: boolean, filledOnChecked = false) => (
    <View
      style={[
        styles.checkbox,
        checked &&
          (filledOnChecked
            ? styles.checkboxCheckedFilledBlue
            : styles.checkboxCheckedBlue),
      ]}
    >
      {checked ? (
        <FilterCheckIcon
          width={rs(12)}
          height={rs(12)}
          color={filledOnChecked ? "#FEFEFE" : "#91BFFF"}
        />
      ) : null}
    </View>
  );

  const renderSeasonPage = () => {
    const selected = draftFilters.seasons;
    return (
      <View style={styles.grid2}>
        {SEASONS.map((item) => {
          const active = selected.includes(item.value);
          return (
            <Pressable
              key={`season-${item.value}`}
              style={[
                styles.seasonTile,
                active ? styles.tileBlue : styles.tileGray,
              ]}
              onPress={() => toggleInGroup("seasons", item.value)}
            >
              <Text
                style={[
                  styles.tileText,
                  active ? styles.tileTextWhite : styles.tileTextBlack,
                ]}
              >
                {item.label}
              </Text>
              {renderCheckbox(active)}
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderHabitatPage = () => {
    const selected = draftFilters.habitats;
    const allSelected =
      selected.length > 0 && selected.length === HABITATS.length;
    return (
      <View>
        <View style={styles.habitatTopRow}>
          <Pressable
            style={styles.selectAllRow}
            onPress={() =>
              setGroupValues(
                "habitats",
                allSelected ? [] : HABITATS.map((h) => h.value),
              )
            }
            hitSlop={{
              top: rs(12),
              bottom: rs(12),
              left: rs(12),
              right: rs(12),
            }}
          >
            {renderCheckbox(allSelected, true)}
            <Text style={styles.selectAllText}>전체선택</Text>
          </Pressable>
        </View>
        <View style={styles.habitatGrid}>
          {HABITATS.map((item) => {
            const active = selected.includes(item.value);
            return (
              <Pressable
                key={`habitat-${item.value}`}
                style={[styles.habitatTile, active && styles.habitatTileActive]}
                onPress={() => toggleInGroup("habitats", item.value)}
              >
                <Text
                  style={[
                    styles.habitatTileText,
                    active && styles.habitatTileTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {renderCheckbox(active)}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSizeSilhouette = (item: SizeOptionItem, active: boolean) => {
    const commonProps = {
      width: rs(item.silhouetteWidth),
      height: rs(item.silhouetteHeight),
    };
    const color = active ? "#91BFFF" : "#979797";
    if (item.icon === "sparrow")
      return <SizeSparrowBirdIcon {...commonProps} color={color} />;
    if (item.icon === "pigeon")
      return <SizePigeonBirdIcon {...commonProps} color={color} />;
    if (item.icon === "duck")
      return <SizeDuckBirdIcon {...commonProps} color={color} />;
    return <SizeGooseBirdIcon {...commonProps} color={color} />;
  };

  const renderSizePage = () => {
    const selected = draftFilters.sizeCategories;
    const horizontalInset = rs(8);
    const colWidth = rs(70);
    const totalGap = SIZES.slice(0, -1).reduce(
      (sum, item) => sum + rs(item.gapRight),
      0,
    );
    const usableWidth = Math.max(sizeRowWidth - horizontalInset * 2, 0);
    const availableForGaps = Math.max(usableWidth - colWidth * SIZES.length, 0);
    const gapScale =
      totalGap > 0 ? Math.min(1, availableForGaps / totalGap) : 1;

    return (
      <View
        style={styles.sizeRow}
        onLayout={(e: LayoutChangeEvent) =>
          setSizeRowWidth(e.nativeEvent.layout.width)
        }
      >
        {SIZES.map((item, index) => {
          const active = selected.includes(item.value);
          const marginRight =
            index === SIZES.length - 1 ? 0 : rs(item.gapRight) * gapScale;
          return (
            <Pressable
              key={`size-${item.value}`}
              style={[styles.sizeCol, { width: colWidth, marginRight }]}
              onPress={() => toggleInGroup("sizeCategories", item.value)}
            >
              <View style={styles.sizeSilhouetteWrap}>
                <View
                  style={[
                    styles.sizeSilhouetteAbsolute,
                    { top: rs(item.topOffset) },
                  ]}
                >
                  {renderSizeSilhouette(item, active)}
                </View>
              </View>
              {renderCheckbox(active, true)}
              <Text
                style={[
                  styles.sizeName,
                  item.icon === "goose" && styles.sizeNameGoose,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text style={styles.sizeSub}>{item.subLabel}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderPage = () => {
    if (fallbackGroup === "seasons") return renderSeasonPage();
    if (fallbackGroup === "habitats") return renderHabitatPage();
    return renderSizePage();
  };

  const panelSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) => {
          const { dx, dy } = gesture;
          return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2;
        },
        onPanResponderRelease: (_evt, gesture) => {
          const threshold = rs(36);
          if (gesture.dx <= -threshold) {
            goNextGroup();
            return;
          }
          if (gesture.dx >= threshold) {
            goPrevGroup();
          }
        },
      }),
    [canNext, canPrev, currentIndex],
  );

  return (
    <>
      <View style={styles.row}>
        {(() => {
          const seasonsActive = selectedFilters.seasons.length > 0;
          const habitatsActive = selectedFilters.habitats.length > 0;
          const sizesActive = selectedFilters.sizeCategories.length > 0;
          return (
            <>
        <Pressable
          style={[styles.btn, seasonsActive && styles.btnActive]}
          onPress={() => openNativeSheet("seasons")}
        >
          <SeasonIcon
            width={rs(24)}
            height={rs(25)}
            color={seasonsActive ? "#FEFEFE" : "#4190FF"}
          />
          <Text style={[styles.btnText, seasonsActive && styles.btnTextActive]}>
            {BUTTON_LABELS.seasons}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.btn, habitatsActive && styles.btnActive]}
          onPress={() => openNativeSheet("habitats")}
        >
          <HabitatIcon
            width={rs(24)}
            height={rs(24)}
            color={habitatsActive ? "#FEFEFE" : "#4190FF"}
          />
          <Text style={[styles.btnText, habitatsActive && styles.btnTextActive]}>
            {BUTTON_LABELS.habitats}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.btn, sizesActive && styles.btnActive]}
          onPress={() => openNativeSheet("sizeCategories")}
        >
          <SizeIcon
            width={rs(24)}
            height={rs(24)}
            color={sizesActive ? "#FEFEFE" : "#4190FF"}
          />
          <Text style={[styles.btnText, sizesActive && styles.btnTextActive]}>
            {BUTTON_LABELS.sizeCategories}
          </Text>
        </Pressable>
            </>
          );
        })()}
        <Pressable style={styles.resetBtn} onPress={resetAll} hitSlop={rs(6)}>
          <ResetIcon width={rs(17)} height={rs(17)} color="#0D0D0D" />
        </Pressable>
      </View>

      <Modal
        visible={fallbackMounted}
        transparent
        animationType="none"
        onRequestClose={closeFallback}
      >
        <Pressable style={styles.fullscreenOverlay} onPress={closeFallback}>
          <Animated.View
            style={[
              styles.fullPanel,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.panelHeader}>
                <Pressable
                  style={styles.headerArrowBtn}
                  disabled={!canPrev}
                  onPress={goPrevGroup}
                  hitSlop={{
                    top: rs(14),
                    bottom: rs(14),
                    left: rs(14),
                    right: rs(14),
                  }}
                >
                  <BracketIcon
                    width={rs(17)}
                    height={rs(17)}
                    color={canPrev ? "#91BFFF" : "#D5DCE8"}
                  />
                </Pressable>
                <Text style={styles.panelTitle}>{LABELS[fallbackGroup]}</Text>
                <Pressable
                  style={styles.headerArrowBtn}
                  disabled={!canNext}
                  onPress={goNextGroup}
                  hitSlop={{
                    top: rs(14),
                    bottom: rs(14),
                    left: rs(14),
                    right: rs(14),
                  }}
                >
                  <View style={styles.rightArrowWrap}>
                    <BracketIcon
                      width={rs(17)}
                      height={rs(17)}
                      color={canNext ? "#91BFFF" : "#D5DCE8"}
                    />
                  </View>
                </Pressable>
              </View>

              <View
                style={styles.panelBody}
                {...panelSwipeResponder.panHandlers}
              >
                {renderPage()}
              </View>

              <View style={styles.panelFooter}>
                <Pressable style={styles.doneBtn} onPress={closeFallback}>
                  <Text style={styles.doneText}>완료</Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(16),
    paddingTop: rs(16),
    paddingBottom: rs(20),
    gap: rs(6),
  },
  btn: {
    height: rs(40),
    paddingTop: rs(9),
    paddingRight: rs(15),
    paddingBottom: rs(9),
    paddingLeft: rs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(10),
    borderRadius: rs(30.5),
    borderWidth: rs(0.35),
    borderColor: "#DAE0DE",
    backgroundColor: "#FEFEFE",
  },
  resetBtn: {
    height: rs(33),
    padding: rs(8),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rs(16.5),
    borderWidth: rs(0.35),
    borderColor: "#DAE0DE",
    backgroundColor: "#FEFEFE",
  },
  btnText: {
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
    color: "#0D0D0D",
    textAlign: "center",
  },
  btnActive: {
    backgroundColor: "#91BFFF",
    borderColor: "#91BFFF",
  },
  btnTextActive: {
    color: "#FEFEFE",
  },

  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end",
  },
  fullPanel: {
    backgroundColor: "#FEFEFE",
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    overflow: "hidden",
    maxHeight: "78%",
  },
  panelHeader: {
    height: rs(70),
    paddingHorizontal: rs(31),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerArrowBtn: {
    width: rs(17),
    height: rs(17),
    alignItems: "center",
    justifyContent: "center",
  },
  rightArrowWrap: {
    transform: [{ rotate: "180deg" }],
  },
  panelTitle: {
    flex: 1,
    textAlign: "center",
    color: "#0D0D0D",
    fontSize: rfs(18),
    fontFamily: font.haru,
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  panelBody: {
    paddingHorizontal: rs(15),
    paddingBottom: rs(20),
  },
  panelFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E8E8",
    paddingTop: rs(26),
    paddingBottom: rs(46),
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    minWidth: rs(80),
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    color: "#4190FF",
    fontSize: rfs(18),
    fontWeight: "500",
    lineHeight: rfs(21),
  },

  checkbox: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(4),
    borderWidth: rs(1.5),
    borderColor: "#DAE0DE",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCheckedBlue: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  checkboxCheckedFilledBlue: {
    backgroundColor: "#91BFFF",
    borderColor: "#91BFFF",
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(13),
    alignContent: "flex-start",
  },
  seasonTile: {
    flexBasis: "48%",
    flexGrow: 1,
    height: rs(45),
    borderRadius: rs(10),
    paddingHorizontal: rs(15),
    paddingVertical: rs(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileBlue: {
    backgroundColor: "#91BFFF",
  },
  tileGray: {
    backgroundColor: "#F0F0F0",
  },
  tileText: {
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  tileTextWhite: { color: "#FFFFFF", fontWeight: "600" },
  tileTextBlack: { color: "#0D0D0D" },

  habitatTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: rs(20),
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(9),
    paddingHorizontal: rs(4),
  },
  selectAllText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
  },
  habitatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(9),
    alignContent: "flex-start",
  },
  habitatTile: {
    height: rs(45),
    borderRadius: rs(10),
    backgroundColor: "#F2F2F2",
    paddingHorizontal: rs(15),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rs(9),
  },
  habitatTileActive: {
    backgroundColor: "#91BFFF",
    borderWidth: rs(1),
    borderColor: "#91BFFF",
  },
  habitatTileText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
    flexShrink: 1,
  },
  habitatTileTextActive: {
    color: "#FEFEFE",
    fontWeight: "600",
  },

  sizeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingTop: rs(8),
    paddingHorizontal: rs(8),
  },
  sizeCol: {
    alignItems: "center",
    paddingHorizontal: rs(5),
  },
  sizeSilhouetteWrap: {
    width: "100%",
    height: rs(115),
    alignItems: "center",
    position: "relative",
    marginBottom: rs(27),
    overflow: "visible",
  },
  sizeSilhouetteAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  sizeName: {
    marginTop: rs(13),
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "400",
    textAlign: "center",
  },
  sizeNameGoose: {
    width: rs(96),
    alignSelf: "center",
  },
  sizeSub: {
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
    textAlign: "center",
  },
});
