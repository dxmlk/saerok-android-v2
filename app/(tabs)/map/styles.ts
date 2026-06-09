import { StyleSheet } from "react-native";

import { rfs, rs } from "@/theme";

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingWrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    position: "absolute",
    left: rs(24),
    right: rs(24),
  },
  researchWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  researchBtn: {
    paddingHorizontal: rs(16),
    height: rs(44),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: rs(8),
    backgroundColor: "#FEFEFE",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  researchText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontWeight: "400",
  },
});
