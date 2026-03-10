import React, { useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import EmptyState from "@/components/common/EmptyState";
import UnknownBirdSmallIcon from "@/assets/icon/nest/UnknownBirdSmallIcon";
import CommentIcon from "@/assets/icon/saerok/CommentIcon";
import HeartIcon from "@/assets/icon/saerok/HeartIcon";
import LocationIcon from "@/assets/icon/saerok/LocationIcon";
import type { NearbyCollectionItem } from "@/services/api/collections";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";

type Props = {
  addressText: string;
  items: NearbyCollectionItem[];
  bottomInset: number;
  bottomOffset?: number;
  coveredBottomHeight?: number;
  onPressItem: (collectionId: number) => void;
};

const SHEET_MAX_HEIGHT = Dimensions.get("window").height * 0.78;
const SHEET_PEEK_HEIGHT = rs(60);

function formatElapsed(dateString?: string) {
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

function MapCollectionCard({
  item,
  onPressItem,
}: {
  item: NearbyCollectionItem;
  onPressItem: (collectionId: number) => void;
}) {
  const nickname = item.user?.nickname || "사용자";
  const profile =
    item.user?.thumbnailProfileImageUrl || item.user?.profileImageUrl || "";
  const dateText = formatElapsed(item.createdAt);
  const birdName = item.koreanName || "이름모를 새";
  const locationText = item.locationAlias || item.address || "";
  const imageUri = item.thumbnailImageUrl || item.imageUrl || "";
  const isUnknownBird = !item.koreanName;

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPressItem(item.collectionId)}
    >
      <View style={styles.cardMainRow}>
        <View style={styles.leftCol}>
          <View style={styles.leftTopWrap}>
            <Text style={styles.locationAliasTop} numberOfLines={1}>
              {locationText}
            </Text>

            <View style={styles.birdRow}>
              <Text style={styles.birdName} numberOfLines={1}>
                {birdName}
              </Text>
              {isUnknownBird ? (
                <View style={styles.unknownIconWrap}>
                  <UnknownBirdSmallIcon width={rs(13)} height={rs(16)} />
                </View>
              ) : null}
            </View>

            <Text style={styles.note} numberOfLines={2} ellipsizeMode="tail">
              {item.note || ""}
            </Text>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.profileWrap}>
              {profile ? (
                <Image source={{ uri: profile }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileFallback} />
              )}
            </View>
            <Text style={styles.nickname} numberOfLines={1}>
              {nickname}
            </Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mainImageFallback} />
          )}
          <View style={styles.countRow}>
            <View style={styles.countItem}>
              <HeartIcon
                width={rs(15)}
                height={rs(15)}
                fillColor="#D9D9D9"
                strokeColor="#D9D9D9"
              />
              <Text style={styles.countText}>{item.likeCount ?? 0}</Text>
            </View>
            <View style={styles.countItem}>
              <CommentIcon
                width={rs(13)}
                height={rs(13)}
                color="#D9D9D9"
                fillColor="#D9D9D9"
              />
              <Text style={styles.countText}>{item.commentCount ?? 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function MapCollectionsSheet({
  addressText,
  items,
  bottomInset,
  bottomOffset = 0,
  coveredBottomHeight = 0,
  onPressItem,
}: Props) {
  const sheetHeight = SHEET_MAX_HEIGHT + coveredBottomHeight;
  const visibleWhenClosed = SHEET_PEEK_HEIGHT + coveredBottomHeight;
  const closedY = Math.max(0, sheetHeight - visibleWhenClosed);
  const translateY = useRef(new Animated.Value(closedY)).current;
  const lastOffsetRef = useRef(closedY);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 3,
        onPanResponderGrant: () => {
          translateY.stopAnimation((v: number) => {
            lastOffsetRef.current = v;
          });
        },
        onPanResponderMove: (_, g) => {
          const next = Math.min(
            closedY,
            Math.max(0, lastOffsetRef.current + g.dy),
          );
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const current = lastOffsetRef.current + g.dy;
          const shouldClose = g.vy > 0.15;
          const shouldOpen =
            !shouldClose && (g.vy < -0.25 || current < closedY * 0.55);
          const toValue = shouldOpen ? 0 : closedY;
          lastOffsetRef.current = toValue;
          Animated.spring(translateY, {
            toValue,
            useNativeDriver: true,
            tension: 70,
            friction: 12,
          }).start();
        },
      }),
    [closedY, translateY],
  );

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          bottom: bottomOffset,
          height: sheetHeight,
          transform: [{ translateY }],
        },
      ]}
    >
      <View {...panResponder.panHandlers}>
        <View style={styles.handleArea}>
          <View style={styles.handleBar} />
        </View>

        <View style={styles.addressRow}>
          <LocationIcon width={rs(17)} height={rs(17)} color="#F7BE65" />
          <Text style={styles.addressText} numberOfLines={1}>
            {addressText || "현재 위치"}
          </Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={[styles.emptyWrap, { paddingBottom: rs(20) + bottomInset }]}>
          <EmptyState
            bgColor="gray"
            upperText="지금은 고요한 숲처럼 조용하네요."
            lowerText="아직 이 주변에 올라온 새록이 없어요."
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: rs(20) + bottomInset },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <MapCollectionCard
              key={item.collectionId}
              item={item}
              onPressItem={onPressItem}
            />
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    backgroundColor: "#F2F2F2",
    paddingHorizontal: rs(9),
    zIndex: 30,
    elevation: 8,
  },
  handleArea: {
    height: rs(11),
    alignItems: "center",
    justifyContent: "center",
  },
  handleBar: {
    width: rs(110),
    height: rs(3),
    borderRadius: rs(3),
    backgroundColor: "#D9D9D9",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    paddingHorizontal: rs(15),
    marginTop: rs(15),
    paddingBottom: rs(11),
  },
  addressText: {
    flex: 1,
    color: "#0D0D0D",
    fontSize: rfs(18),
    lineHeight: rfs(20),
    fontFamily: font.haru,
    fontWeight: "400",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    marginTop: rs(10),
    gap: rs(7),
  },
  emptyWrap: {
    flex: 1,
    marginTop: rs(10),
  },
  card: {
    minHeight: rs(141),
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
    paddingHorizontal: rs(15),
    paddingTop: rs(14),
    paddingBottom: rs(9),
  },
  cardMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(10),
  },
  leftCol: {
    flex: 1,
    minHeight: rs(118),
    justifyContent: "space-between",
  },
  leftTopWrap: {},
  rightCol: {
    marginLeft: "auto",
    width: rs(89),
    alignItems: "flex-end",
  },
  locationAliasTop: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
    marginBottom: rs(10),
  },
  birdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rs(4),
  },
  birdName: {
    color: "#0D0D0D",
    fontFamily: font.money,
    fontSize: rfs(15),
    lineHeight: rfs(17),
    fontWeight: "400",
    flexShrink: 1,
  },
  unknownIconWrap: {
    width: rs(17),
    height: rs(17),
    marginLeft: rs(4),
    marginBottom: rs(1),
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    color: "#6D6D6D",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
    paddingRight: rs(10),
  },
  mainImage: {
    width: rs(89),
    height: rs(89),
    borderRadius: rs(20),
    backgroundColor: "#FEFEFE",
  },
  mainImageFallback: {
    width: rs(89),
    height: rs(89),
    borderRadius: rs(20),
    backgroundColor: "#D9D9D9",
  },
  countRow: {
    marginTop: rs(8),
    width: rs(89),
    marginRight: rs(4),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: rs(12),
  },
  countItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(3),
  },
  countText: {
    color: "#979797",
    fontSize: rfs(15),
    lineHeight: rfs(20),
    fontWeight: "400",
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: rs(32),
    marginBottom: rs(3),
  },
  profileWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(10),
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileFallback: {
    flex: 1,
    backgroundColor: "#DAE0DE",
  },
  nickname: {
    marginLeft: rs(6),
    color: "#0D0D0D",
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontWeight: "400",
    flex: 1,
  },
});
