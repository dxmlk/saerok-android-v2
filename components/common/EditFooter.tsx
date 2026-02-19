import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rfs, rs } from "../../theme";

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
      <Pressable
        onPress={disabled ? undefined : onClick}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          disabled ? styles.btnDisabled : styles.btnEnabled,
          !disabled && pressed ? styles.btnPressed : null,
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
      </Pressable>
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
  btnPressed: {
    opacity: 0.8,
  },

  text: {
    fontSize: rfs(18),
    fontWeight: "500",
    lineHeight: rfs(21),
  },
  textEnabled: { color: "#FEFEFE" },
  textDisabled: { color: "#FEFEFE" },
});
