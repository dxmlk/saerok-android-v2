import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

type Step = "start" | "transition" | "final";

export default function OnboardingScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("start");

  useEffect(() => {
    const t1 = setTimeout(() => setStep("transition"), 1500);
    const t2 = setTimeout(() => setStep("final"), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (step !== "final") return;
    (async () => {
      const loggedIn = await refreshUser();
      router.replace(loggedIn ? "/(tabs)/nest" : "/login");
    })();
  }, [step]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>새를 기록하다</Text>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>SAEROK</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 10,
  },
  logoBox: {
    width: 140,
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { fontSize: 22, fontWeight: "900", color: "#2563eb" },
});
