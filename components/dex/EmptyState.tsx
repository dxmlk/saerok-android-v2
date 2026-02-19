import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SaerokImage from "@/assets/images/SaerokImage";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";

type Props = {
  bgColor: "white" | "gray";
  upperText: string;
  lowerText: string;
  topInset?: number;
};

export default function EmptyState({
  bgColor,
  upperText,
  lowerText,
  topInset = 0,
}: Props) {
  const isWhite = bgColor === "white";

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: isWhite ? "#FFFFFF" : "#F2F2F2",
          paddingTop: topInset + rs(28), //
        },
      ]}
    >
      <Text style={styles.upper}>{upperText}</Text>
      <Text style={styles.lower}>{lowerText}</Text>

      <View style={styles.imgRow}>
        <SaerokImage
          width={rs(116)}
          height={rs(128)}
          color={isWhite ? "#F2F2F2" : "#FFFFFF"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(28),
  },
  upper: {
    fontFamily: font.haru,
    fontSize: rfs(20),
    color: "#111827",
  },
  lower: {
    marginTop: rs(5),
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(18),
    color: "#6B7280",
  },
  imgRow: {
    marginTop: rs(60),
    alignItems: "center",
    justifyContent: "center",
  },
});
