import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  InteractionManager,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type GestureResponderEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import CommentIcon from "@/assets/icon/saerok/CommentIcon";
import {
  FreeBoardUploadErrorToast,
  FreeBoardUploadSuccessToast,
} from "@/components/common/AppToast";
import SimpleHeader from "@/components/common/SimpleHeader";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import AnimatedModalContent from "@/components/common/AnimatedModalContent";
import ProfileAvatar from "@/components/my/ProfileAvatar";
import NestWriteFab from "@/components/nest/NestWriteFab";
import { useAuth } from "@/hooks/useAuth";
import {
  FreeBoardPostSummary,
  createFreeBoardPostApi,
  deleteFreeBoardPostApi,
  fetchFreeBoardPostsApi,
  updateFreeBoardPostApi,
} from "@/services/api/community";
import { font } from "@/theme";
import { rfs, rs } from "@/theme/scale";

const LABEL_JUST_NOW = "방금 전";
const LABEL_MINUTES_AGO_SUFFIX = "분 전";
const LABEL_HOURS_AGO_SUFFIX = "시간 전";
const LABEL_DAYS_AGO_SUFFIX = "일 전";
const LABEL_FREEBOARD = "자유게시판";
const LABEL_NO_POSTS = "아직 자유게시판 글이 없어요.";
const LABEL_LOAD_ERROR = "자유게시판 글을 불러오지 못했어요.";
const LABEL_PLACEHOLDER = "자유롭게 글을 남겨보세요.";
const LABEL_SUBMIT = "게시하기";
const LABEL_EDIT = "수정하기";
const LABEL_DELETE = "삭제하기";
const LABEL_SUBMIT_FAILED_BODY = "자유게시판 글을 게시하지 못했어요.";
const LABEL_DEFAULT_USER = "사용자";
const CONTENT_PREVIEW_SUFFIX = " …더보기";
const COMPOSE_BUTTON_GAP = 17;
const OPTION_MENU_WIDTH = 100;
const OPTION_MENU_HEIGHT = 96;
const OPTION_ROW_HEIGHT = 48;
const OPTION_MENU_RADIUS = 14;
const OPTION_MENU_HORIZONTAL_PADDING = 4;
const OPTION_MENU_VERTICAL_OFFSET = 8;
const OPTION_MENU_SCREEN_MARGIN = 16;

function formatElapsed(dateString?: string | null) {
  if (!dateString) return "";

  const time = new Date(dateString).getTime();
  if (!Number.isFinite(time)) return "";

  const diff = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return LABEL_JUST_NOW;
  if (diff < hour) {
    return `${Math.floor(diff / minute)}${LABEL_MINUTES_AGO_SUFFIX}`;
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)}${LABEL_HOURS_AGO_SUFFIX}`;
  }
  return `${Math.floor(diff / day)}${LABEL_DAYS_AGO_SUFFIX}`;
}

function FreeBoardOptionIcon() {
  return (
    <Svg width={rs(17)} height={rs(17)} viewBox="0 0 17 17" fill="none">
      <Path
        d="M7.08203 3.8338C7.08203 3.63545 7.08203 3.53769 7.09336 3.45551C7.12942 3.19582 7.24924 2.955 7.43461 2.76961C7.61998 2.58422 7.86078 2.46439 8.12045 2.42833C8.2012 2.41699 8.30036 2.41699 8.4987 2.41699C8.69703 2.41699 8.79478 2.41699 8.87695 2.42833C9.13661 2.46439 9.37741 2.58422 9.56279 2.76961C9.74816 2.955 9.86797 3.19582 9.90403 3.45551C9.91536 3.53627 9.91536 3.63545 9.91536 3.8338C9.91536 4.03215 9.91536 4.12991 9.90403 4.21209C9.86797 4.47178 9.74816 4.7126 9.56279 4.89799C9.37741 5.08338 9.13661 5.20321 8.87695 5.23927C8.7962 5.25061 8.69703 5.25061 8.4987 5.25061C8.30036 5.25061 8.20261 5.25061 8.12045 5.23927C7.86078 5.20321 7.61998 5.08338 7.43461 4.89799C7.24924 4.7126 7.12942 4.47178 7.09336 4.21209C7.08203 4.13133 7.08203 4.03215 7.08203 3.8338ZM7.08203 8.50103C7.08203 8.30268 7.08203 8.20492 7.09336 8.12275C7.12942 7.86306 7.24924 7.62223 7.43461 7.43684C7.61998 7.25145 7.86078 7.13162 8.12045 7.09556C8.2012 7.08423 8.30036 7.08423 8.4987 7.08423C8.69703 7.08423 8.79478 7.08423 8.87695 7.09556C9.13661 7.13162 9.37741 7.25145 9.56279 7.43684C9.74816 7.62223 9.86797 7.86306 9.90403 8.12275C9.91536 8.2035 9.91536 8.30268 9.91536 8.50103C9.91536 8.69939 9.91536 8.79715 9.90403 8.87932C9.86797 9.13901 9.74816 9.37984 9.56279 9.56523C9.37741 9.75062 9.13661 9.87044 8.87695 9.90651C8.7962 9.91784 8.69703 9.91784 8.4987 9.91784C8.30036 9.91784 8.20261 9.91784 8.12045 9.90651C7.86078 9.87044 7.61998 9.75062 7.43461 9.56523C7.24924 9.37984 7.12942 9.13901 7.09336 8.87932C7.08203 8.79856 7.08203 8.69939 7.08203 8.50103ZM7.08203 13.1683C7.08203 12.9713 7.08203 12.8722 7.09336 12.79C7.12964 12.5308 7.24937 12.2904 7.43444 12.1053C7.6195 11.9202 7.85983 11.8005 8.11903 11.7642C8.20261 11.7529 8.30036 11.7529 8.49728 11.7529C8.6942 11.7529 8.79478 11.7529 8.87553 11.7642C9.13473 11.8005 9.37506 11.9202 9.56013 12.1053C9.74519 12.2904 9.86493 12.5308 9.9012 12.79C9.91253 12.8722 9.91253 12.9713 9.91253 13.1683C9.91253 13.3652 9.91253 13.4644 9.9012 13.5466C9.86493 13.8058 9.74519 14.0461 9.56013 14.2312C9.37506 14.4163 9.13473 14.536 8.87553 14.5723C8.79336 14.5837 8.6942 14.5837 8.49728 14.5837C8.30036 14.5837 8.2012 14.5837 8.11903 14.5723C7.85983 14.536 7.6195 14.4163 7.43444 14.2312C7.24937 14.0461 7.12964 13.8058 7.09336 13.5466C7.08203 13.4644 7.08203 13.3652 7.08203 13.1683Z"
        fill="#979797"
      />
    </Svg>
  );
}

type ContentPreviewState = {
  text: string;
  truncated: boolean;
};

function FreeBoardContentPreview({ content }: { content: string }) {
  const [preview, setPreview] = useState<ContentPreviewState | null>(null);

  return (
    <Text
      style={styles.rowContent}
      onTextLayout={(event) => {
        if (preview !== null) return;

        const lines = event.nativeEvent.lines ?? [];
        if (lines.length <= 4) {
          setPreview({ text: content, truncated: false });
          return;
        }

        const prefix = lines
          .slice(0, 3)
          .map((line) => line.text)
          .join("");
        const fourthLine = (lines[3]?.text ?? "").trimEnd();
        const trimCount = Math.max(4, CONTENT_PREVIEW_SUFFIX.length + 1);
        const shortenedFourthLine = fourthLine
          .slice(0, Math.max(0, fourthLine.length - trimCount))
          .trimEnd();

        setPreview({
          text: `${prefix}${shortenedFourthLine}`,
          truncated: true,
        });
      }}
    >
      {preview?.text ?? content}
      {preview?.truncated ? (
        <Text style={styles.rowContentPreviewSuffix}>
          {CONTENT_PREVIEW_SUFFIX}
        </Text>
      ) : null}
    </Text>
  );
}

function FreeBoardListRow({
  item,
  onPress,
  onPressOption,
  currentNickname,
}: {
  item: FreeBoardPostSummary;
  onPress: () => void;
  onPressOption: (
    item: FreeBoardPostSummary,
    event: GestureResponderEvent,
  ) => void;
  currentNickname?: string | null;
}) {
  const router = useRouter();
  const avatarUrl = item.profileImageUrl || item.thumbnailProfileImageUrl;
  const [avatarFailed, setAvatarFailed] = useState(false);
  const hasComments = (item.commentCount ?? 0) > 0;
  const normalizedCurrentNickname = currentNickname?.trim() || "";
  const normalizedItemNickname = item.nickname?.trim() || "";
  const showOptions =
    item.isMine === true ||
    (!!normalizedCurrentNickname &&
      normalizedCurrentNickname === normalizedItemNickname);
  const showRightMeta = hasComments || showOptions;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={styles.rowHeader}>
        <View style={styles.rowUser}>
          <Pressable
            style={styles.rowAvatarWrap}
            disabled={!item.userId}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={(event) => {
              event.stopPropagation();
              if (!item.userId) return;
              router.push(`/saerok/profile/${item.userId}`);
            }}
          >
            {avatarUrl && !avatarFailed ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.rowAvatarImage}
                resizeMode="cover"
                onError={() => {
                  setAvatarFailed(true);
                }}
              />
            ) : (
              <ProfileAvatar
                size={rs(25)}
                imageUrl={null}
                seed={item.nickname || String(item.userId)}
              />
            )}
          </Pressable>
          <View style={styles.rowUserText}>
            <Text style={styles.rowNickname} numberOfLines={1}>
              {item.nickname}
            </Text>
            <View style={styles.rowMetaDot} />
            <Text style={styles.rowTime} numberOfLines={1}>
              {formatElapsed(item.createdAt)}
            </Text>
          </View>
        </View>

        {showRightMeta ? (
          <View style={styles.rowRightMeta}>
            {hasComments ? (
              <View style={styles.rowCommentWrap}>
                <CommentIcon
                  width={rs(15)}
                  height={rs(15)}
                  color="#DAE0DE"
                  fillColor="#DAE0DE"
                />
                <Text style={styles.rowCommentCount}>{item.commentCount}</Text>
              </View>
            ) : null}
            {showOptions ? (
              <Pressable
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                style={styles.rowOptionButton}
                onPress={(event) => onPressOption(item, event)}
              >
                <FreeBoardOptionIcon />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <FreeBoardContentPreview content={item.content} />
    </TouchableOpacity>
  );
}

type OptionMenuProps = {
  visible: boolean;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function FreeBoardOptionMenu({
  visible,
  anchorX,
  anchorY,
  onClose,
  onEdit,
  onDelete,
}: OptionMenuProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const menuWidth = rs(OPTION_MENU_WIDTH);
  const estimatedMenuHeight = rs(OPTION_MENU_HEIGHT);
  const horizontalPadding = rs(OPTION_MENU_HORIZONTAL_PADDING);
  const menuLeft = Math.min(
    Math.max(
      horizontalPadding,
      anchorX - menuWidth + rs(OPTION_MENU_VERTICAL_OFFSET),
    ),
    screenWidth - horizontalPadding - menuWidth,
  );
  const preferredTop = anchorY + rs(OPTION_MENU_VERTICAL_OFFSET);
  const maxTop =
    screenHeight -
    insets.bottom -
    estimatedMenuHeight -
    rs(OPTION_MENU_SCREEN_MARGIN);
  const menuTop = Math.max(
    insets.top + rs(OPTION_MENU_VERTICAL_OFFSET),
    Math.min(preferredTop, maxTop),
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mounted) return;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 140,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 120,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMounted(false);
    });
  }, [mounted, opacityAnim, scaleAnim, visible]);

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.optionMenuOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.optionMenuCard,
            {
              left: menuLeft,
              top: menuTop,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable style={styles.optionTouchBlock} onPress={() => {}}>
            <Pressable style={styles.optionRow} onPress={onEdit}>
              <Text style={styles.optionRowText}>{LABEL_EDIT}</Text>
            </Pressable>
            <View style={styles.optionDivider} />
            <Pressable style={styles.optionRow} onPress={onDelete}>
              <Text style={styles.optionRowText}>{LABEL_DELETE}</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

type ComposeSheetProps = {
  mounted: boolean;
  open: boolean;
  text: string;
  onChangeText: (next: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  nickname: string;
  avatarUrl: string | null;
  onClosed: () => void;
};

function FreeBoardComposeSheet({
  mounted,
  open,
  text,
  onChangeText,
  onClose,
  onSubmit,
  submitting,
  nickname,
  avatarUrl,
  onClosed,
}: ComposeSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const sheetClosedY = Math.max(rs(420), screenHeight);
  const sheetAnim = useRef(new Animated.Value(sheetClosedY)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!mounted) {
      setKeyboardHeight(0);
      sheetAnim.setValue(sheetClosedY);
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const end = event.endCoordinates;
      const byHeight = end?.height ?? 0;
      const windowHeight = Dimensions.get("window").height;
      const byScreenYOnWindow =
        typeof end?.screenY === "number"
          ? Math.max(0, windowHeight - end.screenY)
          : 0;
      setKeyboardHeight(Math.max(byHeight, byScreenYOnWindow));
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [mounted, screenHeight, sheetAnim, sheetClosedY]);

  const canSubmit = useMemo(
    () => text.trim().length > 0 && !submitting,
    [text, submitting],
  );

  useEffect(() => {
    if (!mounted) return;

    if (!open && !wasOpenRef.current) {
      sheetAnim.setValue(sheetClosedY);
      return;
    }

    Animated.timing(sheetAnim, {
      toValue: open ? 0 : sheetClosedY,
      duration: open ? 210 : 120,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (!open) onClosed();
    });

    wasOpenRef.current = open;

    if (!open) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => clearTimeout(timer);
  }, [mounted, onClosed, open, sheetAnim, sheetClosedY]);

  const focusInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    });
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onShow={focusInput}
      onRequestClose={onClose}
    >
      <Pressable style={styles.composeDim} onPress={onClose}>
        <Animated.View
          style={[
            styles.composeSheet,
            {
              height: screenHeight - insets.top,
              transform: [{ translateY: sheetAnim }],
            },
          ]}
        >
          <Pressable style={styles.composeTouchBlock} onPress={() => {}}>
            <View style={styles.composeHeader}>
              <Text style={styles.composeTitle}>{LABEL_FREEBOARD}</Text>
              <Pressable hitSlop={12} onPress={onClose}>
                <CloseLineIcon width={rs(14)} height={rs(14)} color="#979797" />
              </Pressable>
            </View>

            <View style={styles.composeDivider} />

            <View style={styles.composeProfileRow}>
              <View style={styles.composeAvatarWrap}>
                {avatarUrl && !avatarFailed ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.composeAvatarImage}
                    resizeMode="cover"
                    onError={() => {
                      setAvatarFailed(true);
                    }}
                  />
                ) : (
                  <ProfileAvatar
                    size={rs(25)}
                    imageUrl={null}
                    seed={nickname || "user"}
                  />
                )}
              </View>
              <Text style={styles.composeNickname}>{nickname}</Text>
            </View>

            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={onChangeText}
              placeholder={LABEL_PLACEHOLDER}
              placeholderTextColor="#B0B0B0"
              multiline
              autoFocus
              textAlignVertical="top"
              style={styles.composeInput}
              returnKeyType="default"
            />

            <View pointerEvents="box-none" style={styles.composeFooterOverlay}>
              <Animated.View
                style={[
                  styles.submitButtonDock,
                  { bottom: keyboardHeight > 0 ? keyboardHeight : 0 },
                ]}
              >
                <View
                  style={[
                    styles.submitButtonDockInner,
                    { paddingBottom: insets.bottom + rs(COMPOSE_BUTTON_GAP) },
                  ]}
                >
                  <Pressable
                    onPress={onSubmit}
                    disabled={!canSubmit}
                    style={[
                      styles.submitButtonInner,
                      !canSubmit && styles.submitButtonDisabled,
                    ]}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {LABEL_SUBMIT}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default function NestFreeBoardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    compose?: string;
    composeKey?: string;
  }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<FreeBoardPostSummary[]>([]);

  const [composeMounted, setComposeMounted] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [editingPost, setEditingPost] = useState<FreeBoardPostSummary | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const [optionVisible, setOptionVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FreeBoardPostSummary | null>(
    null,
  );
  const [deleteConfirmPost, setDeleteConfirmPost] =
    useState<FreeBoardPostSummary | null>(null);
  const [optionAnchor, setOptionAnchor] = useState({ x: 0, y: 0 });

  const [showUploadSuccessToast, setShowUploadSuccessToast] = useState(false);
  const [showUploadErrorToast, setShowUploadErrorToast] = useState(false);

  const handledComposeKeyRef = useRef<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFreeBoardPostsApi({ page: 1, size: 20 });
      setItems(res.items ?? []);
    } catch (e) {
      setError(LABEL_LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (params.compose !== "1") return;

    const composeKey = params.composeKey ?? "default";
    if (handledComposeKeyRef.current === composeKey) return;

    handledComposeKeyRef.current = composeKey;

    const interaction = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setEditingPost(null);
        setComposeText("");
        setComposeMounted(true);
        setComposeOpen(true);
      });
    });

    return () => {
      interaction.cancel();
    };
  }, [params.compose, params.composeKey]);

  const closeCompose = useCallback(() => {
    Keyboard.dismiss();
    setComposeOpen(false);
  }, []);

  const closeOptionSheet = useCallback(() => {
    setOptionVisible(false);
    setSelectedPost(null);
  }, []);

  const openOptionSheet = useCallback(
    (item: FreeBoardPostSummary, event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent;
      setOptionAnchor({ x: pageX, y: pageY });
      setSelectedPost(item);
      setOptionVisible(true);
    },
    [],
  );

  const openComposeForEdit = useCallback((item: FreeBoardPostSummary) => {
    setEditingPost(item);
    setComposeText(item.content);
    setComposeMounted(true);
    setComposeOpen(true);
  }, []);

  const handleEditPost = useCallback(() => {
    if (!selectedPost) return;

    const targetPost = selectedPost;
    closeOptionSheet();

    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        openComposeForEdit(targetPost);
      });
    });
  }, [closeOptionSheet, openComposeForEdit, selectedPost]);

  const handleDeletePost = useCallback(() => {
    if (!selectedPost) return;

    const targetPost = selectedPost;
    closeOptionSheet();
    setDeleteConfirmPost(targetPost);
  }, [closeOptionSheet, loadPosts, selectedPost]);

  const handleSubmit = async () => {
    const trimmed = composeText.trim();
    if (!trimmed || submitting || submitLockRef.current) return;

    try {
      submitLockRef.current = true;
      setSubmitting(true);

      if (editingPost) {
        await updateFreeBoardPostApi(editingPost.postId, { content: trimmed });
      } else {
        await createFreeBoardPostApi({ content: trimmed });
      }

      setComposeText("");
      setEditingPost(null);
      closeCompose();
      await loadPosts();

      if (!editingPost) {
        setShowUploadErrorToast(false);
        setShowUploadSuccessToast(true);
      }
    } catch {
      setShowUploadSuccessToast(false);
      setShowUploadErrorToast(true);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const confirmDeletePost = useCallback(async () => {
    const targetPost = deleteConfirmPost;
    setDeleteConfirmPost(null);
    if (!targetPost) return;

    try {
      await deleteFreeBoardPostApi(targetPost.postId);
      await loadPosts();
    } catch {
      setShowUploadSuccessToast(false);
      setShowUploadErrorToast(true);
    }
  }, [deleteConfirmPost, loadPosts]);

  const handleComposeClosed = useCallback(() => {
    setComposeMounted(false);
    setEditingPost(null);
    setComposeText("");
  }, []);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.headerWrap}>
          <SimpleHeader title={LABEL_FREEBOARD} circleBackButton />
        </View>

        <View style={styles.body}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#4190FF" />
              </View>
            ) : (
              <View style={styles.card}>
                {items.map((item, index) => (
                  <View key={item.postId}>
                    <FreeBoardListRow
                      item={item}
                      onPress={() =>
                        router.push(`/nest/freeboard-detail/${item.postId}`)
                      }
                      onPressOption={openOptionSheet}
                      currentNickname={user?.nickname}
                    />
                    {index < items.length - 1 ? (
                      <View style={styles.divider} />
                    ) : null}
                  </View>
                ))}

                {!items.length ? (
                  <Text style={styles.placeholder}>{LABEL_NO_POSTS}</Text>
                ) : null}
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>
        </View>
      </SafeAreaView>

      <NestWriteFab />

      <FreeBoardComposeSheet
        mounted={composeMounted}
        open={composeOpen}
        text={composeText}
        onChangeText={setComposeText}
        onClose={closeCompose}
        onSubmit={handleSubmit}
        submitting={submitting}
        nickname={user?.nickname?.trim() || LABEL_DEFAULT_USER}
        avatarUrl={user?.thumbnailImageUrl || user?.profileImageUrl || null}
        onClosed={handleComposeClosed}
      />

      <FreeBoardOptionMenu
        visible={optionVisible}
        anchorX={optionAnchor.x}
        anchorY={optionAnchor.y}
        onClose={closeOptionSheet}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />

      <Modal
        transparent
        visible={!!deleteConfirmPost}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmPost(null)}
      >
        <Pressable
          style={styles.alertBackdrop}
          onPress={() => setDeleteConfirmPost(null)}
        >
          <AnimatedModalContent visible={!!deleteConfirmPost}>
            <Pressable style={styles.alertCard} onPress={() => {}}>
            <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

            <View style={styles.alertTextBlock}>
              <Text style={styles.alertMainText}>게시물을 삭제하시겠어요?</Text>
              <Text style={styles.alertSubText}>
                삭제된 게시물은 복구할 수 없어요.
              </Text>
            </View>

            <View style={styles.alertBtnRow}>
              <Pressable
                style={styles.alertLeftBtn}
                onPress={() => setDeleteConfirmPost(null)}
              >
                <Text style={styles.alertLeftBtnText}>취소</Text>
              </Pressable>

              <Pressable
                style={styles.alertRightBtn}
                onPress={confirmDeletePost}
              >
                <Text style={styles.alertRightBtnText}>삭제하기</Text>
              </Pressable>
            </View>
            </Pressable>
          </AnimatedModalContent>
        </Pressable>
      </Modal>

      <FreeBoardUploadSuccessToast
        visible={showUploadSuccessToast}
        onClose={() => setShowUploadSuccessToast(false)}
      />
      <FreeBoardUploadErrorToast
        visible={showUploadErrorToast}
        onClose={() => setShowUploadErrorToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
  },
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingBottom: rs(104),
  },
  loadingWrap: {
    paddingVertical: rs(24),
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  row: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(18),
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowUser: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    minWidth: 0,
  },
  rowAvatarWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(12.5),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  rowAvatarImage: {
    width: "100%",
    height: "100%",
  },
  rowUserText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
    minWidth: 0,
  },
  rowNickname: {
    color: "#111111",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "700",
  },
  rowMetaDot: {
    width: rs(2),
    height: rs(2),
    borderRadius: rs(999),
    backgroundColor: "#979797",
  },
  rowTime: {
    color: "#8E8E8E",
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  rowRightMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    marginLeft: rs(12),
  },
  rowCommentWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(3),
  },
  rowCommentCount: {
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  rowOptionButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    marginTop: rs(3),
    paddingLeft: rs(30),
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(25),
  },
  rowContentPreviewSuffix: {
    color: "#979797",
  },
  placeholder: {
    textAlign: "center",
    color: "#979797",
    paddingVertical: rs(18),
    fontSize: rfs(14),
    lineHeight: rfs(18),
  },
  errorText: {
    marginTop: rs(10),
    color: "#D90000",
    fontSize: rfs(13),
    lineHeight: rfs(16),
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
  optionMenuOverlay: {
    flex: 1,
  },
  optionMenuCard: {
    position: "absolute",
    width: rs(OPTION_MENU_WIDTH),
    borderRadius: rs(OPTION_MENU_RADIUS),
    backgroundColor: "#FEFEFE",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: rs(10),
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  optionTouchBlock: {
    borderRadius: rs(OPTION_MENU_RADIUS),
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
  },
  optionRow: {
    height: rs(OPTION_ROW_HEIGHT),
    alignItems: "center",
    justifyContent: "center",
  },
  optionRowText: {
    color: "#0D0D0D",
    fontSize: rfs(16),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  composeDim: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  composeSheet: {
    backgroundColor: "#FEFEFE",
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    overflow: "hidden",
  },
  composeTouchBlock: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  composeHeader: {
    height: rs(62),
    paddingHorizontal: rs(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  composeTitle: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(18),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  composeDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  composeProfileRow: {
    marginTop: rs(13),
    marginHorizontal: rs(24),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
  },
  composeAvatarWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(12.5),
    overflow: "hidden",
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
  },
  composeAvatarImage: {
    width: "100%",
    height: "100%",
  },
  composeNickname: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontFamily: font.haru,
    lineHeight: rfs(22),
    fontWeight: "400",
  },
  composeInput: {
    flex: 1,
    marginTop: rs(3),
    marginHorizontal: rs(54),
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(25),
    fontWeight: "400",
  },
  composeFooterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  submitButtonDock: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 30,
  },
  submitButtonDockInner: {
    paddingHorizontal: rs(24),
    backgroundColor: "transparent",
  },
  submitButtonInner: {
    height: rs(53),
    borderRadius: rs(20),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#D4D7D6",
  },
  submitButtonText: {
    color: "#FEFEFE",
    fontSize: rfs(18),
    lineHeight: rfs(21),
    fontWeight: "500",
  },
});
