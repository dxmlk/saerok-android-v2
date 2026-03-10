import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { rfs, rs } from "@/theme";

type Props = {
  placeholder?: string;
  onSubmit: (value: string) => Promise<void> | void;
};

export default function CommentInputBar({
  placeholder = "댓글 남기기",
  onSubmit,
}: Props) {
  const [value, setValue] = useState("");
  const isActive = useMemo(() => value.trim().length > 0, [value]);

  const handleSend = async () => {
    const v = value.trim();
    if (!v) return;
    try {
      await onSubmit(v);
      setValue("");
    } catch {}
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#979797"
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        <Pressable
          onPress={handleSend}
          disabled={!isActive}
          style={[styles.sendBtn, isActive ? styles.sendOn : styles.sendOff]}
          accessibilityRole="button"
          accessibilityLabel="댓글 전송"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M11.9999 3V21M11.9999 3L3 11.6071M11.9999 3L21 11.6071"
              stroke="#FEFEFE"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingTop: rs(19),
    paddingHorizontal: rs(9),
    paddingBottom: 0,
    borderTopWidth: rs(1),
    borderTopColor: "#DAE0DE",
    backgroundColor: "#FFFFFF",
  },
  bar: {
    width: "100%",
    borderRadius: rs(23),
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    paddingLeft: rs(16),
    paddingRight: rs(5),
    paddingVertical: rs(5),
  },
  input: {
    flex: 1,
    fontSize: rfs(15),
    color: "#0D0D0D",
    paddingVertical: rs(8),
    lineHeight: rfs(18),
  },
  sendBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },
  sendOn: { backgroundColor: "#4190FF" },
  sendOff: { backgroundColor: "#D3D8D6" },
});
