import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  createCollectionCommentApi,
  deleteCollectionCommentApi,
  fetchCollectionCommentListApi,
  getCollectionCommentCountApi,
} from "@/services/api/collections";
import CommentModal, { CommentBoxProps } from "@/components/saerok/CommentModal";
import { rfs, rs } from "@/theme";
import CommentIcon from "@/assets/icon/saerok/CommentIcon";

type Props = {
  collectionId: number;
  authorNickname?: string | null;
};

const KOR = {
  commentToAuthorSuffix: "\uB2D8\uC5D0\uAC8C \uB313\uAE00 \uB0A8\uAE30\uAE30",
  commentPlaceholder: "\uB313\uAE00 \uB0A8\uAE30\uAE30",
} as const;

export default function CollectionCommentButton({
  collectionId,
  authorNickname,
}: Props) {
  const commentCount = useRef(0);
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
    try {
      await createCollectionCommentApi(collectionId, content);
      await refresh();
    } catch {}
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteCollectionCommentApi(collectionId, commentId);
      await refresh();
    } catch {}
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.btn}
        accessibilityRole="button"
        accessibilityLabel="\uB313\uAE00 \uBCF4\uAE30"
      >
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <CommentIcon width={rs(20)} height={rs(20)} color="#0D0D0D" />
          </View>
          <Text style={styles.count}>{commentCount.current}</Text>
        </View>
      </Pressable>

      <CommentModal
        visible={open}
        onClose={() => setOpen(false)}
        items={commentList}
        onDelete={handleDelete}
        headerCount={commentCount.current}
        onSubmit={handleSubmit}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: rs(40),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    color: "#0D0D0D",
    fontSize: rfs(18),
    fontWeight: "400",
    lineHeight: rfs(22),
  },
});
