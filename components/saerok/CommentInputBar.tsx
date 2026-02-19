import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { rfs, rs } from "@/theme";

type Props = {
  placeholder?: string;
  onSubmit: (value: string) => Promise<void> | void;
  onClose?: () => void;
};

export default function CommentInputBar({
  placeholder = "댓글을 남겨보세요",
  onSubmit,
  onClose,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={styles.wrap}
    >
      <View style={styles.bar}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
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
          <Text
            style={[
              styles.sendText,
              isActive ? styles.sendTextOn : styles.sendTextOff,
            ]}
          >
            ↑
          </Text>
        </Pressable>
      </View>

      {onClose ? (
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityRole="button"
        >
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingTop: rs(19),
    paddingHorizontal: rs(9),
    paddingBottom: rs(44),
    borderTopWidth: rs(1),
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  bar: {
    width: "100%",
    borderRadius: rs(23),
    backgroundColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    paddingLeft: rs(24),
    paddingRight: rs(5),
    paddingVertical: rs(5),
  },
  input: {
    flex: 1,
    fontSize: rfs(14),
    color: "#111827",
    paddingVertical: rs(8),
  },
  sendBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },
  sendOn: {
    backgroundColor: "#DBEAFE",
  },
  sendOff: {
    backgroundColor: "#E5E7EB",
  },
  sendText: {
    fontSize: rfs(18),
    fontWeight: "900",
  },
  sendTextOn: {
    color: "#2563EB",
  },
  sendTextOff: {
    color: "#9CA3AF",
  },
  closeBtn: {
    marginTop: rs(10),
    alignSelf: "flex-end",
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    borderRadius: rs(10),
    backgroundColor: "#F3F4F6",
  },
  closeText: {
    color: "#111827",
    fontWeight: "800",
  },
});
