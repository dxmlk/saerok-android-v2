// components/dex/DexList.tsx
import ScrapIcon from "@/assets/icon/button/ScrapIcon";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { openDexDetail } from "@/lib/navigation";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Animated } from "react-native";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";
import TouchableOpacity from "@/components/common/TouchableOpacity";

export type DexItem = {
  id: number;
  koreanName: string;
  scientificName: string;
  thumbImageUrl: string;
};

type DexListRowItem =
  | DexItem
  | {
      id: string;
      __skeleton: true;
    }
  | {
      id: string;
      __placeholder: true;
    };

type Props = {
  items: DexItem[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onToggleBookmark?: (id: number) => void;
  bookmarkedIds?: Set<number>;
  onScroll?: FlatListProps<DexItem>["onScroll"];
  listRef?: React.RefObject<FlatList<DexItem> | null>;
  onEndReached?: () => void;

  contentTopPadding?: number;
};

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<DexListRowItem>,
) as unknown as typeof FlatList<DexListRowItem>;

export default function DexList({
  items,
  loading = false,
  refreshing = false,
  onRefresh,
  onToggleBookmark,
  bookmarkedIds = new Set<number>(),
  onScroll,
  listRef,
  onEndReached,
  contentTopPadding = 0,
}: Props) {
  const router = useRouter();
  const showInitialSkeleton = loading && items.length === 0;
  const skeletonData: DexListRowItem[] = Array.from(
    { length: 8 },
    (_, index) => ({
      id: `__dex-skeleton-${index}`,
      __skeleton: true,
    }),
  );
  const listData: DexListRowItem[] = showInitialSkeleton
    ? skeletonData
    : items.length % 2 === 1
      ? [...items, { id: "__dex-placeholder__", __placeholder: true }]
      : items;

  const renderItem = ({ item }: { item: DexListRowItem }) => {
    if ("__skeleton" in item) {
      return (
        <View style={styles.card}>
          <View style={[styles.img, styles.skeletonBlock]} />
          <View style={styles.skeletonScrap} />
          <View style={styles.skeletonTextWrap}>
            <View style={styles.skeletonKor} />
            <View style={styles.skeletonSci} />
          </View>
        </View>
      );
    }

    if ("__placeholder" in item) {
      return <View style={[styles.card, styles.placeholderCard]} />;
    }
    const isBookmarked = bookmarkedIds.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => openDexDetail(router, item.id, { from: "dex_list" })}
        style={styles.card}
      >
        <Image source={{ uri: item.thumbImageUrl }} style={styles.img} />

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleBookmark?.(item.id);
          }}
          hitSlop={rs(10)}
          style={styles.scrapBtn}
        >
          <ScrapIcon
            width={rs(23)}
            height={rs(29)}
            fill={isBookmarked ? "#F7BE65" : "rgba(217, 217, 217, 0.60)"}
            stroke={isBookmarked ? "#FEFEFE" : "#6D6D6D"}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        <LinearGradient
          colors={[
            "rgba(254,254,254,0.0)",
            "rgba(254,254,254,0.85)",
            "rgba(254,254,254,1.0)",
          ]}
          locations={[0, 0.45, 1]}
          style={styles.bottomFade}
          pointerEvents="none"
        />

        <View style={styles.textWrap} pointerEvents="none">
          <Text numberOfLines={1} style={styles.kor}>
            {item.koreanName}
          </Text>
          <Text numberOfLines={1} style={styles.sci}>
            {item.scientificName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AnimatedFlatList
      ref={listRef as any}
      data={listData}
      keyExtractor={(it) => String(it.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[
        styles.container,
        { paddingTop: contentTopPadding + styles.container.paddingTop! },
      ]}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListFooterComponent={
        loading && items.length > 0 ? (
          <View style={{ paddingVertical: rs(18) }}>
            <ActivityIndicator color="#4190FF" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: rs(20),
    paddingHorizontal: rs(9),
    paddingBottom: rs(100),
  },
  row: {
    gap: rs(7),
    marginBottom: rs(7),
  },

  card: {
    flex: 1,
    height: rs(198),
    borderRadius: rs(20),
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowOpacity: 0.12,
    shadowRadius: rs(5),
    shadowOffset: { width: rs(0), height: rs(0) },
    elevation: 2,
  },
  placeholderCard: {
    opacity: 0,
  },

  img: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: rs(170),
  },

  scrapBtn: {
    position: "absolute",
    top: rs(12),
    right: rs(12),
    width: rs(23),
    height: rs(29),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowOpacity: 0.5,
    shadowRadius: rs(3),
    shadowOffset: { width: rs(0), height: rs(1) },
    elevation: 3,
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: rs(28),
    height: rs(31),
    zIndex: 10,
  },

  textWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: rs(52),
    paddingHorizontal: rs(14),
    paddingVertical: rs(8),
    zIndex: 30,
    justifyContent: "flex-start",
  },

  kor: {
    fontFamily: font.money,
    fontSize: rfs(15),
    color: "#111111",
    fontWeight: "400",
    lineHeight: rfs(17),
  },

  sci: {
    fontSize: rfs(13),
    color: "#7a7a7a",
    lineHeight: rfs(16),
    fontWeight: "400",
  },
  skeletonBlock: {
    backgroundColor: "#E8ECEB",
  },
  skeletonScrap: {
    position: "absolute",
    top: rs(12),
    right: rs(12),
    width: rs(23),
    height: rs(29),
    borderRadius: rs(8),
    backgroundColor: "#DAE0DE",
    zIndex: 20,
  },
  skeletonTextWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: rs(52),
    paddingHorizontal: rs(14),
    paddingVertical: rs(9),
    backgroundColor: "#FFFFFF",
    zIndex: 30,
  },
  skeletonKor: {
    width: "62%",
    height: rs(15),
    borderRadius: rs(8),
    backgroundColor: "#E8ECEB",
  },
  skeletonSci: {
    width: "78%",
    height: rs(11),
    borderRadius: rs(6),
    marginTop: rs(7),
    backgroundColor: "#E8ECEB",
  },
});
