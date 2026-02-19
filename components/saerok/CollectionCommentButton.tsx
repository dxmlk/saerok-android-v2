import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  createCollectionCommentApi,
  deleteCollectionCommentApi,
  fetchCollectionCommentListApi,
  getCollectionCommentCountApi,
} from "@/services/api/collections";
import CommentModal, {
  CommentBoxProps,
} from "@/components/saerok/CommentModal";
import CommentInputBar from "@/components/saerok/CommentInputBar";
import { rfs, rs } from "@/theme";

type Props = {
  collectionId: number;
};

export default function CollectionCommentButton({ collectionId }: Props) {
  const commentCount = useRef(0);
  const [commentList, setCommentList] = useState<CommentBoxProps[]>([]);
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  const refresh = async () => {
    if (!collectionId) return;

    try {
      const items = await fetchCollectionCommentListApi(collectionId);
      setCommentList(items as any);
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
        accessibilityLabel="댓글 보기"
      >
        <View style={styles.row}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.count}>{commentCount.current}</Text>
        </View>
      </Pressable>

      <CommentModal
        visible={open}
        onClose={() => setOpen(false)}
        items={commentList}
        onDelete={handleDelete}
        headerCount={commentCount.current}
      />

      {open ? (
        <View style={styles.inputDock}>
          <CommentInputBar
            placeholder="댓글을 남겨보세요"
            onSubmit={handleSubmit}
            onClose={() => setOpen(false)}
          />
        </View>
      ) : null}
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
  icon: {
    fontSize: rfs(18),
    fontWeight: "900",
    color: "#111827",
  },
  count: {
    color: "#111827",
    fontSize: rfs(14),
    fontWeight: "800",
  },
  inputDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});
