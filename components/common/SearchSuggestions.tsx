// src/components/dex/SearchSuggestions.tsx
import { BirdInfo } from "@/services/api/birds";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  suggestions: BirdInfo[];
  onSelect: (info: BirdInfo) => void;
};

export default function SearchSuggestions({
  visible,
  suggestions,
  onSelect,
}: Props) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <View style={styles.panel}>
      {suggestions.map((info) => (
        <Pressable
          key={info.birdId}
          onPress={() => onSelect(info)}
          style={styles.row}
          android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.kor}>{info.koreanName}</Text>
            <Text style={styles.sci}>{info.scientificName}</Text>
          </View>
          <Text style={styles.bracket}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    overflow: "hidden",
  },
  row: {
    height: 64,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kor: { fontSize: 14, fontWeight: "700", color: "#111827" },
  sci: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  bracket: { fontSize: 22, color: "#9CA3AF" },
});
