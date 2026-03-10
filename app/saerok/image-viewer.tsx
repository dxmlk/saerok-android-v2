import BackButtonIcon from "@/assets/icon/button/BackButtonIcon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import React from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { rs } from "@/theme";

export default function SaerokImageViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const imageOpacity = React.useRef(new Animated.Value(0)).current;

  const imageUri = Array.isArray(uri) ? uri[0] : uri;

  React.useEffect(() => {
    imageOpacity.setValue(0);
  }, [imageOpacity, imageUri]);

  const onImageLoaded = React.useCallback(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.container}>
        {imageUri ? (
          <Animated.Image
            source={{ uri: imageUri }}
            style={[styles.image, { opacity: imageOpacity }]}
            resizeMode="contain"
            onLoad={onImageLoaded}
          />
        ) : null}
      </View>

      <View style={[styles.header, { paddingTop: insets.top + rs(3) }]}>
        <Pressable onPress={() => router.back()} style={styles.circleBtn} hitSlop={rs(10)}>
          <BlurView intensity={8} tint="light" style={styles.circleBlur} />
          <BackButtonIcon size={rs(40)} withBackground={false} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  header: {
    position: "absolute",
    top: 27,
    left: 0,
    right: 0,
    paddingHorizontal: rs(24),
    paddingBottom: rs(10),
    zIndex: 20,
    backgroundColor: "transparent",
  },
  circleBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  circleBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: rs(20),
    backgroundColor: "rgba(254, 254, 254, 0.6)",
  },
});
