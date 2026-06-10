import MoreVerticalIcon from "@/assets/icon/saerok/MoreVerticalIcon";
import AppAlertModal from "@/components/common/AppAlertModal";
import SimpleHeader from "@/components/common/SimpleHeader";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import { getAnnouncementDetail } from "@/services/api/announcements";
import { fetchCollectionDetail } from "@/services/api/collections";
import { fetchFreeBoardPostDetailApi } from "@/services/api/community";
import {
  deleteAllNotificationsApi,
  deleteNotificationApi,
  fetchNotificationsApi,
  readAllNotificationsApi,
  readNotificationApi,
  type NotificationItem,
  type NotificationType,
} from "@/services/api/notifications";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const SWIPE_ACTION_GAP = rs(9);
const SWIPE_ACTION_WIDTH = rs(96);
const SWIPE_REVEAL_WIDTH = SWIPE_ACTION_WIDTH + SWIPE_ACTION_GAP;
const SWIPE_TRIGGER_THRESHOLD = rs(8);
const USE_NOTIFICATION_DUMMY_DATA = false;

const DUMMY_COLLECTION_IMAGE =
  "https://images.unsplash.com/photo-1516233758813-a38d024919c5?q=80&w=400&auto=format&fit=crop";
const DUMMY_ACTOR_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop";

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function getDummyNotifications(): NotificationItem[] {
  return [
    {
      id: 9001,
      type: "SYSTEM_ADMIN_MESSAGE",
      actorId: null,
      actorNickname: null,
      actorProfileImageUrl: null,
      payload: {
        body:
          "‘왜가리’ 새록이 삭제되었어요. 참 아쉽네요! 어떻게 하죠?? 운영팀 알림은 펼치면 전체 문장이 보여요.",
      },
      isRead: false,
      createdAt: minutesAgo(60 * 24 * 3),
    },
    {
      id: 9002,
      type: "SYSTEM_ADMIN_MESSAGE",
      actorId: null,
      actorNickname: null,
      actorProfileImageUrl: null,
      payload: {
        body:
          "운영 정책 안내 메시지입니다. 접힌 상태와 펼친 상태의 높이를 확인하기 위한 두 번째 운영팀 알림이에요.",
      },
      isRead: true,
      createdAt: minutesAgo(60 * 24 * 2),
    },
    {
      id: 9010,
      type: "COMMENTED_ON_COLLECTION",
      actorId: 101,
      actorNickname: "비둘기짱",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        collectionId: 1001,
        collectionImageUrl: DUMMY_COLLECTION_IMAGE,
        comment: "새 참 찍으셨네요.",
      },
      isRead: true,
      createdAt: minutesAgo(60 * 24 * 3),
    },
    {
      id: 9011,
      type: "LIKED_ON_COLLECTION",
      actorId: 102,
      actorNickname: "비둘기짱",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        collectionId: 1002,
        collectionImageUrl: DUMMY_COLLECTION_IMAGE,
      },
      isRead: false,
      createdAt: minutesAgo(10),
    },
    {
      id: 9012,
      type: "SYSTEM_PUBLISHED_ANNOUNCEMENT",
      actorId: null,
      actorNickname: null,
      actorProfileImageUrl: null,
      payload: {
        announcementId: 3001,
        title: "답글 기능이 추가되었어요!",
        body: "더 재미있어진 새록으로 다른 사람들과 소통해보세요.",
        inAppBody: "더 재미있어진 새록으로 다른 사람들과 소통해보세요.",
      },
      isRead: false,
      createdAt: minutesAgo(60 * 24 * 3),
    },
    {
      id: 9013,
      type: "SUGGESTED_BIRD_ID_ON_COLLECTION",
      actorId: 103,
      actorNickname: "두근두근",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        collectionId: 1003,
        collectionImageUrl: DUMMY_COLLECTION_IMAGE,
        suggestedName: "검은댕기해오라기",
      },
      isRead: true,
      createdAt: minutesAgo(60 * 24 * 3),
    },
    {
      id: 9014,
      type: "BIRD_ID_SUGGESTED_ON_COLLECTION",
      actorId: 104,
      actorNickname: "새박사",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        collectionId: "1004",
        collectionImageUrl: DUMMY_COLLECTION_IMAGE,
        suggestedName: "왜가리",
      },
      isRead: false,
      createdAt: minutesAgo(34),
    },
    {
      id: 9015,
      type: "BIRD_ID_ADOPTED_ON_COLLECTION",
      actorId: 105,
      actorNickname: "도감요정",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        collectionId: 1005,
        collectionImageUrl: DUMMY_COLLECTION_IMAGE,
        suggestedName: "쇠백로",
      },
      isRead: false,
      createdAt: minutesAgo(42),
    },
    {
      id: 9016,
      type: "REPLIED_TO_COMMENT",
      actorId: 106,
      actorNickname: "댓글러",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        collectionId: 1006,
        collectionImageUrl: DUMMY_COLLECTION_IMAGE,
        commentId: 2001,
        comment: "저도 그렇게 보여요!",
      },
      isRead: true,
      createdAt: minutesAgo(73),
    },
    {
      id: 9017,
      type: "COMMENTED_ON_FREE_BOARD_POST",
      actorId: 107,
      actorNickname: "둥지친구",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        freeBoardPostId: 4001,
        comment: "저도 궁금했던 내용이에요.",
      },
      isRead: false,
      createdAt: minutesAgo(85),
    },
    {
      id: 9018,
      type: "REPLIED_TO_FREE_BOARD_COMMENT",
      actorId: 108,
      actorNickname: "자유로운새",
      actorProfileImageUrl: DUMMY_ACTOR_IMAGE,
      payload: {
        freeBoardPostId: "4002",
        freeBoardCommentId: 5001,
        comment: "답글 남겨주셔서 고마워요.",
      },
      isRead: true,
      createdAt: minutesAgo(120),
    },
  ];
}

function formatElapsed(value: string) {
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return "";
  const diff = Date.now() - target;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  return `${Math.floor(diff / day)}일 전`;
}

function getPayloadImage(payload: Record<string, unknown> | null) {
  if (!payload) return null;
  const candidates = [
    payload.thumbnailImageUrl,
    payload.collectionThumbnailImageUrl,
    payload.imageUrl,
    payload.collectionImageUrl,
  ];
  return (
    candidates.find(
      (value): value is string => typeof value === "string" && !!value,
    ) ?? null
  );
}

function readNumericPayloadValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getCollectionId(payload: Record<string, unknown> | null) {
  if (!payload) return null;
  const candidates = [
    payload.collectionId,
    payload.targetCollectionId,
    payload.saerokId,
  ];
  for (const candidate of candidates) {
    const value = readNumericPayloadValue(candidate);
    if (value != null) return value;
  }
  return null;
}

function getFreeBoardPostId(payload: Record<string, unknown> | null) {
  if (!payload) return null;
  return readNumericPayloadValue(payload.freeBoardPostId);
}

function getAnnouncementId(payload: Record<string, unknown> | null) {
  if (!payload) return null;
  return readNumericPayloadValue(payload.announcementId);
}

function getInitialSaerokSheet(type: NotificationType) {
  switch (type as NotificationType) {
    case "LIKED_ON_COLLECTION":
      return "likes";
    case "COMMENTED_ON_COLLECTION":
    case "REPLIED_TO_COMMENT":
    case "REPLIED_ON_COMMENT":
      return "comments";
    case "SUGGESTED_BIRD_ID_ON_COLLECTION":
    case "BIRD_ID_SUGGESTED_ON_COLLECTION":
    case "BIRD_ID_ADOPTED_ON_COLLECTION":
      return "suggestions";
    default:
      return null;
  }
}

function isMissingTargetError(error: any) {
  const status = error?.response?.status;
  return status === 404 || status === 410;
}

function isSystemNoticeType(type: NotificationType) {
  return type === "SYSTEM_ADMIN_MESSAGE";
}

function isAnnouncementNoticeType(type: NotificationType) {
  return type === "SYSTEM_PUBLISHED_ANNOUNCEMENT";
}

function getSystemNoticeLabel(item: NotificationItem) {
  switch (item.type as NotificationType) {
    case "SYSTEM_ADMIN_MESSAGE":
      return "새록 운영팀";
    default:
      return "알림";
  }
}

function getSystemNoticeMessage(item: NotificationItem) {
  switch (item.type as NotificationType) {
    case "SYSTEM_ADMIN_MESSAGE":
      return String(
        item.payload?.body ??
          item.payload?.title ??
          "새로운 시스템 알림이 있어요.",
      ).replace(/\\n/g, "\n");
    default:
      return "";
  }
}

function getAnnouncementTitle(item: NotificationItem) {
  return typeof item.payload?.title === "string" &&
    item.payload.title.trim().length > 0
    ? item.payload.title.trim()
    : "공지사항";
}

function getAnnouncementBody(item: NotificationItem) {
  const value =
    item.payload?.inAppBody ?? item.payload?.body ?? item.payload?.message;
  return typeof value === "string" ? value.replace(/\\n/g, "\n").trim() : "";
}

function getNotificationText(item: NotificationItem) {
  const nickname = item.actorNickname ?? "알림";
  const commentText =
    typeof item.payload?.comment === "string" &&
    item.payload.comment.trim().length > 0
      ? item.payload.comment.trim()
      : null;

  switch (item.type as NotificationType) {
    case "LIKED_ON_COLLECTION":
      return `${nickname}님이 나의 새록을 좋아해요.`;
    case "COMMENTED_ON_COLLECTION":
      return commentText
        ? `${nickname}님이 나의 새록에 댓글을 남겼어요. "${commentText}"`
        : `${nickname}님이 나의 새록에 댓글을 남겼어요.`;
    case "REPLIED_TO_COMMENT":
    case "REPLIED_ON_COMMENT":
      return `${nickname}님이 나의 댓글에 답글을 남겼어요.`;
    case "BIRD_ID_SUGGESTED_ON_COLLECTION":
    case "SUGGESTED_BIRD_ID_ON_COLLECTION":
      return "두근두근! 새로운 의견이 공유됐어요. 확인해볼까요?";
    case "BIRD_ID_ADOPTED_ON_COLLECTION":
      return "새 이름 제안이 채택되었어요.";
    case "SYSTEM_PUBLISHED_ANNOUNCEMENT":
      return `${getAnnouncementTitle(item)} ${getAnnouncementBody(item)}`;
    case "COMMENTED_ON_FREE_BOARD_POST":
      return commentText
        ? `${nickname}님이 나의 자유게시판 글에 댓글을 남겼어요. "${commentText}"`
        : `${nickname}님이 나의 자유게시판 글에 댓글을 남겼어요.`;
    case "REPLIED_TO_FREE_BOARD_COMMENT":
      return commentText
        ? `${nickname}님이 나의 자유게시판 댓글에 답글을 남겼어요. "${commentText}"`
        : `${nickname}님이 나의 자유게시판 댓글에 답글을 남겼어요.`;
    case "SYSTEM_ADMIN_MESSAGE":
      return getSystemNoticeMessage(item);
    default:
      return `${nickname}님으로부터 새로운 알림이 왔어요.`;
  }
}

function getNotificationBodyText(item: NotificationItem) {
  const commentText =
    typeof item.payload?.comment === "string" &&
    item.payload.comment.trim().length > 0
      ? item.payload.comment.trim()
      : null;

  switch (item.type as NotificationType) {
    case "LIKED_ON_COLLECTION":
      return "님이 나의 새록을 좋아해요.";
    case "COMMENTED_ON_COLLECTION":
      return commentText
        ? `님이 나의 새록에 댓글을 남겼어요. "${commentText}"`
        : "님이 나의 새록에 댓글을 남겼어요.";
    case "REPLIED_TO_COMMENT":
    case "REPLIED_ON_COMMENT":
      return "님이 나의 댓글에 답글을 남겼어요.";
    case "COMMENTED_ON_FREE_BOARD_POST":
      return commentText
        ? `님이 나의 자유게시판 글에 댓글을 남겼어요. "${commentText}"`
        : "님이 나의 자유게시판 글에 댓글을 남겼어요.";
    case "REPLIED_TO_FREE_BOARD_COMMENT":
      return commentText
        ? `님이 나의 자유게시판 댓글에 답글을 남겼어요. "${commentText}"`
        : "님이 나의 자유게시판 댓글에 답글을 남겼어요.";
    default:
      return null;
  }
}

function NotificationUnreadDot({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.unreadDot, style]} />;
}

function NotificationOptionMenu({
  visible,
  onClose,
  onReadAll,
  onDeleteAll,
}: {
  visible: boolean;
  onClose: () => void;
  onReadAll: () => void;
  onDeleteAll: () => void;
}) {
  const scale = React.useRef(new Animated.Value(0.92)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      scale.setValue(0.92);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    scale.setValue(0.92);
    opacity.setValue(0);
  }, [opacity, scale, visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.optionDim} onPress={onClose}>
        <Animated.View
          style={[styles.optionMenu, { opacity, transform: [{ scale }] }]}
        >
          <TouchableOpacity
            style={styles.optionRow}
            onPress={onReadAll}
            pressedOpacity={0.75}
          >
            <Text style={styles.optionText}>모두 읽음</Text>
          </TouchableOpacity>
          <View style={styles.optionDivider} />
          <TouchableOpacity
            style={styles.optionRow}
            onPress={onDeleteAll}
            pressedOpacity={0.75}
          >
            <Text style={styles.optionDeleteText}>모두 삭제</Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function NotificationRow({
  item,
  onPress,
  onDelete,
  openRowId,
  setOpenRowId,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onDelete: (item: NotificationItem) => void;
  openRowId: number | null;
  setOpenRowId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const isSystemNotice = isSystemNoticeType(item.type);
  const isAnnouncementNotice = isAnnouncementNoticeType(item.type);
  const imageUrl =
    isSystemNotice || isAnnouncementNotice ? null : getPayloadImage(item.payload);
  const collectionId = getCollectionId(item.payload);
  const isRead = item.isRead;
  const nickname = item.actorNickname ?? "알림";
  const bodyText =
    isSystemNotice || isAnnouncementNotice ? null : getNotificationBodyText(item);
  const textColor = isRead ? "#979797" : "#0D0D0D";
  const translateX = React.useRef(new Animated.Value(0)).current;
  const currentXRef = React.useRef(0);
  const swipeTriggeredRef = React.useRef(false);
  const actionOpacity = translateX.interpolate({
    inputRange: [-SWIPE_REVEAL_WIDTH, -rs(24), 0],
    outputRange: [1, 0.7, 0],
    extrapolate: "clamp",
  });
  const actionScale = translateX.interpolate({
    inputRange: [-SWIPE_REVEAL_WIDTH, -rs(24), 0],
    outputRange: [1, 0.96, 0.9],
    extrapolate: "clamp",
  });

  React.useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentXRef.current = value;
    });
    return () => {
      translateX.removeListener(id);
    };
  }, [translateX]);

  const animateTo = React.useCallback(
    (toValue: number) => {
      Animated.timing(translateX, {
        toValue,
        duration: 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [translateX],
  );

  React.useEffect(() => {
    if (openRowId !== item.id && currentXRef.current !== 0) {
      animateTo(0);
    }
  }, [animateTo, item.id, openRowId]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          const absDx = Math.abs(gesture.dx);
          const absDy = Math.abs(gesture.dy);
          if (absDx < SWIPE_TRIGGER_THRESHOLD || absDx <= absDy) return false;
          return gesture.dx < 0 || currentXRef.current < 0;
        },
        onPanResponderGrant: () => {
          swipeTriggeredRef.current = false;
          if (openRowId !== item.id) {
            setOpenRowId(item.id);
          }
        },
        onPanResponderMove: (_, gesture) => {
          if (swipeTriggeredRef.current) return;
          if (gesture.dx <= -SWIPE_TRIGGER_THRESHOLD) {
            swipeTriggeredRef.current = true;
            setOpenRowId(item.id);
            animateTo(-SWIPE_REVEAL_WIDTH);
          }
        },
        onPanResponderRelease: () => {
          if (swipeTriggeredRef.current) return;
          setOpenRowId((prev) => (prev === item.id ? null : prev));
          animateTo(0);
        },
        onPanResponderTerminate: () => {
          swipeTriggeredRef.current = false;
          setOpenRowId((prev) => (prev === item.id ? null : prev));
          animateTo(0);
        },
      }),
    [animateTo, item.id, openRowId, setOpenRowId, translateX],
  );

  return (
    <View style={styles.rowShell}>
      <View style={styles.rowActionArea}>
        <Animated.View
          style={[
            styles.deleteActionAnimWrap,
            { opacity: actionOpacity, transform: [{ scale: actionScale }] },
          ]}
        >
          <Pressable
            style={styles.deleteActionBtn}
            onPress={() => onDelete(item)}
          >
            <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
              <Path
                d="M8 7.2V6.4C8 5.2799 8 4.71984 8.21799 4.29202C8.40973 3.9157 8.71569 3.60973 9.09202 3.41799C9.51984 3.2 10.0799 3.2 11.2 3.2H12.8C13.9201 3.2 14.4802 3.2 14.908 3.41799C15.2843 3.60973 15.5903 3.9157 15.782 4.29202C16 4.71984 16 5.2799 16 6.4V7.2M18.4 7.2V17.28C18.4 18.6241 18.4 19.2962 18.1384 19.8096C17.9083 20.2612 17.5412 20.6283 17.0896 20.8584C16.5762 21.12 15.9041 21.12 14.56 21.12H9.44C8.09587 21.12 7.42381 21.12 6.91042 20.8584C6.45878 20.6283 6.09174 20.2612 5.86159 19.8096C5.6 19.2962 5.6 18.6241 5.6 17.28V7.2M3.2 7.2H20.8M10.4 10.4V16.8M13.6 10.4V16.8"
                stroke="#FEFEFE"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.rowForeground, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Pressable
          style={[styles.card, isSystemNotice && styles.systemCard]}
          onPress={() => {
            if (currentXRef.current < 0) {
              setOpenRowId(null);
              animateTo(0);
              return;
            }
            onPress(item);
          }}
        >
          {!isRead ? (
            <NotificationUnreadDot style={styles.saerokUnreadDot} />
          ) : null}

          <View style={styles.avatarWrap}>
            {isSystemNotice || isAnnouncementNotice ? (
              <View style={styles.noticeAvatar}>
                <Svg
                  width={rs(13)}
                  height={rs(14)}
                  viewBox="0 0 13 14"
                  fill="none"
                >
                  <Path
                    d="M0.325639 13.6719C-0.956402 8.42494 1.62129 2.83724 6.7509 0.467928C8.10429 -0.198881 9.85576 -0.147805 10.859 0.587739C11.9136 1.25715 12.6073 2.67238 12.4863 3.90723C12.4414 5.14707 11.5648 6.459 10.4302 6.98441C9.09503 7.68577 7.34026 7.68403 6.31428 6.98033C6.60587 7.57344 6.68981 8.37805 6.48171 9.10007C6.27361 9.8221 5.77349 10.4615 5.20972 10.8128C4.65979 11.1849 3.86837 11.3843 3.11691 11.2855C2.36544 11.1868 1.65393 10.7898 1.22102 10.2884C0.80396 11.1917 0.409535 12.6821 0.325639 13.6719Z"
                    fill="#FEFEFE"
                  />
                </Svg>
              </View>
            ) : (
              <Image
                source={{ uri: item.actorProfileImageUrl ?? "" }}
                style={styles.actorAvatar}
              />
            )}
          </View>

          <View style={styles.body}>
            {isSystemNotice || isAnnouncementNotice ? (
              <View
                style={[
                  styles.noticeBadge,
                  isRead ? styles.noticeBadgeRead : styles.noticeBadgeUnread,
                ]}
              >
                <Text style={styles.noticeBadgeText}>
                  {isAnnouncementNotice ? "공지사항" : getSystemNoticeLabel(item)}
                </Text>
              </View>
            ) : null}

            <Text
              style={[
                styles.message,
                isSystemNotice && styles.systemMessage,
                { color: textColor },
              ]}
              numberOfLines={isSystemNotice ? 3 : 2}
            >
              {isAnnouncementNotice ? (
                <>
                  <Text style={[styles.messageNickname, { color: textColor }]}>
                    {getAnnouncementTitle(item)}
                  </Text>
                  {getAnnouncementBody(item)
                    ? ` ${getAnnouncementBody(item)}`
                    : ""}
                </>
              ) : bodyText ? (
                <>
                  <Text style={[styles.messageNickname, { color: textColor }]}>
                    {nickname}
                  </Text>
                  {bodyText}
                </>
              ) : (
                getNotificationText(item)
              )}
            </Text>

            <Text style={[styles.time, { color: "#979797" }]}>
              {formatElapsed(item.createdAt)}
            </Text>
          </View>

          {imageUrl || collectionId ? (
            <View style={styles.thumbWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbFallback} />
              )}
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

function SystemNotificationRow({
  item,
  expanded,
  onPress,
}: {
  item: NotificationItem;
  expanded: boolean;
  onPress: (item: NotificationItem) => void;
}) {
  const isRead = item.isRead;
  const message = getSystemNoticeMessage(item);
  const rotateValue = React.useRef(
    new Animated.Value(expanded ? 1 : 0),
  ).current;
  const expandValue = React.useRef(
    new Animated.Value(expanded ? 1 : 0),
  ).current;
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["90deg", "-90deg"],
  });
  const messageMaxHeight = expandValue.interpolate({
    inputRange: [0, 1],
    outputRange: [rfs(20), rs(260)],
  });
  const messageOpacity = expandValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateValue, {
        toValue: expanded ? 1 : 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(expandValue, {
        toValue: expanded ? 1 : 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [expanded, expandValue, rotateValue]);

  return (
    <TouchableOpacity
      style={styles.systemNoticeCard}
      onPress={() => onPress(item)}
      pressedOpacity={0.85}
    >
      {!isRead ? (
        <NotificationUnreadDot style={styles.systemUnreadDot} />
      ) : null}

      <View style={styles.noticeAvatar}>
        <Svg width={rs(13)} height={rs(14)} viewBox="0 0 13 14" fill="none">
          <Path
            d="M0.325639 13.6719C-0.956402 8.42494 1.62129 2.83724 6.7509 0.467928C8.10429 -0.198881 9.85576 -0.147805 10.859 0.587739C11.9136 1.25715 12.6073 2.67238 12.4863 3.90723C12.4414 5.14707 11.5648 6.459 10.4302 6.98441C9.09503 7.68577 7.34026 7.68403 6.31428 6.98033C6.60587 7.57344 6.68981 8.37805 6.48171 9.10007C6.27361 9.8221 5.77349 10.4615 5.20972 10.8128C4.65979 11.1849 3.86837 11.3843 3.11691 11.2855C2.36544 11.1868 1.65393 10.7898 1.22102 10.2884C0.80396 11.1917 0.409535 12.6821 0.325639 13.6719Z"
            fill="#FEFEFE"
          />
        </Svg>
      </View>

      <View style={styles.systemNoticeBody}>
        <View style={styles.systemNoticeBadge}>
          <Text style={styles.systemNoticeBadgeText}>새록 운영팀</Text>
        </View>
        <Animated.View
          style={[
            styles.systemNoticeMessageClip,
            { maxHeight: messageMaxHeight, opacity: messageOpacity },
          ]}
        >
          <Text
            style={styles.systemNoticeMessage}
            numberOfLines={expanded ? undefined : 1}
            ellipsizeMode="tail"
          >
            {message}
          </Text>
        </Animated.View>
        <Text style={styles.time}>{formatElapsed(item.createdAt)}</Text>
      </View>

      <View style={styles.systemExpandButton}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={rs(17)} height={rs(17)} viewBox="0 0 17 17" fill="none">
            <Path
              d="M6.5 4.5L10.5 8.5L6.5 12.5"
              stroke="#979797"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

export default function SaerokNotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [openRowId, setOpenRowId] = useState<number | null>(null);
  const [deletedTargetModalVisible, setDeletedTargetModalVisible] =
    useState(false);
  const [expandedSystemIds, setExpandedSystemIds] = useState<Set<number>>(
    () => new Set(),
  );

  const load = useCallback(async () => {
    if (USE_NOTIFICATION_DUMMY_DATA) {
      setItems(getDummyNotifications());
      return;
    }

    try {
      const res = await fetchNotificationsApi();
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const unreadExists = useMemo(
    () => items.some((item) => !item.isRead),
    [items],
  );
  const systemItems = useMemo(
    () => items.filter((item) => isSystemNoticeType(item.type)),
    [items],
  );
  const saerokItems = useMemo(
    () => items.filter((item) => !isSystemNoticeType(item.type)),
    [items],
  );

  const markItemRead = useCallback(async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      if (!USE_NOTIFICATION_DUMMY_DATA) {
        await readNotificationApi(item.id);
      }
      setItems((prev) =>
        prev.map((candidate) =>
          candidate.id === item.id ? { ...candidate, isRead: true } : candidate,
        ),
      );
    } catch {}
  }, []);

  const handlePressItem = useCallback(
    async (item: NotificationItem) => {
      await markItemRead(item);

      const collectionId = getCollectionId(item.payload);
      if (collectionId) {
        try {
          await fetchCollectionDetail(collectionId);
          const { openSaerokDetail } = require("@/lib/navigation");
          const initialSheet = getInitialSaerokSheet(item.type);
          openSaerokDetail(router, collectionId, {
            from: "notifications",
            extraParams: initialSheet ? { initialSheet } : undefined,
          });
        } catch (error) {
          if (isMissingTargetError(error)) {
            setDeletedTargetModalVisible(true);
            return;
          }
          console.log("[notifications] collection target check failed", error);
        }
        return;
      }

      const freeBoardPostId = getFreeBoardPostId(item.payload);
      if (freeBoardPostId) {
        try {
          await fetchFreeBoardPostDetailApi(freeBoardPostId);
          router.push(`/nest/freeboard-detail/${freeBoardPostId}` as any);
        } catch (error) {
          if (isMissingTargetError(error)) {
            setDeletedTargetModalVisible(true);
            return;
          }
          console.log("[notifications] free board target check failed", error);
        }
        return;
      }

      const announcementId = getAnnouncementId(item.payload);
      if (announcementId) {
        try {
          await getAnnouncementDetail(announcementId);
          router.push({
            pathname: "/announcement/[id]",
            params: { id: String(announcementId) },
          });
        } catch (error) {
          if (isMissingTargetError(error)) {
            setDeletedTargetModalVisible(true);
            return;
          }
          console.log("[notifications] announcement target check failed", error);
        }
      }
    },
    [markItemRead, router],
  );

  const handlePressSystemItem = useCallback(
    async (item: NotificationItem) => {
      setExpandedSystemIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
      await markItemRead(item);
    },
    [markItemRead],
  );

  const handleDeleteItem = useCallback(async (item: NotificationItem) => {
    try {
      if (!USE_NOTIFICATION_DUMMY_DATA) {
        await deleteNotificationApi(item.id);
      }
      setItems((prev) => prev.filter((candidate) => candidate.id !== item.id));
    } finally {
      setOpenRowId((prev) => (prev === item.id ? null : prev));
    }
  }, []);

  const handleReadAll = useCallback(async () => {
    try {
      if (!USE_NOTIFICATION_DUMMY_DATA) {
        await readAllNotificationsApi();
      }
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } finally {
      setMenuVisible(false);
    }
  }, []);

  const handleDeleteAll = useCallback(async () => {
    try {
      if (!USE_NOTIFICATION_DUMMY_DATA) {
        await deleteAllNotificationsApi();
      }
      setItems([]);
    } finally {
      setMenuVisible(false);
    }
  }, []);

  const handleDeleteSystemItems = useCallback(async () => {
    const targetIds = systemItems.map((item) => item.id);
    if (targetIds.length === 0) return;

    try {
      if (!USE_NOTIFICATION_DUMMY_DATA) {
        await Promise.all(targetIds.map((id) => deleteNotificationApi(id)));
      }
      setItems((prev) => prev.filter((item) => !targetIds.includes(item.id)));
      setExpandedSystemIds((prev) => {
        const next = new Set(prev);
        targetIds.forEach((id) => next.delete(id));
        return next;
      });
    } catch {}
  }, [systemItems]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.headerWrap}>
        <SimpleHeader title="알림" circleBackButton />
        <TouchableOpacity
          style={styles.headerMenuBtn}
          onPress={() => setMenuVisible(true)}
        >
          <View style={styles.headerMenuCircle}>
            <MoreVerticalIcon width={rs(24)} height={rs(24)} color="#0D0D0D" />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={saerokItems}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            {systemItems.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>운영팀</Text>
                  <TouchableOpacity
                    style={styles.systemClearButton}
                    onPress={handleDeleteSystemItems}
                    pressedOpacity={0.75}
                  >
                    <Text style={styles.systemClearButtonText}>지우기</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.sectionList}>
                  {systemItems.map((item) => (
                    <SystemNotificationRow
                      key={item.id}
                      item={item}
                      expanded={expandedSystemIds.has(item.id)}
                      onPress={handlePressSystemItem}
                    />
                  ))}
                </View>
              </View>
            ) : null}
            {saerokItems.length > 0 ? (
              <View
                style={[
                  styles.sectionHeaderRow,
                  systemItems.length > 0 && styles.saerokSectionHeader,
                ]}
              >
                <Text style={styles.sectionTitle}>새록</Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            onPress={handlePressItem}
            onDelete={handleDeleteItem}
            openRowId={openRowId}
            setOpenRowId={setOpenRowId}
          />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        extraData={`${unreadExists}-${openRowId ?? "none"}-${[
          ...expandedSystemIds,
        ].join(",")}-${systemItems
          .map((item) => `${item.id}:${item.isRead ? "1" : "0"}`)
          .join(",")}`}
        onScrollBeginDrag={() => setOpenRowId(null)}
      />

      <NotificationOptionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReadAll={handleReadAll}
        onDeleteAll={handleDeleteAll}
      />

      <AppAlertModal
        visible={deletedTargetModalVisible}
        mainText="삭제된 게시물입니다."
        buttonText="확인"
        onClose={() => setDeletedTargetModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerWrap: {
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  headerMenuBtn: {
    position: "absolute",
    right: rs(8),
    top: "50%",
    marginTop: -rs(36),
    width: rs(72),
    height: rs(72),
    alignItems: "center",
    justifyContent: "center",
  },
  headerMenuCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "rgba(254, 254, 254, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingTop: rs(8),
    paddingBottom: rs(24),
    gap: rs(7),
  },
  section: {
    marginBottom: 0,
  },
  sectionHeaderRow: {
    minHeight: rs(30),
    marginLeft: rs(16),
    marginRight: rs(9),
    marginBottom: rs(10),
    paddingLeft: rs(7),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  saerokSectionHeader: {
    marginTop: rs(21),
  },
  sectionTitle: {
    color: "#000000",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(20),
  },
  systemClearButton: {
    paddingHorizontal: rs(11),
    paddingVertical: rs(5),
    borderRadius: rs(230.769),
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  systemClearButtonText: {
    color: "#979797",
    fontFamily: font.semibold,
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(20),
  },
  sectionList: {
    gap: rs(7),
  },
  systemNoticeCard: {
    minHeight: rs(78),
    marginHorizontal: rs(9),
    borderRadius: rs(20),
    backgroundColor: "#F2F2F2",
    paddingLeft: rs(19),
    paddingRight: rs(12),
    paddingTop: rs(14),
    paddingBottom: rs(14),
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  systemNoticeBody: {
    flex: 1,
    paddingLeft: rs(6),
    paddingRight: rs(40),
  },
  systemNoticeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: rs(3),
    paddingVertical: rs(1),
    borderRadius: rs(5),
    marginBottom: rs(3),
    backgroundColor: "#979797",
    alignItems: "center",
    justifyContent: "center",
  },
  systemNoticeBadgeText: {
    color: "#FEFEFE",
    fontWeight: "700",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    textAlign: "center",
  },
  systemNoticeMessage: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  systemNoticeMessageClip: {
    overflow: "hidden",
  },
  systemExpandButton: {
    position: "absolute",
    top: rs(14),
    right: rs(18),
    width: rs(17),
    height: rs(17),
    alignItems: "center",
    justifyContent: "center",
  },
  rowShell: {
    minHeight: rs(78),
    position: "relative",
  },
  rowActionArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  deleteActionAnimWrap: {
    width: SWIPE_REVEAL_WIDTH,
    height: "100%",
  },
  deleteActionBtn: {
    width: SWIPE_ACTION_WIDTH,
    height: "100%",
    backgroundColor: "#D90000",
    borderTopLeftRadius: rs(20),
    borderBottomLeftRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },
  rowForeground: {},
  card: {
    minHeight: rs(78),
    marginHorizontal: rs(9),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#FEFEFE",
    paddingLeft: rs(19),
    paddingRight: rs(9),
    paddingTop: rs(10),
    paddingBottom: rs(9),
    flexDirection: "row",
    alignItems: "flex-start",
  },
  systemCard: {
    paddingRight: rs(18),
    paddingTop: rs(14),
    paddingBottom: rs(14),
  },
  unreadDot: {
    position: "absolute",
    width: rs(5),
    height: rs(5),
    borderRadius: rs(2.5),
    backgroundColor: "#4190FF",
  },
  saerokUnreadDot: {
    left: rs(9),
    top: rs(20),
  },
  systemUnreadDot: {
    left: rs(9),
    top: rs(24),
  },
  avatarWrap: {},
  noticeAvatar: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(20),
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
    backgroundColor: "#4190FF",
    alignItems: "center",
    justifyContent: "center",
  },
  actorAvatar: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(20),
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
  },
  body: {
    flex: 1,
    paddingLeft: rs(6),
    paddingRight: rs(9),
  },
  noticeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: rs(3),
    paddingVertical: rs(1),
    borderRadius: rs(5),
    marginBottom: rs(3),
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBadgeUnread: {
    backgroundColor: "#F7BE65",
  },
  noticeBadgeRead: {
    backgroundColor: "#DAE0DE",
  },
  noticeBadgeText: {
    color: "#FEFEFE",
    fontWeight: "700",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    textAlign: "center",
  },
  message: {
    fontWeight: "400",
    fontSize: rfs(15),
    lineHeight: rfs(20),
  },
  messageNickname: {
    fontWeight: "600",
  },
  systemMessage: {
    fontWeight: "600",
    fontSize: rfs(15),
    lineHeight: rfs(20),
  },
  time: {
    marginTop: rs(3),
    color: "#979797",
    fontWeight: "400",
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  thumbWrap: {
    width: rs(60),
    alignItems: "flex-end",
    paddingTop: rs(-1),
  },
  thumb: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(12),
  },
  thumbFallback: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(12),
    backgroundColor: "#F2F2F2",
  },
  optionDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: rs(92),
    paddingRight: rs(24),
  },
  optionMenu: {
    width: rs(108),
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  optionRow: {
    height: rs(48),
    alignItems: "center",
    justifyContent: "center",
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  optionText: {
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(20),
  },
  optionDeleteText: {
    color: "#FF5A5A",
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(20),
  },
});
