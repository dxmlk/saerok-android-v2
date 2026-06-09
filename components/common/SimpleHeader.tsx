import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";
import BracketIcon from "@/assets/icon/common/BracketIcon";
import TouchableOpacity from "@/components/common/TouchableOpacity";

type Props = {
  title: string;
  onPressBack?: () => void;
  circleBackButton?: boolean;
};

export default function SimpleHeader({
  title,
  onPressBack,
  circleBackButton = false,
}: Props) {
  const router = useRouter();
  const handleBack = onPressBack ?? (() => router.back());

  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={handleBack} style={styles.back}>
        <View style={circleBackButton ? styles.backCircle : undefined}>
          <BracketIcon width={rs(17)} height={rs(17)} color="#0D0D0D" />
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: rs(84),
    paddingHorizontal: rs(24),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    position: "absolute",
    left: rs(8),
    top: "50%",
    marginTop: -rs(36),
    width: rs(72),
    height: rs(72),
    alignItems: "center",
    justifyContent: "center",
  },
  backCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "rgba(254, 254, 254, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#0D0D0D",
    fontSize: rfs(18),
    fontWeight: "400",
    fontFamily: font.haru,
  },
});
