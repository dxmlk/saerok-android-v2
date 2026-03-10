import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import LogoutAccountIcon from "@/assets/icon/icon/LogoutAccountIcon";
import WithdrawAccountIcon from "@/assets/icon/icon/WithdrawAccountIcon";
import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import SimpleHeader from "@/components/common/SimpleHeader";
import { useAuth } from "@/hooks/useAuth";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  const t = new Date(dateStr);
  if (Number.isNaN(t.getTime())) return "-";
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

type ConfirmModalState = {
  visible: boolean;
  mainText: string;
  subText?: string;
  leftText: string;
  rightText: string;
  leftVariant?: "blueOutline" | "redOutline";
  onLeft?: (() => void) | null;
  onRight?: (() => void) | null;
};

const initialModal: ConfirmModalState = {
  visible: false,
  mainText: "",
  subText: "",
  leftText: "",
  rightText: "",
  leftVariant: "blueOutline",
  onLeft: null,
  onRight: null,
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [confirmModal, setConfirmModal] =
    useState<ConfirmModalState>(initialModal);
  const anim = useRef(new Animated.Value(0)).current;

  const joinedDateText = useMemo(
    () => formatDate(user?.joinedDate),
    [user?.joinedDate],
  );

  useEffect(() => {
    if (!confirmModal.visible) {
      anim.setValue(0);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [anim, confirmModal.visible]);

  const openLogoutModal = () => {
    setConfirmModal({
      visible: true,
      mainText: "정말 로그아웃 하시겠어요?",
      subText: "",
      leftText: "취소",
      rightText: "로그아웃",
      leftVariant: "blueOutline",
      onLeft: null,
      onRight: () => {
        void logout();
      },
    });
  };

  const openWithdrawModal = () => {
    setConfirmModal({
      visible: true,
      mainText: "정말 탈퇴하시겠어요?",
      subText: "탈퇴 시 탐조 기록이 모두 삭제돼요.",
      leftText: "탈퇴하기",
      rightText: "돌아가기",
      leftVariant: "redOutline",
      onLeft: () => {},
      onRight: null,
    });
  };

  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({
      ...prev,
      visible: false,
      onLeft: null,
      onRight: null,
    }));

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const opacity = anim;

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <SimpleHeader title={"내 계정 관리"} circleBackButton />

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{"연결된 소셜 로그인 계정"}</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {user?.email ?? "-"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{"가입일자"}</Text>
          <Text style={styles.infoValue}>{joinedDateText}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <Pressable style={styles.actionBtn} onPress={openLogoutModal}>
            <View style={styles.actionInner}>
              <LogoutAccountIcon width={rs(24)} height={rs(24)} />
              <Text style={styles.actionText}>{"로그아웃"}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={openWithdrawModal}>
            <View style={styles.actionInner}>
              <WithdrawAccountIcon width={rs(24)} height={rs(24)} />
              <Text style={styles.actionText}>{"회원 탈퇴"}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        visible={confirmModal.visible}
        animationType="fade"
        onRequestClose={closeConfirmModal}
      >
        <Pressable style={styles.backdrop} onPress={closeConfirmModal}>
          <Animated.View
            style={[styles.modalWrap, { opacity, transform: [{ scale }] }]}
          >
            <Pressable style={styles.card} onPress={() => {}}>
              <Pressable style={styles.closeBtn} onPress={closeConfirmModal}>
                <CloseLineIcon width={rs(20)} height={rs(20)} color="#979797" />
              </Pressable>

              <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

              <View style={styles.textBlock}>
                <Text style={styles.mainText}>{confirmModal.mainText}</Text>
                {!!confirmModal.subText && (
                  <Text style={styles.subText}>{confirmModal.subText}</Text>
                )}
              </View>

              <View style={styles.btnRow}>
                <Pressable
                  style={[
                    styles.leftBtn,
                    confirmModal.leftVariant === "redOutline" &&
                      styles.leftBtnRed,
                  ]}
                  onPress={() => {
                    const fn = confirmModal.onLeft;
                    closeConfirmModal();
                    fn?.();
                  }}
                >
                  <Text
                    style={[
                      styles.leftBtnText,
                      confirmModal.leftVariant === "redOutline" &&
                        styles.leftBtnTextRed,
                    ]}
                  >
                    {confirmModal.leftText}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.rightBtn}
                  onPress={() => {
                    const fn = confirmModal.onRight;
                    closeConfirmModal();
                    fn?.();
                  }}
                >
                  <Text style={styles.rightBtnText}>
                    {confirmModal.rightText}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: rs(24),
    paddingTop: rs(18),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(28),
    gap: rs(12),
  },
  infoLabel: {
    flexShrink: 1,
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(18),
  },
  infoValue: {
    flexShrink: 1,
    color: "#979797",
    textAlign: "right",
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(18),
  },
  buttonGroup: {
    marginTop: rs(13),
    gap: rs(14),
    alignItems: "flex-start",
  },
  actionBtn: {
    height: rs(40),
    paddingTop: rs(9),
    paddingBottom: rs(9),
    paddingLeft: rs(12),
    paddingRight: rs(15),
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: rs(30.5),
    backgroundColor: "#F2F2F2",
  },
  actionInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },
  actionText: {
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(18),
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  modalWrap: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: rs(316),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingHorizontal: rs(16),
    paddingTop: rs(18),
    paddingBottom: rs(18),
    alignItems: "center",
    gap: rs(15),
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    right: rs(16),
    top: rs(16),
    zIndex: 1,
  },
  textBlock: {
    alignItems: "center",
    gap: rs(6),
    paddingHorizontal: rs(6),
  },
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
  leftBtnRed: {
    borderColor: "#D90000",
  },
  leftBtnText: {
    color: "#91BFFF",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  leftBtnTextRed: {
    color: "#D90000",
  },
  rightBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  rightBtnText: {
    color: "#FFFFFF",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
});
