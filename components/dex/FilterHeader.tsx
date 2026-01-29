import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type SelectedFilters = {
  seasons: string[]; // ["봄","여름",...]
  habitats: string[]; // ["갯벌",...]
  sizeCategories: string[]; // ["참새",...]
};

type Props = {
  selectedFilters: SelectedFilters;
  onFilterChange: (group: keyof SelectedFilters, values: string[]) => void;
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
  };

  const isActive = (k: keyof SelectedFilters) => selectedFilters[k].length > 0;

  return (
    <View style={styles.row}>
      {/* 계절 */}
      <Pressable
        style={[
          styles.pill,
          isActive("seasons") ? styles.pillActive : styles.pillIdle,
        ]}
        onPress={() => {
          setCurrent("계절");
          setOpen(true);
        }}
      >
        <Text
          style={[
            styles.pillText,
            isActive("seasons") ? styles.pillTextActive : styles.pillTextIdle,
          ]}
        >
          계절
        </Text>
      </Pressable>

      {/* 서식지 */}
      <Pressable
        style={[
          styles.pill,
          isActive("habitats") ? styles.pillActive : styles.pillIdle,
        ]}
        onPress={() => {
          setCurrent("서식지");
          setOpen(true);
        }}
      >
        <Text
          style={[
            styles.pillText,
            isActive("habitats") ? styles.pillTextActive : styles.pillTextIdle,
          ]}
        >
          서식지
        </Text>
      </Pressable>

      {/* 크기 */}
      <Pressable
        style={[
          styles.pill,
          isActive("sizeCategories") ? styles.pillActive : styles.pillIdle,
        ]}
        onPress={() => {
          setCurrent("크기");
          setOpen(true);
        }}
      >
        <Text
          style={[
            styles.pillText,
            isActive("sizeCategories")
              ? styles.pillTextActive
              : styles.pillTextIdle,
          ]}
        >
          크기
        </Text>
      </Pressable>

      {/* 리셋 */}
      <Pressable style={styles.resetBtn} onPress={resetAll}>
        <Text style={styles.resetText}>리셋</Text>
      </Pressable>

      {/* Modal BottomSheet 대체 */}
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
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },

  pill: {
    height: 33,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
  },
  pillIdle: { backgroundColor: "#fff", borderColor: "#a1a1aa" },
  pillActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  pillText: { fontSize: 13 },
  pillTextIdle: { color: "#111827" },
  pillTextActive: { color: "#fff", fontWeight: "600" },

  resetBtn: {
    marginLeft: "auto",
    height: 33,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#a1a1aa",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  resetText: { fontSize: 13, color: "#111827" },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 18,
    maxHeight: "70%",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  done: { fontSize: 14, fontWeight: "700", color: "#2563eb" },

  bulkRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bulkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  bulkText: { color: "#111827", fontSize: 13, fontWeight: "600" },

  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  item: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  itemOff: { backgroundColor: "#f3f4f6" },
  itemOn: { backgroundColor: "#2563eb" },
  itemText: { fontSize: 13, fontWeight: "600" },
  itemTextOff: { color: "#111827" },
  itemTextOn: { color: "#fff" },
});
