import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  Keyboard,
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import CommentIcon from "@/assets/icon/saerok/CommentIcon";
import MoreVerticalIcon from "@/assets/icon/saerok/MoreVerticalIcon";
import SimpleHeader from "@/components/common/SimpleHeader";
import AnimatedModalContent from "@/components/common/AnimatedModalContent";
import ProfileAvatar from "@/components/my/ProfileAvatar";
import FreeBoardComposeSheet from "@/components/nest/FreeBoardComposeSheet";
import CommentInputBar from "@/components/saerok/CommentInputBar";
import { useAuth } from "@/hooks/useAuth";
import {
  createFreeBoardCommentApi,
  deleteFreeBoardCommentApi,
  deleteFreeBoardPostApi,
  fetchFreeBoardCommentsApi,
  fetchFreeBoardPostDetailApi,
  type FreeBoardComment,
  type FreeBoardPostDetail,
  updateFreeBoardCommentApi,
  updateFreeBoardPostApi,
} from "@/services/api/community";
import { font, rfs, rs } from "@/theme";

const OPTION_MENU_WIDTH = 100;
const OPTION_ROW_HEIGHT = 48;
const TAB_BAR_HEIGHT = rs(60);
const INPUT_BAR_HEIGHT = rs(80);

type OptionTarget =
  | {
      kind: "post";
      postId: number;
      content: string;
    }
  | {
      kind: "comment";
      commentId: number;
      content: string;
    };

type ReplySelection = {
  activeId: number;
  parentId: number;
  nickname: string;
};

type CommentBlockProps = {
  item: FreeBoardComment;
  currentNickname?: string | null;
  postAuthorNickname?: string | null;
  isReply?: boolean;
  isReplyActive: boolean;
  onCaptureRef: (commentId: number, node: View | null) => void;
  onLayoutCard: (commentId: number, y: number) => void;
  onSelectReply: (selection: ReplySelection) => void;
  onOpenMenu: (event: GestureResponderEvent, target: OptionTarget) => void;
};

function formatElapsed(dateString?: string | null) {
  if (!dateString) return "";
  const time = new Date(dateString).getTime();
  if (!Number.isFinite(time)) return "";

  const diff = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  return `${Math.floor(diff / day)}일 전`;
}

function isMineByFallback(
  item: { isMine: boolean; nickname: string },
  currentNickname?: string | null,
) {
  return (
    item.isMine ||
    (!!currentNickname?.trim() &&
      currentNickname.trim() === item.nickname.trim())
  );
}

function OptionMenu({
  visible,
  anchorX,
  anchorY,
  isCommentOnly,
  onClose,
  onEdit,
  onDelete,
}: {
  visible: boolean;
  anchorX: number;
  anchorY: number;
  isCommentOnly?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
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
            {!isCommentOnly ? (
              <>
                <Pressable style={styles.optionRow} onPress={onEdit}>
                  <Text style={styles.optionText}>수정하기</Text>
                </Pressable>
                <View style={styles.optionDivider} />
              </>
            ) : null}
            <Pressable style={styles.optionRow} onPress={onDelete}>
              <Text style={styles.optionText}>삭제하기</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function CommentBlock({
  item,
  currentNickname,
  postAuthorNickname,
  isReply = false,
  isReplyActive,
  onCaptureRef,
  onLayoutCard,
  onSelectReply,
  onOpenMenu,
}: CommentBlockProps) {
  const router = useRouter();
  const avatarUrl = item.profileImageUrl || item.thumbnailProfileImageUrl;
  const [avatarFailed, setAvatarFailed] = useState(false);
  const canManage = isMineByFallback(item, currentNickname);
  const replyParentId = item.parentId ?? item.commentId;
  const isPostAuthor =
    !!postAuthorNickname?.trim() &&
    postAuthorNickname.trim() === item.nickname.trim();

  return (
    <View
      ref={(node) => onCaptureRef(item.commentId, node)}
      onLayout={(event: LayoutChangeEvent) =>
        onLayoutCard(item.commentId, event.nativeEvent.layout.y)
      }
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
            parentId: replyParentId,
            nickname: item.nickname,
          })
        }
      >
        <View style={styles.commentTopRow}>
          <Pressable
            style={styles.commentAvatarWrap}
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
                style={styles.commentAvatar}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <ProfileAvatar
                size={rs(25)}
                imageUrl={null}
                seed={item.nickname || String(item.userId)}
              />
            )}
          </Pressable>

          <View style={styles.commentMain}>
            <View style={styles.commentHeaderRow}>
              <View style={styles.commentHeaderLeft}>
                <Text style={styles.commentNickname}>{item.nickname}</Text>
                {isPostAuthor ? (
                  <View style={styles.authorBadge}>
                    <Text style={styles.authorBadgeText}>글쓴이</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.commentHeaderRight}>
                {!isReply ? (
                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() =>
                      onSelectReply({
                        activeId: item.commentId,
                        parentId: item.commentId,
                        nickname: item.nickname,
                      })
                    }
                  >
                    <Text style={styles.replyActionText}>답글달기</Text>
                  </Pressable>
                ) : null}

                {canManage ? (
                  <Pressable
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={(event) => {
                      event.stopPropagation();
                      onOpenMenu(event, {
                        kind: "comment",
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
                  </Pressable>
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

export default function FreeBoardDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const commentRefsRef = useRef<Record<number, View | null>>({});
  const commentLayoutsRef = useRef<Record<number, number>>({});
  const previousScrollYRef = useRef<number | null>(null);
  const currentScrollYRef = useRef(0);
  const replySelectionRef = useRef<ReplySelection | null>(null);
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const numericPostId = Number(postId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<FreeBoardPostDetail | null>(null);
  const [comments, setComments] = useState<FreeBoardComment[]>([]);
  const [postAvatarFailed, setPostAvatarFailed] = useState(false);
  const [optionVisible, setOptionVisible] = useState(false);
  const [optionAnchor, setOptionAnchor] = useState({ x: 0, y: 0 });
  const [optionTarget, setOptionTarget] = useState<OptionTarget | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editText, setEditText] = useState("");
  const [postEditMounted, setPostEditMounted] = useState(false);
  const [postEditOpen, setPostEditOpen] = useState(false);
  const [postEditText, setPostEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const commentSubmittingRef = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [replySelection, setReplySelection] = useState<ReplySelection | null>(
    null,
  );
  const replyScrollSpacer = Math.floor(Dimensions.get("window").height * 0.45);

  const inputDockBottom = keyboardHeight > 0 ? keyboardHeight : 0;
  const inputDockPaddingBottom =
    keyboardHeight > 0
      ? rs(24)
      : Math.max(rs(24), insets.bottom + TAB_BAR_HEIGHT - rs(25));
  const extraVisiblePadding = rs(76);
  const contentBottomPadding =
    INPUT_BAR_HEIGHT +
    (keyboardHeight > 0 ? keyboardHeight : 0) +
    (replySelection ? replyScrollSpacer : 0);

  useEffect(() => {
    replySelectionRef.current = replySelection;
  }, [replySelection]);

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(numericPostId)) {
      setError("게시글 정보를 찾을 수 없어요.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [detail, commentRes] = await Promise.all([
        fetchFreeBoardPostDetailApi(numericPostId),
        fetchFreeBoardCommentsApi(numericPostId, { page: 1, size: 50 }),
      ]);

      setPost(detail);
      setComments(commentRes.items ?? []);
      setPostAvatarFailed(false);
    } catch {
      setError("게시글을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [numericPostId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    const showEvt = Keyboard.addListener("keyboardDidShow", (e) => {
      const end = e.endCoordinates;
      const byHeight = end?.height ?? 0;
      const windowHeight = Dimensions.get("window").height;
      const byScreenYOnWindow =
        typeof end?.screenY === "number"
          ? Math.max(0, windowHeight - end.screenY)
          : 0;
      setKeyboardHeight(Math.max(byHeight, byScreenYOnWindow));
      if (replySelectionRef.current) {
        requestAnimationFrame(() => {
          const node =
            commentRefsRef.current[replySelectionRef.current!.activeId];
          node?.measureInWindow?.((_, y, __, h) => {
            const visibleBottom =
              windowHeight -
              Math.max(byHeight, byScreenYOnWindow) -
              extraVisiblePadding;
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
            scrollRef.current?.scrollTo({
              y: prevScrollY,
              animated: true,
            });
          });
        }
        previousScrollYRef.current = null;
      }
    });

    return () => {
      showEvt.remove();
      hideEvt.remove();
    };
  }, [extraVisiblePadding]);

  const showPostOptions = useMemo(() => {
    if (!post) return false;
    return isMineByFallback(post, user?.nickname);
  }, [post, user?.nickname]);

  const hasComments = (post?.commentCount ?? 0) > 0;
  const showRightMeta = hasComments || showPostOptions;
  const postAvatarUrl = post?.profileImageUrl || post?.thumbnailProfileImageUrl;

  const cancelReplyMode = useCallback(() => {
    const prevScrollY = previousScrollYRef.current;
    setReplySelection(null);
    inputRef.current?.blur();
    Keyboard.dismiss();
    if (prevScrollY != null) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: prevScrollY,
          animated: true,
        });
      });
    }
    previousScrollYRef.current = null;
  }, []);

  const activateReplyMode = useCallback((selection: ReplySelection) => {
    if (previousScrollYRef.current == null) {
      previousScrollYRef.current = currentScrollYRef.current;
    }
    setReplySelection(selection);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const openMenu = (event: GestureResponderEvent, target: OptionTarget) => {
    const { pageX, pageY } = event.nativeEvent;
    setOptionAnchor({ x: pageX, y: pageY });
    setOptionTarget(target);
    setOptionVisible(true);
  };

  const handleEdit = () => {
    if (!optionTarget) return;
    const target = optionTarget;
    setOptionVisible(false);
    InteractionManager.runAfterInteractions(() => {
      if (target.kind === "post") {
        setPostEditText(target.content);
        setPostEditMounted(true);
        setPostEditOpen(true);
        return;
      }

      setEditText(target.content);
      setEditVisible(true);
    });
  };

  const closePostEditSheet = useCallback(() => {
    Keyboard.dismiss();
    setPostEditOpen(false);
  }, []);

  const handlePostEditClosed = useCallback(() => {
    setPostEditMounted(false);
    setPostEditText("");
  }, []);

  const handleDelete = () => {
    setOptionVisible(false);
    setDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!optionTarget) return;

    setDeleteVisible(false);

    if (optionTarget.kind === "post") {
      await deleteFreeBoardPostApi(optionTarget.postId);
      router.back();
      return;
    }

    await deleteFreeBoardCommentApi(numericPostId, optionTarget.commentId);
    await loadDetail();
  };

  const submitEdit = async () => {
    if (!optionTarget || !editText.trim() || saving) return;

    try {
      setSaving(true);

      if (optionTarget.kind === "post") {
        await updateFreeBoardPostApi(optionTarget.postId, {
          content: editText.trim(),
        });
      } else {
        await updateFreeBoardCommentApi(numericPostId, optionTarget.commentId, {
          content: editText.trim(),
        });
      }

      setEditVisible(false);
      await loadDetail();
    } finally {
      setSaving(false);
    }
  };

  const submitPostEdit = async () => {
    if (!optionTarget || optionTarget.kind !== "post") return;
    const trimmed = postEditText.trim();
    if (!trimmed || saving) return;

    try {
      setSaving(true);
      await updateFreeBoardPostApi(optionTarget.postId, {
        content: trimmed,
      });
      closePostEditSheet();
      await loadDetail();
    } finally {
      setSaving(false);
    }
  };

  const submitComment = async (value: string) => {
    if (!Number.isFinite(numericPostId) || commentSubmittingRef.current) return;

    try {
      commentSubmittingRef.current = true;

      await createFreeBoardCommentApi(numericPostId, {
        content: value,
        parentId: replySelection?.parentId,
      });

      const prevScrollY = previousScrollYRef.current;
      setReplySelection(null);
      inputRef.current?.blur();
      Keyboard.dismiss();
      if (prevScrollY != null) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({
            y: prevScrollY,
            animated: true,
          });
        });
      }
      previousScrollYRef.current = null;
      await loadDetail();
    } finally {
      commentSubmittingRef.current = false;
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.headerWrap}>
          <SimpleHeader title="자유게시판" circleBackButton />
        </View>

        <Pressable
          style={[
            styles.bodyArea,
            { marginBottom: insets.bottom + TAB_BAR_HEIGHT },
          ]}
          onPress={cancelReplyMode}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              {
                paddingBottom: contentBottomPadding,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={(event) => {
              currentScrollYRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          >
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#4190FF" />
              </View>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : post ? (
              <>
                <View style={styles.postCard}>
                  <View style={styles.metaRow}>
                    <View style={styles.userRow}>
                      <Pressable
                        style={styles.avatarWrap}
                        disabled={!post.userId}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        onPress={() => {
                          if (!post.userId) return;
                          router.push(`/saerok/profile/${post.userId}`);
                        }}
                      >
                        {postAvatarUrl && !postAvatarFailed ? (
                          <Image
                            source={{ uri: postAvatarUrl }}
                            style={styles.avatarImage}
                            onError={() => setPostAvatarFailed(true)}
                          />
                        ) : (
                          <ProfileAvatar
                            size={rs(25)}
                            imageUrl={null}
                            seed={post.nickname || String(post.userId)}
                          />
                        )}
                      </Pressable>

                      <Text style={styles.nickname}>{post.nickname}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.time}>
                        {formatElapsed(post.createdAt)}
                      </Text>
                    </View>

                    {showRightMeta ? (
                      <View style={styles.rightMeta}>
                        {hasComments ? (
                          <View style={styles.commentWrap}>
                            <CommentIcon
                              width={rs(15)}
                              height={rs(15)}
                              color="#DAE0DE"
                            />
                            <Text style={styles.commentCount}>
                              {post.commentCount}
                            </Text>
                          </View>
                        ) : null}

                        {showPostOptions ? (
                          <Pressable
                            hitSlop={{
                              top: 16,
                              bottom: 16,
                              left: 16,
                              right: 16,
                            }}
                            onPress={(event) =>
                              openMenu(event, {
                                kind: "post",
                                postId: post.postId,
                                content: post.content,
                              })
                            }
                          >
                            <MoreVerticalIcon
                              width={rs(17)}
                              height={rs(17)}
                              color="#979797"
                            />
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.contentText}>{post.content}</Text>
                </View>

                <View
                  style={[
                    styles.commentsSection,
                    comments.length === 0
                      ? styles.commentsSectionEmpty
                      : styles.commentsSectionFilled,
                  ]}
                >
                  <View style={styles.commentsHeader}>
                    <Text style={styles.commentsTitle}>댓글</Text>
                    <Text style={styles.commentsCount}>
                      {post.commentCount ?? 0}
                    </Text>
                  </View>

                  {comments.map((item) => (
                    <View key={item.commentId} style={styles.commentGroup}>
                      <CommentBlock
                        item={item}
                        currentNickname={user?.nickname}
                        postAuthorNickname={post.nickname}
                        isReplyActive={
                          replySelection?.activeId === item.commentId
                        }
                        onCaptureRef={(commentId, node) => {
                          commentRefsRef.current[commentId] = node;
                        }}
                        onLayoutCard={(commentId, y) => {
                          commentLayoutsRef.current[commentId] = y;
                        }}
                        onSelectReply={activateReplyMode}
                        onOpenMenu={openMenu}
                      />

                      {item.replies?.map((reply) => (
                        <CommentBlock
                          key={reply.commentId}
                          item={reply}
                          currentNickname={user?.nickname}
                          postAuthorNickname={post.nickname}
                          isReply
                          isReplyActive={
                            replySelection?.activeId === reply.commentId
                          }
                          onCaptureRef={(commentId, node) => {
                            commentRefsRef.current[commentId] = node;
                          }}
                          onLayoutCard={(commentId, y) => {
                            commentLayoutsRef.current[commentId] = y;
                          }}
                          onSelectReply={activateReplyMode}
                          onOpenMenu={openMenu}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>
        </Pressable>
      </SafeAreaView>

      <View
        pointerEvents="box-none"
        style={[styles.inputDock, { bottom: inputDockBottom }]}
      >
        <View
          style={[
            styles.inputDockInner,
            { paddingBottom: inputDockPaddingBottom },
          ]}
        >
          <CommentInputBar
            ref={inputRef}
            placeholder={
              replySelection
                ? `${replySelection.nickname}님에게 답글 남기기`
                : `${post?.nickname || "사용자"}님에게 댓글 남기기`
            }
            onSubmit={submitComment}
          />
        </View>
      </View>

      <OptionMenu
        visible={optionVisible}
        anchorX={optionAnchor.x}
        anchorY={optionAnchor.y}
        isCommentOnly={optionTarget?.kind === "comment"}
        onClose={() => setOptionVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FreeBoardComposeSheet
        mounted={postEditMounted}
        open={postEditOpen}
        text={postEditText}
        onChangeText={setPostEditText}
        onClose={closePostEditSheet}
        onSubmit={submitPostEdit}
        submitting={saving}
        nickname={post?.nickname?.trim() || "사용자"}
        avatarUrl={postAvatarUrl || null}
        onClosed={handlePostEditClosed}
        submitLabel="수정하기"
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
                <Text style={styles.alertMainText}>
                  {optionTarget?.kind === "post"
                    ? "게시물을 삭제하시겠어요?"
                    : "댓글을 삭제하시겠어요?"}
                </Text>
                <Text style={styles.alertSubText}>
                  {optionTarget?.kind === "post"
                    ? "삭제된 게시물은 복구할 수 없어요."
                    : "삭제된 댓글은 복구할 수 없어요."}
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

      <Modal
        transparent
        visible={editVisible}
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <Pressable
          style={styles.alertBackdrop}
          onPress={() => {
            Keyboard.dismiss();
            setEditVisible(false);
          }}
        >
          <AnimatedModalContent visible={editVisible}>
            <Pressable
              style={[styles.alertCard, styles.editCard]}
              onPress={() => {}}
            >
              <Text style={styles.editTitle}>
                {optionTarget?.kind === "post" ? "게시물 수정" : "댓글 수정"}
              </Text>

              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                scrollEnabled
                autoFocus
                textAlignVertical="top"
                style={styles.editInput}
              />

              <View style={styles.alertBtnRow}>
                <Pressable
                  style={styles.alertLeftBtn}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={styles.alertLeftBtnText}>취소</Text>
                </Pressable>

                <Pressable style={styles.alertRightBtn} onPress={submitEdit}>
                  <Text style={styles.alertRightBtnText}>
                    {saving ? "저장 중" : "수정하기"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </AnimatedModalContent>
        </Pressable>
      </Modal>
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  bodyArea: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  content: {
    flexGrow: 1,
    backgroundColor: "#F2F2F2",
  },
  loadingWrap: {
    paddingVertical: rs(24),
    alignItems: "center",
  },
  errorText: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(20),
    color: "#D90000",
    fontSize: rfs(13),
    lineHeight: rfs(16),
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(24),
    paddingVertical: rs(13),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    minWidth: 0,
  },
  avatarWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(12.5),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  nickname: {
    color: "#111111",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "700",
  },
  metaDot: {
    width: rs(2),
    height: rs(2),
    borderRadius: rs(999),
    backgroundColor: "#979797",
  },
  time: {
    color: "#8E8E8E",
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  rightMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    marginLeft: rs(12),
  },
  commentWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(3),
  },
  commentCount: {
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  contentText: {
    marginTop: rs(12),
    paddingLeft: rs(30),
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(25),
    fontWeight: "400",
  },
  commentsSection: {
    backgroundColor: "#F2F2F2",
    paddingTop: rs(17),
    paddingHorizontal: rs(24),
  },
  commentsSectionEmpty: {
    paddingBottom: rs(20),
  },
  commentsSectionFilled: {
    paddingBottom: 0,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: rs(1),
    gap: rs(5),
    marginBottom: rs(12),
  },
  commentsTitle: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "600",
  },
  commentsCount: {
    color: "#4190FF",
    fontSize: rfs(15),
    lineHeight: rfs(18),
    fontWeight: "600",
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
    backgroundColor: "#f2f2f2",
    marginLeft: rs(24),
  },
  commentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(8),
  },
  commentAvatarWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(12.5),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  commentAvatar: {
    width: "100%",
    height: "100%",
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
    zIndex: 20,
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
  editCard: {
    alignItems: "stretch",
    maxHeight: "82%",
  },
  editTitle: {
    textAlign: "center",
    color: "#111827",
    fontSize: rfs(16),
    lineHeight: rfs(20),
    fontWeight: "700",
  },
  editInput: {
    minHeight: rs(140),
    maxHeight: rs(320),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: rs(14),
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(22),
  },
});
