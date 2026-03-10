import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import AddSaerokDexIcon from "@/assets/icon/button/AddSaerokDexIcon";
import { rs } from "@/theme/scale";

export default function NestWriteFab() {
  const router = useRouter();
  return (
    <Pressable style={styles.fab} onPress={() => router.push("/saerok/write")}>
      <AddSaerokDexIcon width={rs(40)} height={rs(38.333)} color="#FEFEFE" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: rs(24),
    bottom: rs(24),
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    backgroundColor: "#5F8EFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
});

