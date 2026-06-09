import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import MoreVerticalIcon from "@/assets/icon/saerok/MoreVerticalIcon";
import EmptyState from "@/components/common/EmptyState";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import AnimatedModalContent from "@/components/common/AnimatedModalContent";
import ProfileAvatar from "@/components/my/ProfileAvatar";
import CommentInputBar from "@/components/saerok/CommentInputBar";
import { font, rfs, rs } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type CommentBoxProps = {
  commentId: number;
  userId: number;
  nickname: string;
  content: string;
  isMine?: boolean;
  createdAt?: string;
  updatedAt?: string;
  thumbnailProfileImageUrl?: string | null;
  profileImageUrl?: string | null;
  parentId?: number | null;
  replies?: CommentBoxProps[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: CommentBoxProps[];
  onDelete: (commentId: number) => Promise<void> | void;
  onUpdate?: (commentId: number, content: string) => Promise<void> | void;
  headerCount: number;
  onSubmit: (content: string) => Promise<void> | void;
  inputPlaceholder?: string;
  authorNickname?: string | null;
};

type ReplySelection = {
  activeId: number;
  parentId: number;
  nickname: string;
};

type OptionTarget = {
  commentId: number;
  content: string;
};

const OPTION_MENU_WIDTH = 100;
const OPTION_ROW_HEIGHT = 48;
const INPUT_BAR_HEIGHT = rs(80);

function formatElapsed(createdAt?: string | null) {
  if (!createdAt) return "";
  const ts = new Date(createdAt).getTime();
  if (!Number.isFinite(ts)) return "";

  const diff = Date.now() - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  return `${Math.floor(diff / day)}일 전`;
}

function buildThreadedComments(items: CommentBoxProps[]) {
  const baseItems = items.map((item) => ({
    ...item,
    replies: item.replies ? [...item.replies] : [],
  }));
  const byId = new Map<number, CommentBoxProps & { replies: CommentBoxProps[] }>();
  baseItems.forEach((item) => byId.set(item.commentId, item));

  const roots: Array<CommentBoxProps & { replies: CommentBoxProps[] }> = [];

  baseItems.forEach((item) => {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.replies.push(item);
      return;
    }
    roots.push(item);
  });

  return roots;
}

function OptionMenu({
  visible,
  anchorX,
  anchorY,
  onClose,
  onDelete,
}: {
  visible: boolean;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  onDelete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const scale = React.useRef(new Animated.Value(0.92)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      scale.setValue(0.92);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mounted) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => setMounted(false));
  }, [mounted, opacity, scale, visible]);

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.optionOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.optionCard,
            {
              left: Math.max(rs(4), anchorX - rs(OPTION_MENU_WIDTH) + rs(8)),
              top: Math.max(insets.top + rs(8), anchorY + rs(8)),
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Pressable style={styles.optionInner} onPress={() => {}}>
            <TouchableOpacity style={styles.optionRow} onPress={onDelete}>
              <Text style={styles.optionText}>삭제하기</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function CommentBlock({
  item,
  authorNickname,
  isReply = false,
  isReplyActive,
  onCaptureRef,
  onSelectReply,
  onOpenMenu,
}: {
  item: CommentBoxProps;
  authorNickname?: string | null;
  isReply?: boolean;
  isReplyActive: boolean;
  onCaptureRef: (commentId: number, node: View | null) => void;
  onSelectReply: (selection: ReplySelection) => void;
  onOpenMenu: (event: GestureResponderEvent, target: OptionTarget) => void;
}) {
  const router = useRouter();
  const isAuthor =
    !!authorNickname?.trim() &&
    authorNickname.trim() === item.nickname.trim();

  return (
    <View
      ref={(node) => onCaptureRef(item.commentId, node)}
      onLayout={(_event: LayoutChangeEvent) => {}}
    >
      <Pressable
        style={[
          styles.commentCard,
          isReply && styles.replyCard,
          isReplyActive && styles.commentCardActive,
        ]}
        onPress={() =>
          onSelectReply({
            activeId: item.commentId,
            parentId: item.parentId ?? item.commentId,
            nickname: item.nickname,
          })
        }
      >
        <View style={styles.commentTopRow}>
          <Pressable
            style={styles.commentAvatarWrap}
            disabled={!item.userId}
            onPress={(event) => {
              event.stopPropagation();
              if (!item.userId) return;
              router.push(`/saerok/profile/${item.userId}`);
            }}
          >
            <ProfileAvatar
              size={rs(29)}
              imageUrl={item.profileImageUrl || item.thumbnailProfileImageUrl}
              seed={item.nickname || String(item.userId)}
              borderWidth={0}
            />
          </Pressable>

          <View style={styles.commentMain}>
            <View style={styles.commentHeaderRow}>
              <View style={styles.commentHeaderLeft}>
                <Text style={styles.commentNickname}>{item.nickname}</Text>
                {isAuthor ? (
                  <View style={styles.authorBadge}>
                    <Text style={styles.authorBadgeText}>글쓴이</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.commentHeaderRight}>
                {!isReply ? (
                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={(event) => {
                      event.stopPropagation();
                      onSelectReply({
                        activeId: item.commentId,
                        parentId: item.commentId,
                        nickname: item.nickname,
                      });
                    }}
                  >
                    <Text style={styles.replyActionText}>답글달기</Text>
                  </Pressable>
                ) : null}

                {item.isMine ? (
                  <TouchableOpacity
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={(event) => {
                      event.stopPropagation();
                      onOpenMenu(event, {
                        commentId: item.commentId,
                        content: item.content,
                      });
                    }}
                  >
                    <MoreVerticalIcon
                      width={rs(17)}
                      height={rs(17)}
                      color="#979797"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <Text style={styles.commentContent}>{item.content}</Text>
            <Text style={styles.commentMetaText}>
              {formatElapsed(item.createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default function CommentModal({
  visible,
  onClose,
  items,
  onDelete,
  headerCount,
  onSubmit,
  inputPlaceholder,
  authorNickname,
}: Props) {
  const insets = useSafeAreaInsets();
  const inputRef = React.useRef<TextInput>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const commentRefsRef = React.useRef<Record<number, View | null>>({});
  const currentScrollYRef = React.useRef(0);
  const previousScrollYRef = React.useRef<number | null>(null);
  const replySelectionRef = React.useRef<ReplySelection | null>(null);

  const screenH = Dimensions.get("window").height;
  const sheetHeight = Math.floor(screenH * 0.95);
  const halfVisibleHeight = Math.floor(screenH * 0.64);
  const closeY = sheetHeight + rs(32);
  const halfY = Math.max(0, Math.floor(sheetHeight - screenH * 0.64));

  const translateY = React.useRef(new Animated.Value(closeY)).current;
  const startY = React.useRef(0);
  const openedAtRef = React.useRef(Date.now());

  const [sheetSnap, setSheetSnap] = React.useState<"half" | "full">("half");
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [replySelection, setReplySelection] =
    React.useState<ReplySelection | null>(null);
  const [optionVisible, setOptionVisible] = React.useState(false);
  const [optionAnchor, setOptionAnchor] = React.useState({ x: 0, y: 0 });
  const [optionTarget, setOptionTarget] = React.useState<OptionTarget | null>(
    null,
  );
  const [deleteVisible, setDeleteVisible] = React.useState(false);
  const replyScrollSpacer = Math.floor(Dimensions.get("window").height * 0.45);
  const extraVisiblePadding = rs(76);

  const threadedItems = React.useMemo(() => buildThreadedComments(items), [items]);

  React.useEffect(() => {
    replySelectionRef.current = replySelection;
  }, [replySelection]);

  const animateTo = React.useCallback(
    (to: number, done?: () => void) => {
      setSheetSnap(to === 0 ? "full" : "half");
      Animated.timing(translateY, {
        toValue: to,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => done?.());
    },
    [translateY],
  );

  const cancelReplyMode = React.useCallback(() => {
    const prevScrollY = previousScrollYRef.current;
    setReplySelection(null);
    inputRef.current?.blur();
    Keyboard.dismiss();
    if (prevScrollY != null) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: prevScrollY, animated: true });
      });
    }
    previousScrollYRef.current = null;
  }, []);

  const requestClose = React.useCallback(() => {
    cancelReplyMode();
    animateTo(closeY, onClose);
  }, [animateTo, cancelReplyMode, closeY, onClose]);

  React.useEffect(() => {
    if (!visible) return;
    openedAtRef.current = Date.now();
    translateY.setValue(closeY);
    requestAnimationFrame(() => animateTo(halfY));
  }, [animateTo, closeY, halfY, translateY, visible]);

  React.useEffect(() => {
    if (!visible) return;

    const showEvt = Keyboard.addListener("keyboardDidShow", (e) => {
      const end = e.endCoordinates;
      const byHeight = end?.height ?? 0;
      const windowHeight = Dimensions.get("window").height;
      const byScreenYOnWindow =
        typeof end?.screenY === "number"
          ? Math.max(0, windowHeight - end.screenY)
          : 0;
      const resolved = Math.max(byHeight, byScreenYOnWindow);
      setKeyboardHeight(resolved);
      animateTo(0);

      if (replySelectionRef.current) {
        requestAnimationFrame(() => {
          const node =
            commentRefsRef.current[replySelectionRef.current!.activeId];
          node?.measureInWindow?.((_, y, __, h) => {
            const visibleBottom =
              windowHeight - resolved - extraVisiblePadding;
            const hiddenBottom = y + h - visibleBottom;
            if (hiddenBottom > 0) {
              scrollRef.current?.scrollTo({
                y: Math.max(0, currentScrollYRef.current + hiddenBottom),
                animated: true,
              });
            }
          });
        });
      }
    });

    const hideEvt = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      if (replySelectionRef.current) {
        const prevScrollY = previousScrollYRef.current;
        setReplySelection(null);
        if (prevScrollY != null) {
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ y: prevScrollY, animated: true });
          });
        }
        previousScrollYRef.current = null;
      }
    });

    return () => {
      showEvt.remove();
      hideEvt.remove();
    };
  }, [animateTo, extraVisiblePadding, visible]);

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

  const activateReplyMode = React.useCallback((selection: ReplySelection) => {
    if (previousScrollYRef.current == null) {
      previousScrollYRef.current = currentScrollYRef.current;
    }
    setReplySelection(selection);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const openMenu = React.useCallback(
    (event: GestureResponderEvent, target: OptionTarget) => {
      const { pageX, pageY } = event.nativeEvent;
      setOptionAnchor({ x: pageX, y: pageY });
      setOptionTarget(target);
      setOptionVisible(true);
    },
    [],
  );

  const handleDelete = React.useCallback(() => {
    setOptionVisible(false);
    setDeleteVisible(true);
  }, []);

  const confirmDelete = React.useCallback(async () => {
    const target = optionTarget;
    setDeleteVisible(false);
    if (!target) return;
    await onDelete(target.commentId);
  }, [onDelete, optionTarget]);

  const handleSubmit = React.useCallback(
    async (content: string) => {
      await onSubmit(content);
      const prevScrollY = previousScrollYRef.current;
      setReplySelection(null);
      inputRef.current?.blur();
      Keyboard.dismiss();
      if (prevScrollY != null) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y: prevScrollY, animated: true });
        });
      }
      previousScrollYRef.current = null;
    },
    [onSubmit],
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={requestClose}
    >
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
          <TouchableOpacity
            onPress={requestClose}
            style={styles.closeBtn}
            accessibilityRole="button"
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <Pressable style={styles.bodyArea} onPress={cancelReplyMode}>
          <ScrollView
            ref={scrollRef}
            style={[
              styles.scroll,
              {
                height:
                  sheetSnap === "full"
                    ? sheetHeight - rs(24) - rs(62)
                    : halfVisibleHeight - rs(24) - rs(62),
              },
            ]}
            contentContainerStyle={[
              styles.list,
              {
                paddingBottom:
                  INPUT_BAR_HEIGHT +
                  insets.bottom +
                  rs(16) +
                  (replySelection ? replyScrollSpacer : 0),
              },
            ]}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            onScroll={(event) => {
              currentScrollYRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          >
            {threadedItems.length ? (
              threadedItems.map((item) => (
                <View key={item.commentId} style={styles.commentGroup}>
                  <CommentBlock
                    item={item}
                    authorNickname={authorNickname}
                    isReplyActive={replySelection?.activeId === item.commentId}
                    onCaptureRef={(commentId, node) => {
                      commentRefsRef.current[commentId] = node;
                    }}
                    onSelectReply={activateReplyMode}
                    onOpenMenu={openMenu}
                  />

                  {item.replies?.map((reply) => (
                    <CommentBlock
                      key={reply.commentId}
                      item={reply}
                      authorNickname={authorNickname}
                      isReply
                      isReplyActive={
                        replySelection?.activeId === reply.commentId
                      }
                      onCaptureRef={(commentId, node) => {
                        commentRefsRef.current[commentId] = node;
                      }}
                      onSelectReply={activateReplyMode}
                      onOpenMenu={openMenu}
                    />
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyStateWrap}>
                <EmptyState
                  bgColor="gray"
                  upperText="아직 댓글이 없어요."
                  lowerText="가장 먼저 댓글을 남겨보세요."
                />
              </View>
            )}
          </ScrollView>
        </Pressable>
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
            { paddingBottom: keyboardHeight > 0 ? rs(24) : Math.max(rs(24), insets.bottom) },
          ]}
        >
          <CommentInputBar
            ref={inputRef}
            placeholder={
              replySelection
                ? `${replySelection.nickname}님에게 댓글 남기기`
                : inputPlaceholder
            }
            onSubmit={handleSubmit}
          />
        </View>
      </View>

      <OptionMenu
        visible={optionVisible}
        anchorX={optionAnchor.x}
        anchorY={optionAnchor.y}
        onClose={() => setOptionVisible(false)}
        onDelete={handleDelete}
      />

      <Modal
        transparent
        visible={deleteVisible}
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <Pressable
          style={styles.alertBackdrop}
          onPress={() => setDeleteVisible(false)}
        >
          <AnimatedModalContent visible={deleteVisible}>
            <Pressable style={styles.alertCard} onPress={() => {}}>
            <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

            <View style={styles.alertTextBlock}>
              <Text style={styles.alertMainText}>댓글을 삭제하시겠어요?</Text>
              <Text style={styles.alertSubText}>
                삭제된 댓글은 복구할 수 없어요.
              </Text>
            </View>

            <View style={styles.alertBtnRow}>
              <Pressable
                style={styles.alertLeftBtn}
                onPress={() => setDeleteVisible(false)}
              >
                <Text style={styles.alertLeftBtnText}>취소</Text>
              </Pressable>

              <Pressable style={styles.alertRightBtn} onPress={confirmDelete}>
                <Text style={styles.alertRightBtnText}>삭제하기</Text>
              </Pressable>
            </View>
            </Pressable>
          </AnimatedModalContent>
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
    backgroundColor: "#F2F2F2",
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
  bodyArea: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  list: {
    paddingHorizontal: rs(24),
    paddingTop: rs(8),
  },
  commentGroup: {
    marginBottom: rs(7),
    gap: rs(7),
  },
  commentCard: {
    backgroundColor: "#FEFEFE",
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingTop: rs(10),
    paddingBottom: rs(12),
  },
  commentCardActive: {
    backgroundColor: "#EAEAEA",
  },
  replyCard: {
    backgroundColor: "#F2F2F2",
    marginLeft: rs(24),
  },
  commentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(8),
  },
  commentAvatarWrap: {
    width: rs(29),
    height: rs(29),
    borderRadius: rs(14.5),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  commentMain: {
    flex: 1,
    minWidth: 0,
  },
  commentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    flex: 1,
    minWidth: 0,
  },
  commentNickname: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(15),
    lineHeight: rfs(22),
    fontWeight: "400",
  },
  authorBadge: {
    paddingHorizontal: rs(3),
    paddingVertical: rs(1),
    borderRadius: rs(5),
    backgroundColor: "#4190FF",
  },
  authorBadgeText: {
    color: "#FEFEFE",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "700",
  },
  commentHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
    marginLeft: rs(10),
  },
  replyActionText: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  commentContent: {
    marginTop: rs(5),
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  commentMetaText: {
    marginTop: rs(5),
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  inputDock: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 40,
  },
  inputDockInner: {
    backgroundColor: "transparent",
  },
  optionOverlay: {
    flex: 1,
  },
  optionCard: {
    position: "absolute",
    width: rs(OPTION_MENU_WIDTH),
    borderRadius: rs(14),
    backgroundColor: "#FEFEFE",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: rs(10),
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  optionInner: {
    borderRadius: rs(14),
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
  },
  optionRow: {
    height: rs(OPTION_ROW_HEIGHT),
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    color: "#0D0D0D",
    fontSize: rfs(16),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  alertBackdrop: {
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
  alertTextBlock: {
    alignItems: "center",
    gap: rs(6),
  },
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
  alertLeftBtn: {
    flex: 1,
    height: rs(42),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  alertLeftBtnText: {
    color: "#FEFEFE",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  alertRightBtn: {
    flex: 1,
    height: rs(42),
    borderRadius: rs(15),
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1.5),
    borderColor: "#D90000",
    alignItems: "center",
    justifyContent: "center",
  },
  alertRightBtnText: {
    color: "#D90000",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  emptyStateWrap: {
    minHeight: rs(240),
    justifyContent: "center",
  },
});
