import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import TouchableOpacity from "@/components/common/TouchableOpacity";
import { rfs, rs } from "@/theme";

type Props = {
  placeholder?: string;
  onSubmit: (value: string) => Promise<void> | void;
};

const CommentInputBar = forwardRef<TextInput, Props>(function CommentInputBar(
  { placeholder = "댓글 남기기", onSubmit },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const submitLockRef = useRef(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isActive = useMemo(
    () => value.trim().length > 0 && !submitting,
    [submitting, value],
  );

  useImperativeHandle(ref, () => inputRef.current as TextInput, []);

  const handleSend = async () => {
    const nextValue = value.trim();
    if (!nextValue || submitLockRef.current) return;

    submitLockRef.current = true;
    setSubmitting(true);

    try {
      await onSubmit(nextValue);
      setValue("");
    } catch {
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BlurView
        intensity={8}
        tint="light"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(255, 255, 255, 0)", "#FFFFFF"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.barWrap} pointerEvents="box-none">
        <View style={styles.bar}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#979797"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!submitting}
          />

          <TouchableOpacity
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
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default CommentInputBar;

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: rs(195),
    overflow: "hidden",
  },
  barWrap: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: rs(24),
    paddingBottom: rs(45),
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
  sendOn: {
    backgroundColor: "#4190FF",
  },
  sendOff: {
    backgroundColor: "#D3D8D6",
  },
});
