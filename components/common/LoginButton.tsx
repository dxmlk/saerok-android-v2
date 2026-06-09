import React from "react";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import { StyleSheet, Text } from "react-native";
import { rfs, rs } from "@/theme";

type Props = {
  onPress: () => void;
};

export default function LoginButton({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn}>
      <Text style={styles.text}>로그인 / 회원가입</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: rs(44),
    borderRadius: rs(30.5),
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#FFFFFF", fontSize: rfs(15), fontWeight: "600" },
});
