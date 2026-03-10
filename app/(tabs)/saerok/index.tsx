import SaerokList from "@/components/saerok/SaerokList";
import SaerokMain from "@/components/saerok/SaerokMain";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Animated, RefreshControl, StyleSheet, View } from "react-native";
import { rs } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SaerokScreen() {
  const insets = useSafeAreaInsets();
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
    <SafeAreaView style={styles.root} edges={["left", "right"]}>
      <LinearGradient
        colors={["#F7F7F7", "#F7F7F7", "rgba(247, 247, 247, 0)"]}
        locations={[0, 0.9461, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.rootInner}
      >
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
              <SaerokMain refreshKey={refreshKey} topInset={insets.top} />
            </Animated.View>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F7F7" },
  rootInner: { flex: 1 },
  content: { paddingTop: rs(0), paddingBottom: rs(120) },
  listWrap: { paddingHorizontal: rs(0) },
});
