import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  fetchCollectionLikeListApi,
  getCollectionLikeStatusApi,
  toggleCollectionLikeApi,
} from "@/services/api/collections";
import { rfs, rs } from "@/theme";

type Props = {
  collectionId: number;
};

export default function CollectionLikeButton({ collectionId }: Props) {
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
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
    } catch {}
  };

  return (
    <Pressable
      onPress={onToggle}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? "좋아요 취소" : "좋아요"}
    >
      <View style={styles.row}>
        <Text style={[styles.icon, isLiked ? styles.heartOn : styles.heartOff]}>
          ♥
        </Text>
        <Text style={styles.count}>{likeCount.current}</Text>
      </View>
    </Pressable>
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
  icon: {
    fontSize: rfs(18),
    fontWeight: "900",
  },
  heartOn: {
    color: "#EF4444",
  },
  heartOff: {
    color: "#111827",
  },
  count: {
    color: "#111827",
    fontSize: rfs(14),
    fontWeight: "800",
  },
});
