import SaerokHeader from "@/components/saerok/SaerokHeader";
import SaerokList from "@/components/saerok/SaerokList";
import SaerokMain from "@/components/saerok/SaerokMain";
import React, { useCallback, useState } from "react";
import { Animated, RefreshControl, StyleSheet, View } from "react-native";

export default function SaerokScreen() {
  const [opacity] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y ?? 0;
    const next = Math.max(0, 1 - y / 384);
    opacity.setValue(next);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  return (
    <View style={styles.root}>
      <SaerokHeader />

      <Animated.FlatList
        data={[{ key: "list" }]} // 더미 1개
        keyExtractor={(it) => it.key}
        renderItem={() => (
          <View style={{ paddingHorizontal: 12 }}>
            <SaerokList refreshKey={refreshKey} />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 76, paddingBottom: 120 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Animated.View style={{ opacity }}>
            <SaerokMain refreshKey={refreshKey} />
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
});
