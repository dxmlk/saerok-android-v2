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

type Props = {
  collectionId: number;
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
        duration: 210,
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
          <Pressable onPress={requestClose} accessibilityRole="button" accessibilityLabel="닫기">
            <Text style={styles.sheetClose}>×</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {users.length ? (
            users.map((u) => {
              const uri = u.thumbnailProfileImageUrl || u.profileImageUrl || "";
              return (
                <Pressable
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
                  <InfoChevronIcon width={rs(17)} height={rs(17)} color="#979797" />
                </Pressable>
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

export default function CollectionLikeButton({ collectionId }: Props) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [likeUsers, setLikeUsers] = useState<CollectionLikeUser[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const likeCount = useRef(0);
  const [, force] = useState(0);

  useEffect(() => {
    if (!collectionId) return;

    let cancelled = false;

    (async () => {
      try {
        const liked = await getCollectionLikeStatusApi(collectionId);
        if (!cancelled) setIsLiked(liked);
      } catch {}

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
  }, [collectionId]);

  const onToggle = async () => {
    if (!collectionId) return;

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

  const recentUsers = likeUsers.slice(0, 4);

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
    <View style={styles.btn}>
      <View style={styles.row}>
        <Pressable
          onPress={onToggle}
          style={styles.leftGroup}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? "좋아요 취소" : "좋아요"}
        >
          <View style={styles.iconWrap}>
            <HeartIcon
              width={rs(22)}
              height={rs(20)}
              fillColor={isLiked ? "#FF234F" : "#FEFEFE"}
              strokeColor={isLiked ? "#FF234F" : "#0D0D0D"}
              strokeWidth={2}
            />
          </View>
          {recentUsers.length > 0 ? (
            <View style={styles.avatarStack}>
              {recentUsers.map((u, idx) => {
                const uri = u.thumbnailProfileImageUrl || u.profileImageUrl || "";
                return (
                  <View
                    key={`${u.userId}-${idx}`}
                    style={[
                      styles.avatarWrap,
                      idx > 0 && { marginLeft: -rs(11) },
                      { zIndex: recentUsers.length - idx },
                    ]}
                  >
                    {uri ? (
                      <Image source={{ uri }} style={styles.avatarImg} />
                    ) : (
                      <View style={styles.avatarFallback} />
                    )}
                  </View>
                );
              })}
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={openLikeSheet}
          style={styles.countWrap}
          accessibilityRole="button"
          accessibilityLabel="좋아요 목록 열기"
        >
          <Text style={styles.count}>{likeCount.current}</Text>
        </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  iconWrap: {
    width: rs(40),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -rs(19),
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
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: rs(16),
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
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
