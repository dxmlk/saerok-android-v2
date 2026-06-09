import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import {
  CollectionLikeUser,
  fetchCollectionLikeListApi,
  getCollectionLikeStatusApi,
  toggleCollectionLikeApi,
} from "@/services/api/collections";
import { font, rfs, rs } from "@/theme";
import HeartIcon from "@/assets/icon/saerok/HeartIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import EmptyState from "@/components/common/EmptyState";
import TouchableOpacity from "@/components/common/TouchableOpacity";

type Props = {
  collectionId: number;
  variant?: "default" | "floating" | "vertical";
};

function LikeSheet({
  open,
  onClose,
  count,
  users,
  onPressUser,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  users: CollectionLikeUser[];
  onPressUser: (id: number) => void;
}) {
  const screenH = Dimensions.get("window").height;
  const sheetHeight = Math.floor(screenH * 0.95);
  const translateY = useRef(new Animated.Value(sheetHeight + rs(32))).current;
  const startY = useRef(0);
  const halfY = Math.max(0, Math.floor(sheetHeight - screenH * 0.64));
  const closeY = sheetHeight + rs(32);

  const animateTo = React.useCallback(
    (to: number, done?: () => void) => {
      Animated.timing(translateY, {
        toValue: to,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => done?.());
    },
    [translateY],
  );

  const requestClose = React.useCallback(() => {
    animateTo(closeY, onClose);
  }, [animateTo, closeY, onClose]);

  useEffect(() => {
    if (!open) return;
    translateY.setValue(closeY);
    requestAnimationFrame(() => animateTo(halfY));
  }, [animateTo, closeY, halfY, open, translateY]);

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

  const openedAtRef = useRef(Date.now());
  useEffect(() => {
    if (!open) return;
    openedAtRef.current = Date.now();
  }, [open]);

  if (!open) return null;

  return (
    <Modal
      visible={open}
      animationType="none"
      transparent
      onRequestClose={requestClose}
    >
      <Pressable
        style={styles.sheetDim}
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

        <View style={styles.sheetHeader} {...panResponder.panHandlers}>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>좋아요</Text>
            <Text style={styles.sheetCount}>{count}</Text>
          </View>
          <TouchableOpacity
            onPress={requestClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <Text style={styles.sheetClose}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {users.length ? (
            users.map((u) => {
              const uri = u.thumbnailProfileImageUrl || u.profileImageUrl || "";
              return (
                <TouchableOpacity
                  key={u.userId}
                  style={styles.userRow}
                  onPress={() => onPressUser(u.userId)}
                  accessibilityRole="button"
                  accessibilityLabel={`${u.nickname} 프로필 열기`}
                >
                  <View style={styles.userLeft}>
                    <View style={styles.userAvatarWrap}>
                      {uri ? (
                        <Image source={{ uri }} style={styles.userAvatarImg} />
                      ) : (
                        <View style={styles.userAvatarFallback} />
                      )}
                    </View>
                    <Text style={styles.userName}>{u.nickname}</Text>
                  </View>
                  <InfoChevronIcon
                    width={rs(17)}
                    height={rs(17)}
                    color="#979797"
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <EmptyState
              bgColor="gray"
              upperText="지금은 고요한 숲처럼 조용하네요."
              lowerText="새로운 알림이 도착하면 이곳에 알려드릴게요."
            />
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

export default function CollectionLikeButton({
  collectionId,
  variant = "default",
}: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [likeUsers, setLikeUsers] = useState<CollectionLikeUser[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const likeCount = useRef(0);
  const [, force] = useState(0);

  useEffect(() => {
    if (!collectionId) return;

    let cancelled = false;

    (async () => {
      if (isLoggedIn) {
        try {
          const liked = await getCollectionLikeStatusApi(collectionId);
          if (!cancelled) setIsLiked(liked);
        } catch {}
      } else if (!cancelled) {
        setIsLiked(false);
      }

      try {
        const items = await fetchCollectionLikeListApi(collectionId);
        if (!cancelled) {
          likeCount.current = items.length;
          setLikeUsers(items);
          force((v) => v + 1);
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, [collectionId, isLoggedIn]);

  const onToggle = async () => {
    if (!collectionId) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      await toggleCollectionLikeApi(collectionId);

      setIsLiked((prev) => {
        const next = !prev;
        if (next) likeCount.current += 1;
        else likeCount.current = Math.max(0, likeCount.current - 1);
        force((v) => v + 1);
        return next;
      });
      try {
        const items = await fetchCollectionLikeListApi(collectionId);
        setLikeUsers(items);
      } catch {}
    } catch {}
  };

  const openLikeSheet = async () => {
    try {
      const items = await fetchCollectionLikeListApi(collectionId);
      setLikeUsers(items);
      likeCount.current = items.length;
      force((v) => v + 1);
    } catch {}
    setSheetOpen(true);
  };

  return (
    <View
      style={[
        styles.btn,
        variant === "floating" && styles.btnFloating,
        variant === "vertical" && styles.btnVertical,
      ]}
    >
      <View
        style={[
          styles.row,
          variant === "floating" && styles.rowFloating,
          variant === "vertical" && styles.rowVertical,
        ]}
      >
        <TouchableOpacity
          onPress={onToggle}
          style={[
            styles.leftGroup,
            variant === "floating" && styles.leftGroupFloating,
            variant === "vertical" && styles.leftGroupVertical,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? "좋아요 취소" : "좋아요"}
        >
          <View
            style={[
              styles.iconWrap,
              variant === "floating" && styles.iconWrapFloating,
              variant === "vertical" && styles.iconWrapVertical,
            ]}
          >
            <HeartIcon
              width={rs(24)}
              height={rs(24)}
              fillColor={isLiked ? "#FF234F" : "transparent"}
              strokeColor={isLiked ? "#FF234F" : "#0D0D0D"}
              strokeWidth={2}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openLikeSheet}
          style={[
            styles.countWrap,
            variant === "floating" && styles.countWrapFloating,
            variant === "vertical" && styles.countWrapVertical,
          ]}
          accessibilityRole="button"
          accessibilityLabel="좋아요 목록 열기"
        >
          <Text style={styles.count}>{likeCount.current}</Text>
        </TouchableOpacity>
      </View>

      <LikeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        count={likeCount.current}
        users={likeUsers}
        onPressUser={(id) => {
          setSheetOpen(false);
          router.push(`/saerok/profile/${id}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: rs(16),
    paddingLeft: rs(14),
    paddingRight: rs(21),
  },
  btnFloating: {
    flex: 0,
    paddingVertical: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  btnVertical: {
    flex: 0,
    paddingVertical: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowFloating: {
    justifyContent: "center",
    gap: rs(10),
  },
  rowVertical: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(6),
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  leftGroupFloating: {
    position: "relative",
  },
  leftGroupVertical: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: rs(40),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconWrapFloating: {
    width: rs(24),
    height: rs(24),
  },
  iconWrapVertical: {
    width: rs(24),
    height: rs(24),
  },
  count: {
    color: "#0D0D0D",
    fontSize: rfs(18),
    fontWeight: "400",
    lineHeight: rfs(22),
  },
  countWrap: {
    paddingLeft: rs(6),
    paddingRight: rs(2),
    paddingVertical: rs(6),
  },
  countWrapFloating: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingVertical: 0,
  },
  countWrapVertical: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
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
  sheetHeader: {
    height: rs(62),
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(24),
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
  },
  sheetTitle: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(18),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  sheetCount: {
    color: "#4190FF",
    fontFamily: font.haru,
    fontSize: rfs(18),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  sheetClose: {
    color: "#979797",
    fontSize: rfs(24),
    lineHeight: rfs(24),
  },
  sheetContent: {
    paddingHorizontal: rs(24),
    paddingTop: rs(12),
    gap: rs(7),
    paddingBottom: rs(20),
  },
  userRow: {
    minHeight: rs(61),
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(16),
    paddingVertical: rs(10),
  },
  userLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(7),
  },
  userAvatarWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(16),
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  userAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: rs(16),
  },
  userAvatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  userName: {
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
});
