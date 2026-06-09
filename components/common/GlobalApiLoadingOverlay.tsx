import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import {
  ApiLoadingState,
  subscribeApiLoading,
} from "@/services/apiLoading";
import { rs } from "@/theme";

export default function GlobalApiLoadingOverlay() {
  const [state, setState] = useState<ApiLoadingState>({
    blocking: false,
    visible: false,
  });

  useEffect(() => subscribeApiLoading(setState), []);

  if (!state.blocking) return null;

  return (
    <View
      style={[styles.root, state.visible ? styles.overlay : styles.touchBlocker]}
      pointerEvents="auto"
    >
      {state.visible ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  touchBlocker: {
    backgroundColor: "transparent",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: rs(88),
    height: rs(88),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },
});
