import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import HeartIcon from "@/assets/icon/saerok/HeartIcon";
import CommentIcon from "@/assets/icon/saerok/CommentIcon";
import SuggestionAgreeIcon from "@/assets/icon/saerok/SuggestionAgreeIcon";
import PopularFlameIcon from "@/assets/icon/nest/PopularFlameIcon";
import { CommunityCollectionSummary } from "@/services/api/community";
import { rfs, rs } from "@/theme/scale";

export type CommunityCollectionRowVariant = "recent" | "popular" | "pending";

function formatElapsed(dateString?: string | null) {
  if (!dateString) return "";
  const t = new Date(dateString).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
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
  variant = "recent",
}: {
  item: CommunityCollectionSummary;
  onPress: () => void;
  variant?: CommunityCollectionRowVariant;
}) {
  const showSuggestionCount = variant === "pending";
  const locationText = item.locationAlias || item.address || "";
  const title = item.note?.trim() || "한 줄 평";
  const birdName = item.bird?.koreanName || "이름 모를 새";

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.leftCol}>
        <Text style={styles.birdTag} numberOfLines={1}>
          {birdName}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {`${formatElapsed(item.createdAt)} · ${locationText}`}
        </Text>

        <View style={styles.userRow}>
          <View style={styles.userBirdIcon}>
            <SuggestionAgreeIcon width={rs(14)} height={rs(14)} color="#91BFFF" />
          </View>
          <Text style={styles.userText} numberOfLines={1}>
            {item.user?.nickname || "비둘기"}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: item.thumbnailImageUrl || item.imageUrl || "" }}
            style={styles.thumb}
          />
          {variant === "recent" && item.isPopular ? (
            <View style={styles.popularBadge}>
              <PopularFlameIcon width={rs(12)} height={rs(14)} color="#FEFEFE" />
            </View>
          ) : null}
        </View>

        <View style={styles.countRow}>
          <View style={styles.countItem}>
            <HeartIcon
              width={rs(14)}
              height={rs(13)}
              fillColor="none"
              strokeColor="#D9D9D9"
              strokeWidth={1.8}
            />
            <Text style={styles.countText}>{item.likeCount ?? 0}</Text>
          </View>
          <View style={styles.countItem}>
            <CommentIcon width={rs(14)} height={rs(14)} color="#D9D9D9" strokeWidth={1.8} />
            <Text style={styles.countText}>{item.commentCount ?? 0}</Text>
          </View>
          {showSuggestionCount ? (
            <View style={styles.countItem}>
              <View style={styles.suggestionCountIcon}>
                <Text style={styles.suggestionCountQuestion}>?</Text>
              </View>
              <Text style={styles.countText}>{item.suggestionUserCount ?? 0}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const communityCollectionRowStyles = StyleSheet.create({
  card: {
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F1F1",
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
    alignItems: "flex-start",
    gap: rs(12),
    paddingHorizontal: rs(16),
    paddingVertical: rs(14),
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
  },
  rightCol: {
    width: rs(112),
    alignItems: "flex-end",
    gap: rs(8),
  },
  birdTag: {
    alignSelf: "flex-start",
    color: "#A4A4A4",
    backgroundColor: "#F2F2F2",
    borderRadius: rs(5),
    paddingHorizontal: rs(5),
    paddingVertical: rs(2),
    fontSize: rfs(11),
    lineHeight: rfs(13),
    fontWeight: "600",
    marginBottom: rs(6),
  },
  title: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(20),
    fontWeight: "700",
  },
  meta: {
    marginTop: rs(4),
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  userRow: {
    marginTop: rs(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
  },
  userBirdIcon: {
    width: rs(22),
    height: rs(22),
    borderRadius: rs(11),
    alignItems: "center",
    justifyContent: "center",
  },
  userText: {
    color: "#111111",
    fontSize: rfs(14),
    lineHeight: rfs(16),
    fontWeight: "500",
  },
  thumb: {
    width: rs(112),
    height: rs(112),
    borderRadius: rs(14),
    backgroundColor: "#ECECEC",
  },
  thumbWrap: {
    width: rs(112),
    height: rs(112),
  },
  popularBadge: {
    position: "absolute",
    right: -rs(6),
    bottom: -rs(6),
    width: rs(25),
    height: rs(25),
    borderRadius: rs(12.5),
    backgroundColor: "#F77965",
    alignItems: "center",
    justifyContent: "center",
  },
  countRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: rs(10),
  },
  countItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(3),
  },
  countText: {
    color: "#BEBEBE",
    fontSize: rfs(12),
    lineHeight: rfs(14),
    fontWeight: "500",
  },
  suggestionCountIcon: {
    width: rs(14),
    height: rs(14),
    borderRadius: rs(7),
    backgroundColor: "#E3E3E3",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionCountQuestion: {
    color: "#FFFFFF",
    fontSize: rfs(8),
    lineHeight: rfs(10),
    fontWeight: "700",
    marginTop: -1,
  },
});
