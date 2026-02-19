import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { rfs, rs } from "@/theme";

export type CommentBoxProps = {
  commentId: number;
  userId: number;
  nickname: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: CommentBoxProps[];
  onDelete: (commentId: number) => Promise<void> | void;
  headerCount: number;
};

export default function CommentModal({
  visible,
  onClose,
  items,
  onDelete,
  headerCount,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.dim} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.topBar}>
          <Text style={styles.title}>댓글</Text>
          <Text style={styles.count}>{headerCount}</Text>

          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
          >
            <Text style={styles.closeText}>X</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {items.length ? (
            items.map((c) => (
              <View key={c.commentId} style={styles.item}>
                <View style={styles.itemHead}>
                  <Text style={styles.nickname}>{c.nickname}</Text>
                  {c.isMine ? (
                    <Pressable
                      onPress={() => onDelete(c.commentId)}
                      style={styles.deleteBtn}
                      accessibilityRole="button"
                    >
                      <Text style={styles.deleteText}>삭제</Text>
                    </Pressable>
                  ) : null}
                </View>

                <Text style={styles.content}>{c.content}</Text>

                <Text style={styles.meta}>
                  {c.createdAt ? c.createdAt.slice(0, 10) : ""}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ paddingVertical: rs(16) }}>
              <Text style={{ color: "#6B7280" }}>아직 댓글이 없어요.</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
    height: "78%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rs(18),
    borderTopRightRadius: rs(18),
    overflow: "hidden",
  },
  topBar: {
    height: rs(56),
    paddingHorizontal: rs(16),
    borderBottomWidth: rs(1),
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  title: {
    fontSize: rfs(16),
    fontWeight: "900",
    color: "#111827",
  },
  count: {
    fontSize: rfs(14),
    fontWeight: "800",
    color: "#6B7280",
  },
  closeBtn: {
    marginLeft: "auto",
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: rfs(16),
    fontWeight: "900",
    color: "#111827",
  },
  list: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(14),
    gap: rs(12),
    paddingBottom: rs(120),
  },
  item: {
    backgroundColor: "#F9FAFB",
    borderRadius: rs(14),
    paddingHorizontal: rs(12),
    paddingVertical: rs(12),
  },
  itemHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rs(10),
    marginBottom: rs(6),
  },
  nickname: {
    fontSize: rfs(13),
    fontWeight: "900",
    color: "#111827",
  },
  deleteBtn: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
    borderRadius: rs(10),
    backgroundColor: "#FEE2E2",
  },
  deleteText: {
    color: "#B91C1C",
    fontWeight: "900",
    fontSize: rfs(12),
  },
  content: {
    color: "#111827",
    fontSize: rfs(14),
    lineHeight: rfs(20),
  },
  meta: {
    marginTop: rs(8),
    color: "#9CA3AF",
    fontSize: rfs(12),
  },
});
