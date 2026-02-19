import { CollectionItem, fetchMyCollections } from "@/services/api/collections";
import { useAuth } from "@/hooks/useAuth";
import EmptyState from "@/components/common/EmptyState";
import LoginIcon from "@/assets/icon/button/LoginIcon";
import { font } from "@/theme/typography";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { rfs, rs } from "@/theme";

type RatioMap = Record<number, number>;

export default function SaerokList({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const ratioRef = useRef<RatioMap>({});
  const [, forceRerender] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setItems([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetchMyCollections();
        setItems(res);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey, isLoggedIn]);

  useEffect(() => {
    if (!items.length) return;

    let cancelled = false;

    const targets = items
      .filter((it) => !!it.imageUrl && !ratioRef.current[it.collectionId])
      .map((it) => ({ id: it.collectionId, uri: it.imageUrl! }));

    if (!targets.length) return;

    targets.forEach(({ id, uri }) => {
      Image.getSize(
        uri,
        (w, h) => {
          if (cancelled) return;
          if (!w || !h) return;

          ratioRef.current[id] = w / h;
          forceRerender((v) => v + 1);
        },
        () => {},
      );
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const leftItems = useMemo(
    () => items.filter((_, idx) => idx % 2 === 0),
    [items],
  );
  const rightItems = useMemo(
    () => items.filter((_, idx) => idx % 2 === 1),
    [items],
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.loginWrap}>
        <Text style={styles.loginUpper}>로그인이 필요한 서비스예요</Text>
        <Text style={styles.loginLower}>
          로그인하고 탐조 기록을 시작해보세요!
        </Text>

        <View style={styles.loginBtnRow}>
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.push("/login")}
          >
            <LoginIcon width={rs(24)} height={rs(24)} stroke="#FFFFFF" />
            <Text style={styles.loginBtnText}>로그인 / 회원가입</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ paddingVertical: rs(24) }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={{ paddingHorizontal: rs(24), paddingVertical: rs(16) }}>
        <EmptyState
          bgColor="white"
          upperText="아직 발견한 새가 없어요!"
          lowerText="오른쪽 깃털 버튼을 눌러 탐조 기록을 시작해보세요."
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.masonryRow}>
        <View style={styles.col}>
          {leftItems.map((item) => {
            const ratio = ratioRef.current[item.collectionId];
            return (
              <Pressable
                key={item.collectionId}
                onPress={() =>
                  router.push({
                    pathname: "/saerok/[collectionId]",
                    params: { collectionId: String(item.collectionId) },
                  })
                }
                style={styles.card}
              >
                <Image
                  source={{ uri: item.imageUrl ?? "" }}
                  resizeMode="cover"
                  style={[
                    styles.imgBase,
                    ratio ? { aspectRatio: ratio } : styles.imgFallbackSquare,
                  ]}
                />
                <Text numberOfLines={1} style={styles.caption}>
                  {item.koreanName ?? "이름 모를 새"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.col}>
          {rightItems.map((item) => {
            const ratio = ratioRef.current[item.collectionId];
            return (
              <Pressable
                key={item.collectionId}
                onPress={() =>
                  router.push({
                    pathname: "/saerok/[collectionId]",
                    params: { collectionId: String(item.collectionId) },
                  })
                }
                style={styles.card}
              >
                <Image
                  source={{ uri: item.imageUrl ?? "" }}
                  resizeMode="cover"
                  style={[
                    styles.imgBase,
                    ratio ? { aspectRatio: ratio } : styles.imgFallbackSquare,
                  ]}
                />
                <Text numberOfLines={1} style={styles.caption}>
                  {item.koreanName ?? "이름 모를 새"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginWrap: {
    marginTop: rs(10),
    paddingHorizontal: rs(24),
    paddingVertical: rs(16),
    backgroundColor: "#FFFFFF",
    gap: rs(5),
  },
  loginUpper: {
    fontFamily: font.haru,
    fontSize: rfs(20),
    color: "#111827",
  },
  loginLower: {
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(18),
    color: "#6B7280",
  },
  loginBtnRow: {
    marginTop: rs(88),
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtn: {
    height: rs(44),
    paddingHorizontal: rs(18),
    borderRadius: rs(30.5),
    backgroundColor: "#4190FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(6),
  },
  loginBtnText: {
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(18),
    color: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: rs(24),
  },
  masonryRow: {
    marginTop: rs(12),
    flexDirection: "row",
    gap: rs(9),
    justifyContent: "center",
  },
  col: {
    flex: 1,
    flexDirection: "column",
    gap: rs(12),
  },

  card: {
    width: "100%",
  },
  imgBase: {
    width: "100%",
    borderRadius: rs(10),
    backgroundColor: "#F3F4F6",
  },
  imgFallbackSquare: {
    aspectRatio: 1,
  },
  caption: {
    marginTop: rs(8),
    fontFamily: font.regular,
    fontSize: rfs(12),
    color: "#111827",
  },
});
