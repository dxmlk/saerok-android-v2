import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  createCollectionCommentApi,
  deleteCollectionCommentApi,
  fetchCollectionCommentListApi,
  getCollectionCommentCountApi,
  patchCollectionCommentApi,
} from "@/services/api/collections";
import CommentModal, {
  CommentBoxProps,
} from "@/components/saerok/CommentModal";
import { rfs, rs } from "@/theme";
import CommentIcon from "@/assets/icon/saerok/CommentIcon";
import TouchableOpacity from "@/components/common/TouchableOpacity";

type Props = {
  collectionId: number;
  authorNickname?: string | null;
  variant?: "default" | "floating" | "vertical";
};

const KOR = {
  commentToAuthorSuffix: "\uB2D8\uC5D0\uAC8C \uB313\uAE00 \uB0A8\uAE30\uAE30",
  commentPlaceholder: "\uB313\uAE00 \uB0A8\uAE30\uAE30",
} as const;

export default function CollectionCommentButton({
  collectionId,
  authorNickname,
  variant = "default",
}: Props) {
  const commentCount = useRef(0);
  const submitLockRef = useRef(false);
  const [commentList, setCommentList] = useState<CommentBoxProps[]>([]);
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  const refresh = async () => {
    if (!collectionId) return;

    try {
      const items = await fetchCollectionCommentListApi(collectionId);
      setCommentList(items as CommentBoxProps[]);
    } catch {}

    try {
      const count = await getCollectionCommentCountApi(collectionId);
      commentCount.current = count;
      force((v) => v + 1);
    } catch {}
  };

  useEffect(() => {
    if (!collectionId) return;
    refresh();
  }, [collectionId]);

  const handleSubmit = async (content: string) => {
    if (submitLockRef.current) return;
    try {
      submitLockRef.current = true;
      await createCollectionCommentApi(collectionId, content);
      await refresh();
    } catch {
    } finally {
      submitLockRef.current = false;
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteCollectionCommentApi(collectionId, commentId);
      await refresh();
    } catch {}
  };

  const handleUpdate = async (commentId: number, content: string) => {
    try {
      await patchCollectionCommentApi(collectionId, commentId, content);
      await refresh();
    } catch {}
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[
          styles.btn,
          variant === "floating" && styles.btnFloating,
          variant === "vertical" && styles.btnVertical,
        ]}
        accessibilityRole="button"
        accessibilityLabel="\uB313\uAE00 \uBCF4\uAE30"
      >
        <View
          style={[
            styles.row,
            variant === "floating" && styles.rowFloating,
            variant === "vertical" && styles.rowVertical,
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              variant === "floating" && styles.iconWrapFloating,
              variant === "vertical" && styles.iconWrapVertical,
            ]}
          >
            <CommentIcon
              width={variant === "vertical" ? rs(22) : rs(22)}
              height={variant === "vertical" ? rs(22) : rs(22)}
              color="#0D0D0D"
            />
          </View>
          <Text style={styles.count}>{commentCount.current}</Text>
        </View>
      </TouchableOpacity>

      <CommentModal
        visible={open}
        onClose={() => setOpen(false)}
        items={commentList}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        headerCount={commentCount.current}
        onSubmit={handleSubmit}
        authorNickname={authorNickname}
        inputPlaceholder={
          authorNickname
            ? `${authorNickname}${KOR.commentToAuthorSuffix}`
            : KOR.commentPlaceholder
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: rs(16),
    paddingLeft: rs(15),
    paddingRight: rs(19),
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
    gap: rs(10),
    justifyContent: "center",
  },
  rowVertical: {
    flexDirection: "column",
    alignItems: "center",
    gap: rs(6),
    justifyContent: "center",
  },
  iconWrap: {
    width: rs(40),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
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
});
