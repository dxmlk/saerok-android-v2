import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { rfs, rs } from "@/theme";

export default function SaerokHeader() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>나의 새록</Text>

      <View style={styles.btnRow}>
        <Pressable
          onPress={() => router.push("/saerok/search-bird")}
          style={styles.iconBtn}
        >
          <Text style={styles.iconText}>🔎</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: rs(76),
    paddingHorizontal: rs(16),
    paddingTop: rs(18),
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  title: { fontSize: rfs(20), fontWeight: "800", color: "#111827" },
  btnRow: { flexDirection: "row", gap: rs(12) },
  iconBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: rfs(18) },
});
