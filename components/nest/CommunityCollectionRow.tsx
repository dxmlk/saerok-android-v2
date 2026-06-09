import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import PopularFlameIcon from "@/assets/icon/nest/PopularFlameIcon";
import CommentIcon from "@/assets/icon/saerok/CommentIcon";
import HeartIcon from "@/assets/icon/saerok/HeartIcon";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import { CommunityCollectionSummary } from "@/services/api/community";
import { rfs, rs } from "@/theme/scale";
import { font } from "@/theme";

export type CommunityCollectionRowVariant = "recent" | "popular" | "pending";

function formatElapsed(dateString?: string | null) {
  if (!dateString) return "";

  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  return `${Math.floor(diff / day)}일 전`;
}

export default function CommunityCollectionRow({
  item,
  onPress,
}: {
  item: CommunityCollectionSummary;
  onPress: () => void;
  variant?: CommunityCollectionRowVariant;
}) {
  const locationText = item.locationAlias || item.address || "";
  const birdName = item.bird?.koreanName?.trim() || "이름 모를 새";
  const isUnknownBird = !item.bird?.koreanName?.trim();
  const note = item.note?.trim() || "메모가 없어요";
  const nickname = item.user?.nickname || "비둘기";
  const showPopularBadge = item.isPopular;

  const avatarCandidates = useMemo(
    () =>
      [item.user?.profileImageUrl, item.user?.thumbnailProfileImageUrl].filter(
        (value): value is string => !!value,
      ),
    [item.user?.profileImageUrl, item.user?.thumbnailProfileImageUrl],
  );

  const [avatarIndex, setAvatarIndex] = useState(0);

  useEffect(() => {
    setAvatarIndex(0);
  }, [avatarCandidates]);

  const avatarUri = avatarCandidates[avatarIndex] ?? null;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.leftCol}>
        <View style={styles.leftTop}>
          <View
            style={[
              styles.birdNameTag,
              isUnknownBird
                ? styles.birdNameTagUnknown
                : styles.birdNameTagKnown,
            ]}
          >
            <Text
              style={[
                styles.birdName,
                isUnknownBird
                  ? styles.birdNameTextUnknown
                  : styles.birdNameTextKnown,
              ]}
              numberOfLines={1}
            >
              {birdName}
            </Text>
          </View>

          <Text style={styles.note} numberOfLines={2}>
            {note}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText} numberOfLines={1}>
              {formatElapsed(item.createdAt)}
            </Text>
            <View style={styles.metaDot} />
            <Text
              style={[styles.metaText, styles.metaLocation]}
              numberOfLines={1}
            >
              {locationText}에서
            </Text>
          </View>
        </View>

        <View style={styles.userRow}>
          <View style={styles.userIconWrap}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.userAvatar}
                resizeMode="cover"
                onError={() => {
                  if (avatarIndex < avatarCandidates.length - 1) {
                    setAvatarIndex((prev) => prev + 1);
                    return;
                  }
                }}
              />
            ) : (
              <View style={styles.userAvatarFallback} />
            )}
          </View>
          <Text style={styles.userText} numberOfLines={1}>
            {nickname}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: item.thumbnailImageUrl || item.imageUrl || "" }}
            style={styles.thumb}
          />
          {showPopularBadge ? (
            <View style={styles.popularBadge}>
              <PopularFlameIcon
                width={rs(12)}
                height={rs(14)}
                color="#FEFEFE"
              />
            </View>
          ) : null}
        </View>

        <View style={styles.countRow}>
          <View style={styles.countItem}>
            <HeartIcon
              width={rs(15)}
              height={rs(15)}
              fillColor="#D9DEDA"
              strokeColor="#D9DEDA"
              strokeWidth={1.4}
            />
            <Text style={styles.countText}>{item.likeCount ?? 0}</Text>
          </View>
          <View style={styles.countItem}>
            <CommentIcon
              width={rs(15)}
              height={rs(15)}
              color="#D9DEDA"
              fillColor="#D9DEDA"
              strokeWidth={1.4}
            />
            <Text style={styles.countText}>{item.commentCount ?? 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const communityCollectionRowStyles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  placeholder: {
    textAlign: "center",
    color: "#979797",
    paddingVertical: rs(18),
    fontSize: rfs(14),
    lineHeight: rfs(18),
  },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: rs(10),
    paddingLeft: rs(22),
    paddingRight: rs(24),
    paddingTop: rs(13),
    paddingBottom: rs(8),
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  leftTop: {
    minWidth: 0,
  },
  birdNameTag: {
    alignSelf: "flex-start",
    paddingHorizontal: rs(3),
    paddingVertical: rs(1),
    borderRadius: rs(5),
    alignItems: "center",
    justifyContent: "center",
  },
  birdNameTagUnknown: {
    backgroundColor: "#F7BE65",
  },
  birdNameTagKnown: {
    backgroundColor: "#F2F2F2",
  },
  birdName: {
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "700",
  },
  birdNameTextUnknown: {
    color: "#FEFEFE",
  },
  birdNameTextKnown: {
    color: "#979797",
  },
  note: {
    marginTop: rs(7.5),
    fontFamily: font.money,
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(17),
    fontWeight: "400",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rs(5.5),
    gap: rs(7),
  },
  metaText: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  metaLocation: {
    flex: 1,
  },
  metaDot: {
    width: rs(2),
    height: rs(2),
    borderRadius: rs(999),
    backgroundColor: "#979797",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    marginBottom: rs(4),
  },
  userIconWrap: {
    width: rs(21),
    height: rs(21),
    borderRadius: rs(16),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  userAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: rs(16),
  },
  userAvatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: rs(16),
    backgroundColor: "#DDE7FF",
  },
  userText: {
    flex: 1,
    color: "#0D0D0D",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  rightCol: {
    width: rs(89),
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  thumbWrap: {
    width: rs(89),
    height: rs(89),
  },
  thumb: {
    width: rs(89),
    height: rs(89),
    borderRadius: rs(13),
    backgroundColor: "#F2F2F2",
  },
  popularBadge: {
    position: "absolute",
    right: -rs(10),
    bottom: -rs(4),
    width: rs(25),
    height: rs(25),
    borderRadius: rs(100),
    backgroundColor: "#F77965",
    alignItems: "center",
    justifyContent: "center",
  },
  countRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: rs(12),
    marginTop: rs(8),
    marginRight: rs(2),
  },
  countItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(3),
  },
  countText: {
    color: "#979797",
    fontSize: rfs(13),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
});
