import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  birdCount: number;
  onPressBookmark?: () => void;
  onPressSearch?: () => void;
  bookmarkActive?: boolean;
};

export default function DexMainHeader({
  birdCount,
  onPressBookmark,
  onPressSearch,
  bookmarkActive = false,
}: Props) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700" }}>도감</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={onPressBookmark}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.75)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>{bookmarkActive ? "★" : "☆"}</Text>
          </Pressable>

          <Pressable
            onPress={onPressSearch}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.75)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>🔍</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 14 }}>
        <Text style={{ fontSize: 36, fontWeight: "800", color: "#2563eb" }}>
          {/* {birdCount} */}
          263
        </Text>
        <Text style={{ marginTop: 2, color: "#111" }}>
          종의 새가 도감에 준비되어 있어요
        </Text>
      </View>
    </View>
  );
}
