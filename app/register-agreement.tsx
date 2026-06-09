import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import BackSmallIcon from "@/assets/icon/button/BackSmallIcon";
import { rs } from "@/theme";

export default function RegisterAgreementScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ title?: string; url?: string }>();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={rs(10)}
          style={styles.backButton}
        >
          <BackSmallIcon width={17} height={17} color="#0D0D0D" />
        </Pressable>
      </View>

      {url ? (
        <WebView
          source={{ uri: url }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#4190FF" />
            </View>
          )}
          style={styles.webview}
        />
      ) : (
        <View style={styles.loadingWrap} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: rs(84),
    paddingHorizontal: rs(24),
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  webview: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
