import SaerokList from "@/components/saerok/SaerokList";
import SaerokMain from "@/components/saerok/SaerokMain";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Animated, RefreshControl, StyleSheet, View } from "react-native";
import { rs } from "@/theme";

export default function SaerokScreen() {
  const [opacity] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y ?? 0;
    const next = Math.max(0, 1 - y / rs(384));
    opacity.setValue(next);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, []),
  );

  return (
    <View style={styles.root}>
      <Animated.FlatList
        data={[{ key: "list" }]}
        keyExtractor={(it) => it.key}
        renderItem={() => (
          <View style={styles.listWrap}>
            <SaerokList refreshKey={refreshKey} />
          </View>
        )}
        contentContainerStyle={styles.content}
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
  content: { paddingTop: rs(0), paddingBottom: rs(120) },
  listWrap: { paddingHorizontal: rs(12) },
});
