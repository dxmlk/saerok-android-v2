import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TouchableOpacity from "@/components/common/TouchableOpacity";

type Props = {
  visible: boolean;
  mainText: string;
  subText?: string;
  leftText: string;
  rightText: string;
  onClose: () => void;
  onLeft?: (() => void) | null;
  onRight?: (() => void) | null;
  leftDanger?: boolean;
};

export default function AppConfirmModal({
  visible,
  mainText,
  subText = "",
  leftText,
  rightText,
  onClose,
  onLeft,
  onRight,
  leftDanger = false,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      anim.setValue(0);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [anim, visible]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const opacity = anim;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[styles.modalWrap, { opacity, transform: [{ scale }] }]}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

            <View style={styles.textBlock}>
              <Text style={styles.mainText}>{mainText}</Text>
              {!!subText && <Text style={styles.subText}>{subText}</Text>}
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.leftBtn, leftDanger && styles.leftBtnDanger]}
                onPress={() => {
                  onClose();
                  onLeft?.();
                }}
              >
                <Text
                  style={[
                    styles.leftBtnText,
                    leftDanger && styles.leftBtnTextDanger,
                  ]}
                >
                  {leftText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rightBtn}
                onPress={() => {
                  onClose();
                  onRight?.();
                }}
              >
                <Text style={styles.rightBtnText}>{rightText}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  modalWrap: { width: "100%", alignItems: "center" },
  card: {
    width: rs(316),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingHorizontal: rs(16),
    paddingVertical: rs(18),
    alignItems: "center",
    gap: rs(15),
  },
  textBlock: { alignItems: "center", gap: rs(6) },
  mainText: {
    textAlign: "center",
    color: "#111827",
    fontSize: rfs(14),
    fontFamily: font.money,
  },
  subText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: rfs(13),
    lineHeight: rfs(18),
    fontFamily: font.regular,
  },
  btnRow: {
    marginTop: rs(5),
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rs(16),
    paddingHorizontal: rs(4),
  },
  leftBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(15),
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1.5),
    borderColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  leftBtnText: { color: "#91BFFF" },
  leftBtnDanger: {
    borderColor: "#D90000",
  },
  leftBtnTextDanger: {
    color: "#D90000",
    fontFamily: font.semibold,
    fontWeight: "600",
  },
  rightBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  rightBtnText: { color: "#FFFFFF" },
});
