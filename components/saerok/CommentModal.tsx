import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import EmptyState from "@/components/common/EmptyState";
import CommentInputBar from "@/components/saerok/CommentInputBar";
import { font, rfs, rs } from "@/theme";
import React from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type CommentBoxProps = {
  commentId: number;
  userId: number;
  nickname: string;
  content: string;
  isMine?: boolean;
  createdAt?: string;
  thumbnailProfileImageUrl?: string | null;
  profileImageUrl?: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: CommentBoxProps[];
  onDelete: (commentId: number) => Promise<void> | void;
  headerCount: number;
  onSubmit: (content: string) => Promise<void> | void;
  inputPlaceholder?: string;
};

type ActionTarget = {
  commentId: number;
  isMine: boolean;
  nickname: string;
};

function elapsedLabel(createdAt?: string) {
  if (!createdAt) return "";
  const ts = new Date(createdAt).getTime();
  if (!Number.isFinite(ts)) return "";
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 60) return `${Math.max(0, diffMin)}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 31) return `${diffDay}일 전`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${Math.max(1, diffMonth)}달 전`;
}

export default function CommentModal({
  visible,
  onClose,
  items,
  onDelete,
  headerCount,
  onSubmit,
  inputPlaceholder,
}: Props) {
  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get("window").height;
  const sheetHeight = Math.floor(screenH * 0.95);
  const translateY = React.useRef(new Animated.Value(sheetHeight + rs(32))).current;
  const startY = React.useRef(0);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [actionTarget, setActionTarget] = React.useState<ActionTarget | null>(null);

  const halfY = Math.max(0, Math.floor(sheetHeight - screenH * 0.64));
  const closeY = sheetHeight + rs(32);

  const animateTo = React.useCallback(
    (to: number, done?: () => void) => {
      Animated.timing(translateY, {
        toValue: to,
        duration: 210,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => done?.());
    },
    [translateY],
  );

  const requestClose = React.useCallback(() => {
    Keyboard.dismiss();
    animateTo(closeY, onClose);
  }, [animateTo, closeY, onClose]);

  React.useEffect(() => {
    if (!visible) return;
    translateY.setValue(closeY);
    requestAnimationFrame(() => animateTo(halfY));
  }, [animateTo, closeY, halfY, translateY, visible]);

  React.useEffect(() => {
    const showEvt = Keyboard.addListener("keyboardDidShow", (e) => {
      const end = e.endCoordinates;
      const byHeight = end?.height ?? 0;
      const windowHeight = Dimensions.get("window").height;
      const byScreenYOnWindow =
        typeof end?.screenY === "number" ? Math.max(0, windowHeight - end.screenY) : 0;
      // Galaxy keyboard options (emoji/suggestion strip) can change real covered area.
      // Use the larger value between reported keyboard height and screenY-derived overlap.
      const resolved = Math.max(byHeight, byScreenYOnWindow);
      setKeyboardHeight(resolved);
      animateTo(0);
    });
    const hideEvt = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showEvt.remove();
      hideEvt.remove();
    };
  }, [animateTo, screenH]);

  const finishByPosition = React.useCallback(
    (dy: number, vy: number) => {
      const current = Math.max(0, Math.min(closeY, startY.current + dy));
      if (vy > 1.25 || current > halfY + rs(120)) {
        requestClose();
        return;
      }
      const to = Math.abs(current - 0) <= Math.abs(current - halfY) ? 0 : halfY;
      animateTo(to);
    },
    [animateTo, closeY, halfY, requestClose],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > 4,
        onMoveShouldSetPanResponderCapture: (_, g) =>
          Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          translateY.stopAnimation((v) => {
            startY.current = Number(v) || 0;
          });
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, Math.min(closeY, startY.current + g.dy));
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, g) => finishByPosition(g.dy, g.vy),
        onPanResponderTerminate: (_, g) => finishByPosition(g.dy, g.vy),
      }),
    [closeY, finishByPosition, translateY],
  );

  const openedAtRef = React.useRef(Date.now());
  React.useEffect(() => {
    if (!visible) return;
    openedAtRef.current = Date.now();
  }, [visible]);

  if (!visible) return null;

  const isMine = !!actionTarget?.isMine;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={requestClose}>
      <Pressable
        style={styles.dim}
        onPress={() => {
          if (Date.now() - openedAtRef.current < 250) return;
          requestClose();
        }}
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY }],
            paddingBottom: 0,
          },
        ]}
      >
        <View style={styles.dragHandleWrap} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.topBar} {...panResponder.panHandlers}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>댓글</Text>
            <Text style={styles.count}>{headerCount}</Text>
          </View>
          <Pressable onPress={requestClose} style={styles.closeBtn} accessibilityRole="button">
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: rs(118) + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {items.length ? (
            items.map((c) => {
              const uri = c.thumbnailProfileImageUrl || c.profileImageUrl || "";
              return (
                <View key={c.commentId} style={styles.item}>
                  <View style={styles.itemHead}>
                    <View style={styles.authorRow}>
                      <View style={styles.avatarWrap}>
                        {uri ? <Image source={{ uri }} style={styles.avatar} /> : <View style={styles.avatarFallback} />}
                      </View>
                      <Text style={styles.nickname}>{c.nickname}</Text>
                      <Text style={styles.time}>{elapsedLabel(c.createdAt)}</Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        setActionTarget({
                          commentId: c.commentId,
                          isMine: !!c.isMine,
                          nickname: c.nickname,
                        })
                      }
                      style={styles.moreBtn}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.more}>⋮</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.content}>{c.content}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState bgColor="gray" upperText="아직 댓글이 없어요!" lowerText="댓글을 남겨보세요." />
            </View>
          )}
        </ScrollView>

      </Animated.View>

      <View
        pointerEvents="box-none"
        style={[
          styles.inputDock,
          {
            bottom: keyboardHeight > 0 ? keyboardHeight : 0,
          },
        ]}
      >
        <View
          style={[
            styles.inputDockInner,
            { paddingBottom: insets.bottom + rs(18) },
          ]}
        >
          <CommentInputBar placeholder={inputPlaceholder} onSubmit={onSubmit} />
        </View>
      </View>

      <Modal
        transparent
        visible={!!actionTarget}
        animationType="fade"
        onRequestClose={() => setActionTarget(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setActionTarget(null)}>
          <Pressable style={styles.alertCard} onPress={() => {}}>
            <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

            <View style={styles.alertTextBlock}>
              <Text style={styles.alertMainText}>
                {isMine ? "댓글을 삭제하시겠어요?" : "댓글을 신고하시겠어요?"}
              </Text>
              <Text style={styles.alertSubText}>
                {isMine
                  ? "삭제된 댓글은 복구할 수 없어요."
                  : "커뮤니티 가이드에 따라\n신고 사유에 해당하는지 검토 후 처리돼요."}
              </Text>
            </View>

            <View style={styles.alertBtnRow}>
              <Pressable style={styles.leftBtn} onPress={() => setActionTarget(null)}>
                <Text style={styles.leftBtnText}>취소</Text>
              </Pressable>

              <Pressable
                style={styles.rightBtn}
                onPress={async () => {
                  const target = actionTarget;
                  setActionTarget(null);
                  if (!target) return;
                  if (target.isMine) {
                    await onDelete(target.commentId);
                  }
                }}
              >
                <Text style={styles.rightBtnText}>{isMine ? "삭제하기" : "신고하기"}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: "50%",
    backgroundColor: "#F2F2F2",
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    overflow: "hidden",
  },
  dragHandleWrap: {
    height: rs(24),
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    width: rs(80),
    height: rs(5),
    borderRadius: rs(999),
    backgroundColor: "#D3D8D6",
  },
  topBar: {
    height: rs(62),
    paddingHorizontal: rs(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
  },
  title: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(18),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  count: {
    color: "#4190FF",
    fontFamily: font.haru,
    fontSize: rfs(18),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  closeBtn: {
    width: rs(34),
    height: rs(34),
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#979797",
    fontSize: rfs(24),
    lineHeight: rfs(24),
  },
  list: {
    paddingHorizontal: rs(24),
    paddingTop: rs(8),
    gap: rs(7),
  },
  item: {
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),
  },
  itemHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(8),
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
    flex: 1,
  },
  avatarWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(16),
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  nickname: {
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  time: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  more: {
    color: "#979797",
    fontSize: rfs(18),
    lineHeight: rfs(18),
  },
  moreBtn: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(8),
    marginRight: -rs(4),
  },
  content: {
    color: "#0D0D0D",
    fontSize: rfs(14),
    lineHeight: rfs(20),
  },
  emptyWrap: {
    minHeight: rs(260),
    justifyContent: "center",
  },
  inputDock: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 40,
  },
  inputDockInner: {
    backgroundColor: "#FFFFFF",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  alertCard: {
    width: rs(316),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingHorizontal: rs(16),
    paddingVertical: rs(18),
    alignItems: "center",
    gap: rs(15),
  },
  alertTextBlock: { alignItems: "center", gap: rs(6) },
  alertMainText: {
    textAlign: "center",
    color: "#111827",
    fontSize: rfs(14),
    fontFamily: font.money,
  },
  alertSubText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: rfs(13),
    lineHeight: rfs(18),
  },
  alertBtnRow: {
    width: "100%",
    flexDirection: "row",
    gap: rs(8),
  },
  leftBtn: {
    flex: 1,
    height: rs(42),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  leftBtnText: {
    color: "#FEFEFE",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  rightBtn: {
    flex: 1,
    height: rs(42),
    borderRadius: rs(15),
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1.5),
    borderColor: "#D90000",
    alignItems: "center",
    justifyContent: "center",
  },
  rightBtnText: {
    color: "#D90000",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
});
