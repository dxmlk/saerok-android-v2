import ScrapIcon from "@/assets/icon/button/scrap.svg";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type DexItem = {
  id: number;
  koreanName: string;
  scientificName: string;
  thumbImageUrl: string;
};
type Props = {
  items: DexItem[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onPressItem: (id: number) => void;
  onToggleBookmark?: (id: number) => void;
  bookmarkedIds?: Set<number>;
  onScroll?: (e: any) => void;
  listRef?: React.RefObject<FlatList<DexItem> | null>;
  onEndReached?: () => void;
};

export default function DexList({
  items,
  loading = false,
  refreshing = false,
  onRefresh,
  onPressItem,
  onToggleBookmark,
  bookmarkedIds = new Set<number>(),
  onScroll,
  listRef,
  onEndReached, // ✅ 추가
}: Props) {
  const renderItem = ({ item }: { item: DexItem }) => {
    const isBookmarked = bookmarkedIds.has(item.id);

    return (
      <Pressable
        onPress={() => onPressItem(item.id)}
        style={styles.card}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      >
        {/* 이미지 */}
        <Image source={{ uri: item.thumbImageUrl }} style={styles.img} />

        {/* 우상단 스크랩 버튼 */}
        <Pressable
          onPress={() => onToggleBookmark?.(item.id)}
          hitSlop={10}
          style={styles.scrapBtn}
        >
          <ScrapIcon
            width={18}
            height={18}
            // 핵심: currentColor를 쓰는 path는 color로 먹습니다
            color={isBookmarked ? "#F6C343" : "#6B7280"}
            // 어떤 svg는 stroke/fill을 직접 보기도 해서 같이 던져줌(없으면 무시됨)
            stroke={isBookmarked ? "#F6C343" : "#6B7280"}
            fill={isBookmarked ? "#F6C343" : "none"}
          />
        </Pressable>

        {/* 하단 그라데이션(웹의 blur+gradient 느낌 대체) */}
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

        {/* 텍스트 영역 */}
        <View style={styles.textWrap} pointerEvents="none">
          <Text numberOfLines={1} style={styles.kor}>
            {item.koreanName}
          </Text>
          <Text numberOfLines={1} style={styles.sci}>
            {item.scientificName}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <FlatList
      ref={listRef as any}
      data={items}
      keyExtractor={(it) => String(it.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached} // ✅ 이제 스코프에 존재
      onEndReachedThreshold={0.4}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListFooterComponent={
        loading ? (
          <View style={{ paddingVertical: 18 }}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // 웹 px-24 느낌
    paddingBottom: 24,
  },
  row: {
    gap: 15, // 웹 gap-15
    marginBottom: 15,
  },

  card: {
    flex: 1,
    height: 198, // 웹 h-198
    borderRadius: 10,
    backgroundColor: "#ffffff",
    overflow: "hidden",

    // 웹 boxShadow: 0 0 5px rgba(13,13,13,0.1) 비슷하게
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },

  img: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 170, // 웹 h-170
  },

  scrapBtn: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    // 드롭섀도우 느낌 (웹 filter drop-shadow 대체)
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 26, // 웹 bottom-26
    height: 26, // 웹 h-26
    zIndex: 10,
  },

  textWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 52, // 웹 h-52
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 30,
    justifyContent: "flex-start",
  },

  kor: {
    fontSize: 13.5,
    color: "#111111",
    fontWeight: "600",
  },

  sci: {
    marginTop: 2,
    fontSize: 11.5,
    color: "#7a7a7a",
  },
});
