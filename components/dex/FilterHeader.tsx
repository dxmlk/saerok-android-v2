import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SeasonIcon from "@/assets/icon/icon/SeasonIcon";
import HabitatIcon from "@/assets/icon/icon/HabitatIcon";
import SizeIcon from "@/assets/icon/icon/SizeIcon";
import ResetIcon from "@/assets/icon/icon/ResetIcon";
import { rfs, rs } from "@/theme";

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

const SEASONS = ["봄", "여름", "가을", "겨울"];
const HABITATS = [
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
];
const SIZES = ["참새", "비둘기", "오리", "기러기"];

type FilterKind = "계절" | "서식지" | "크기";

export default function FilterHeader({
  selectedFilters,
  onFilterChange,
  onResetSearch,
}: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<FilterKind>("계절");

  const groupKey = useMemo(() => {
    switch (current) {
      case "계절":
        return "seasons" as const;
      case "서식지":
        return "habitats" as const;
      case "크기":
        return "sizeCategories" as const;
    }
  }, [current]);

  const options = useMemo(() => {
    if (current === "계절") return SEASONS;
    if (current === "서식지") return HABITATS;
    return SIZES;
  }, [current]);

  const selected = selectedFilters[groupKey];

  const toggle = (item: string) => {
    const next = selected.includes(item)
      ? selected.filter((x) => x !== item)
      : [...selected, item];
    onFilterChange(groupKey, next);
  };

  const resetAll = () => {
    onFilterChange("seasons", []);
    onFilterChange("habitats", []);
    onFilterChange("sizeCategories", []);
    onResetSearch?.();
  };

  return (
    <View style={styles.row}>
      {/* 계절 */}
      <Pressable
        style={styles.btn}
        onPress={() => {
          setCurrent("계절");
          setOpen(true);
        }}
      >
        <SeasonIcon width={rs(24)} height={rs(25)} color="#4190FF" />
        <Text style={styles.btnText}>계절</Text>
      </Pressable>

      {/* 서식지 */}
      <Pressable
        style={styles.btn}
        onPress={() => {
          setCurrent("서식지");
          setOpen(true);
        }}
      >
        <HabitatIcon width={rs(24)} height={rs(24)} color="#4190FF" />
        <Text style={styles.btnText}>서식지</Text>
      </Pressable>

      {/* 크기 */}
      <Pressable
        style={styles.btn}
        onPress={() => {
          setCurrent("크기");
          setOpen(true);
        }}
      >
        <SizeIcon width={rs(24)} height={rs(24)} color="#4190FF" />
        <Text style={styles.btnText}>크기</Text>
      </Pressable>

      {/* 리셋: 아이콘만 */}
      <Pressable style={styles.btn} onPress={resetAll} hitSlop={rs(6)}>
        <ResetIcon width={rs(17)} height={rs(17)} color="#0D0D0D" />
      </Pressable>

      {/* Modal BottomSheet */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{current} 선택</Text>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={styles.done}>완료</Text>
            </Pressable>
          </View>

          {current === "서식지" && (
            <View style={styles.bulkRow}>
              <Pressable
                style={styles.bulkBtn}
                onPress={() => onFilterChange("habitats", HABITATS)}
              >
                <Text style={styles.bulkText}>전체선택</Text>
              </Pressable>
              <Pressable
                style={styles.bulkBtn}
                onPress={() => onFilterChange("habitats", [])}
              >
                <Text style={styles.bulkText}>전체해제</Text>
              </Pressable>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.list}>
            {options.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <Pressable
                  key={opt}
                  style={[
                    styles.item,
                    checked ? styles.itemOn : styles.itemOff,
                  ]}
                  onPress={() => toggle(opt)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      checked ? styles.itemTextOn : styles.itemTextOff,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
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
  btnText: {
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
    color: "#0D0D0D",
    textAlign: "center",
  },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: rs(18),
    borderTopRightRadius: rs(18),
    paddingBottom: rs(18),
    maxHeight: "70%",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(16),
    paddingTop: rs(14),
    paddingBottom: rs(10),
    borderBottomWidth: rs(1),
    borderBottomColor: "#e5e7eb",
  },
  sheetTitle: { fontSize: rfs(16), fontWeight: "700", color: "#111827" },
  done: { fontSize: rfs(14), fontWeight: "700", color: "#2563eb" },

  bulkRow: {
    flexDirection: "row",
    gap: rs(10),
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
  },
  bulkBtn: {
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    borderRadius: rs(10),
    backgroundColor: "#f3f4f6",
  },
  bulkText: { color: "#111827", fontSize: rfs(13), fontWeight: "600" },

  list: {
    paddingHorizontal: rs(16),
    paddingTop: rs(14),
    paddingBottom: rs(30),
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(10),
  },
  item: {
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    borderRadius: rs(10),
  },
  itemOff: { backgroundColor: "#f3f4f6" },
  itemOn: { backgroundColor: "#2563eb" },
  itemText: { fontSize: rfs(13), fontWeight: "600" },
  itemTextOff: { color: "#111827" },
  itemTextOn: { color: "#fff" },
});
