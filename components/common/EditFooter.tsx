import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, rfs, rs } from "../../theme";
import TouchableOpacity from "@/components/common/TouchableOpacity";

type Props = {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function EditFooter({ text, onClick, disabled = false }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(rs(20), insets.bottom + rs(16)) },
      ]}
    >
      <TouchableOpacity
        onPress={disabled ? undefined : onClick}
        disabled={disabled}
        style={[
          styles.btn,
          disabled ? styles.btnDisabled : styles.btnEnabled,
        ]}
      >
        <Text
          style={[
            styles.text,
            disabled ? styles.textDisabled : styles.textEnabled,
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: rs(24),
    zIndex: 999,
    elevation: 50, //  Android
    backgroundColor: "transparent",
  },

  btn: {
    height: rs(53),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },

  btnEnabled: {
    backgroundColor: "#91BFFF", // mainBlue 색
  },
  btnDisabled: {
    backgroundColor: "#DAE0DE", // 회색
  },
  text: {
    fontSize: rfs(18),
    fontWeight: "500",
    lineHeight: rfs(21),
    fontFamily: font.medium,
  },
  textEnabled: { color: "#FEFEFE" },
  textDisabled: { color: "#FEFEFE" },
});
