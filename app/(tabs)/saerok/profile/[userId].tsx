import BracketIcon from "@/assets/icon/common/BracketIcon";
import EmptyState from "@/components/common/EmptyState";
import ProfileAvatar from "@/components/my/ProfileAvatar";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfileApi,
  ProfileCollectionItem,
} from "@/services/api/profile";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RatioMap = Record<number, number>;

type ProfileData = Awaited<ReturnType<typeof getUserProfileApi>>;

type GridEntry =
  | { type: "count"; count: number }
  | { type: "collection"; item: ProfileCollectionItem };

function getJoinedDays(joinedDate?: string | null) {
  if (!joinedDate) return 0;
  const diff = Date.now() - new Date(joinedDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const idNum = Number(userId);
  const { isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState(false);
  const [userMissingModalOpen, setUserMissingModalOpen] = useState(false);

  const ratioRef = useRef<RatioMap>({});
  const [, forceRerender] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getUserProfileApi(idNum, {
          authenticated: isLoggedIn,
        });
        if (cancelled) return;
        setData(res);
      } catch (e: any) {
        if (cancelled) return;
        setData(null);
        setError(true);
        setUserMissingModalOpen(e?.response?.status === 404);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idNum, isLoggedIn]);

  useEffect(() => {
    if (!data?.collections?.length) return;
    let cancelled = false;
    const targets = data.collections
      .filter((it) => !!it.imageUrl && !ratioRef.current[it.collectionId])
      .map((it) => ({ id: it.collectionId, uri: it.imageUrl! }));
    if (!targets.length) return;

    targets.forEach(({ id, uri }) => {
      Image.getSize(
        uri,
        (w, h) => {
          if (cancelled || !w || !h) return;
          ratioRef.current[id] = w / h;
          forceRerender((v) => v + 1);
        },
        () => {},
      );
    });

    return () => {
      cancelled = true;
    };
  }, [data?.collections]);

  const joinedDays = useMemo(
    () => getJoinedDays(data?.joinedDate),
    [data?.joinedDate],
  );

  const entries = useMemo<GridEntry[]>(() => {
    if (!data) return [];
    return [
      { type: "count", count: data.collectionCount },
      ...data.collections.map(
        (item): GridEntry => ({ type: "collection", item }),
      ),
    ];
  }, [data]);

  const leftEntries = useMemo(
    () => entries.filter((_, i) => i % 2 === 0),
    [entries],
  );
  const rightEntries = useMemo(
    () => entries.filter((_, i) => i % 2 === 1),
    [entries],
  );

  const renderEntry = (entry: GridEntry, key: string) => {
    if (entry.type === "count") {
      return (
        <View key={key} style={[styles.card, styles.countCard]}>
          <Text style={styles.countNumber}>{entry.count}</Text>
          <Text style={styles.countText}>
            {"\ub9c8\ub9ac\uac00 \ub2f4\uaca8\uc788\uc5b4\uc694"}
          </Text>
        </View>
      );
    }

    const item = entry.item;
    return (
      <Pressable
        key={key}
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/saerok/[collectionId]",
            params: { collectionId: String(item.collectionId) },
          })
        }
      >
        <Image
          source={{ uri: item.imageUrl ?? item.thumbnailImageUrl ?? "" }}
          resizeMode="cover"
          style={[
            styles.imgBase,
            ratioRef.current[item.collectionId]
              ? { aspectRatio: ratioRef.current[item.collectionId] }
              : styles.imgFallbackSquare,
          ]}
        />
        <Text numberOfLines={1} style={styles.caption}>
          {item.birdKoreanName ?? "\uc774\ub984 \ubaa8\ub97c \uc0c8"}
        </Text>
      </Pressable>
    );
  };

  const handleCloseUserMissingModal = () => {
    setUserMissingModalOpen(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <Pressable style={styles.floatingBack} onPress={() => router.back()}>
        <BracketIcon width={rs(17)} height={rs(17)} color="#0D0D0D" />
      </Pressable>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error || !data ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {
              "\uc720\uc800 \uc815\ubcf4\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc5b4\uc694."
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <ProfileAvatar
              size={rs(49)}
              imageUrl={data.thumbnailProfileImageUrl || data.profileImageUrl}
              seed={(data.nickname || "user").toLowerCase()}
              cacheKey={
                data.thumbnailProfileImageUrl || data.profileImageUrl || ""
              }
            />

            <View style={styles.headerTextCol}>
              <Text style={styles.headerNameLine}>
                <Text style={styles.headerNameBlue}>{data.nickname}</Text>
                <Text style={styles.headerNameSuffix}>{"님의 새록"}</Text>
              </Text>
              <Text style={styles.headerDays}>
                {`새록과 함께한 지 +${joinedDays}일`}
              </Text>
            </View>
          </View>

          {!data.collections.length ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                bgColor="gray"
                upperText={"아직 이곳엔 새록이 없어요."}
                lowerText={"시간이 지나면 새들이 생길지도 몰라요."}
              />
            </View>
          ) : (
            <View style={styles.masonryRow}>
              <View style={styles.col}>
                {leftEntries.map((entry, idx) =>
                  renderEntry(entry, `L-${idx}-${entry.type}`),
                )}
              </View>
              <View style={styles.col}>
                {rightEntries.map((entry, idx) =>
                  renderEntry(entry, `R-${idx}-${entry.type}`),
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        transparent
        animationType="fade"
        visible={userMissingModalOpen}
        onRequestClose={handleCloseUserMissingModal}
      >
        <View style={styles.userMissingBackdrop}>
          <View style={styles.userMissingCard}>
            <View style={styles.userMissingIconCircle}>
              <Text style={styles.userMissingIconText}>{"!"}</Text>
            </View>

            <Pressable
              style={styles.userMissingCloseBtn}
              onPress={handleCloseUserMissingModal}
              hitSlop={12}
            >
              <Text style={styles.userMissingCloseText}>{"\u00d7"}</Text>
            </Pressable>

            <Text style={styles.userMissingTitle}>
              {"\uc0ac\uc6a9\uc790\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc5b4\uc694."}
            </Text>
            <Text style={styles.userMissingSub}>
              {"\ud0c8\ud1f4\ud55c \uc0ac\uc6a9\uc790"}
            </Text>

            <Pressable
              style={styles.userMissingConfirmBtn}
              onPress={handleCloseUserMissingModal}
            >
              <Text style={styles.userMissingConfirmText}>
                {"\ud655\uc778"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(14),
    textAlign: "center",
  },
  floatingBack: {
    position: "absolute",
    top: rs(24),
    left: rs(24),
    zIndex: 20,
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "rgba(254,254,254,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: rs(92),
    paddingBottom: rs(100),
  },
  headerBlock: {
    paddingHorizontal: rs(24),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
    marginBottom: rs(26),
  },
  headerTextCol: {
    flex: 1,
  },
  headerNameLine: {
    fontFamily: font.haru,
  },
  headerNameBlue: {
    color: "#4190FF",
    fontFamily: font.haru,
    fontSize: rfs(22),
    lineHeight: rfs(33),
  },
  headerNameSuffix: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(18),
    lineHeight: rfs(20),
  },
  headerDays: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(13),
    lineHeight: rfs(16),
  },
  emptyWrap: {
    paddingHorizontal: rs(24),
    minHeight: rs(360),
  },
  masonryRow: {
    paddingHorizontal: rs(9),
    flexDirection: "row",
    gap: rs(7),
    justifyContent: "center",
  },
  col: {
    flex: 1,
    flexDirection: "column",
    gap: rs(9),
    alignItems: "stretch",
  },
  card: {
    width: "100%",
    paddingTop: rs(5),
    paddingBottom: rs(8),
    paddingHorizontal: rs(5),
    alignItems: "center",
    gap: rs(10),
    borderRadius: rs(20),
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  countCard: {
    borderWidth: 1,
    paddingTop: rs(17),
    paddingLeft: rs(19),
    paddingRight: rs(20),
    paddingBottom: rs(14),
    borderColor: "#4190FF",
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: rs(82),
  },
  countNumber: {
    color: "#4190FF",
    fontSize: rfs(40),
    fontWeight: "700",
    lineHeight: rfs(30),
  },
  countText: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
    marginLeft: rs(2),
  },
  imgBase: {
    width: "100%",
    borderTopLeftRadius: rs(15),
    borderTopRightRadius: rs(15),
    borderBottomLeftRadius: rs(5),
    borderBottomRightRadius: rs(5),
    backgroundColor: "#F3F4F6",
  },
  imgFallbackSquare: {
    aspectRatio: 1,
  },
  caption: {
    fontFamily: font.money,
    fontSize: rfs(13),
    lineHeight: rfs(14),
    color: "#000000",
    alignSelf: "flex-start",
    marginLeft: rs(7),
  },
  userMissingBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(35),
  },
  userMissingCard: {
    width: "100%",
    borderRadius: rs(20),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: rs(21),
    paddingBottom: rs(20),
    paddingHorizontal: rs(24),
  },
  userMissingIconCircle: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    borderWidth: rs(2),
    borderColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(16),
  },
  userMissingIconText: {
    color: "#91BFFF",
    fontSize: rfs(22),
    lineHeight: rfs(22),
    marginTop: -rs(1),
  },
  userMissingCloseBtn: {
    position: "absolute",
    top: rs(16),
    right: rs(16),
  },
  userMissingCloseText: {
    color: "#979797",
    fontSize: rfs(18),
    lineHeight: rfs(18),
  },
  userMissingTitle: {
    color: "#0D0D0D",
    textAlign: "center",
    fontFamily: font.semibold,
    fontSize: rfs(15),
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: rfs(18),
    marginBottom: rs(8),
  },
  userMissingSub: {
    color: "#979797",
    textAlign: "center",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: rfs(18),
    marginBottom: rs(18),
  },
  userMissingConfirmBtn: {
    minWidth: rs(120),
    maxWidth: "100%",
    height: rs(40),
    paddingHorizontal: rs(20),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  userMissingConfirmText: {
    color: "#FEFEFE",
    textAlign: "center",
    fontFamily: font.semibold,
    fontSize: rfs(15),
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: rfs(18),
  },
});
