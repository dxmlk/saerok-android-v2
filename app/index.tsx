import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

import SplashLogo from "@/assets/icon/logo/SplashLogo";
import { LinearGradient } from "expo-linear-gradient";
import { rfs, rs } from "@/theme";

type Step = "start" | "transition" | "final";

export default function OnboardingScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("start");

  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t1 = setTimeout(() => setStep("transition"), 1500);
    const t2 = setTimeout(() => setStep("final"), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (step !== "transition") return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [step, opacity]);

  useEffect(() => {
    if (step !== "final") return;
    (async () => {
      const loggedIn = await refreshUser();
      router.replace(loggedIn ? "/(tabs)/nest" : "/login");
    })();
  }, [step]);

  const isStart = step === "start";
  const bg = useMemo(() => {
    if (isStart) return "gradient";
    return "white";
  }, [isStart]);

  return (
    <View style={styles.container}>
      {bg === "gradient" ? (
        <LinearGradient
          colors={["#EAF2FF", "#FFFFFF"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF" }]}
        />
      )}

      <Animated.View style={[styles.center, { opacity }]}>
        <Animated.Text style={[styles.title, { opacity }]}>
          새를 기록하다
        </Animated.Text>
        <View style={styles.logoWrap}>
          <SplashLogo width={rs(103)} height={rs(53)} color="#4190FF" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: rs(8),
  },
  title: {
    fontSize: rfs(16),
    color: "#4190FF",
  },
  logoWrap: {
    marginTop: 0,
  },
});
