import BracketIcon from "@/assets/icon/common/BracketIcon";
import { getAnnouncementDetail } from "@/services/api/announcements";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatPublishedDate(publishedAt: string) {
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}. ${mm}. ${dd}.`;
}

function htmlToText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const numericId = Number(id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<{
    title: string;
    content: string;
    publishedAt: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!numericId || Number.isNaN(numericId)) {
        setError(
          "\uc798\ubabb\ub41c \uacf5\uc9c0\uc0ac\ud56d\uc785\ub2c8\ub2e4.",
        );
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await getAnnouncementDetail(numericId);
        if (!mounted) return;
        setItem({
          title: res.title,
          content: res.content,
          publishedAt: res.publishedAt,
        });
      } catch {
        if (!mounted) return;
        setError(
          "\uacf5\uc9c0\uc0ac\ud56d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc5b4\uc694.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [numericId]);

  const contentText = useMemo(
    () => (item ? htmlToText(item.content) : ""),
    [item],
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <BracketIcon width={rs(17)} height={rs(17)} color="#0D0D0D" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#4190FF" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !item ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {"\uacf5\uc9c0\uc0ac\ud56d\uc774 \uc5c6\uc5b4\uc694."}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {formatPublishedDate(item.publishedAt)}
            {"  |  "}
            {"\uc0c8\ub85d \uc6b4\uc601\ud300"}
          </Text>
          <Text style={styles.content}>{contentText}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  header: {
    height: rs(84),
    paddingHorizontal: rs(24),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "rgba(254, 254, 254, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingHorizontal: rs(24),
    paddingTop: rs(14),
    paddingBottom: rs(36),
  },
  title: {
    color: "#0D0D0D",
    fontFamily: font.bold,
    fontSize: rfs(22),
    lineHeight: rfs(25),
  },
  meta: {
    marginTop: rs(12),
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(18),
  },
  content: {
    marginTop: rs(29),
    color: "#6D6D6D",
    fontFamily: font.regular,
    fontSize: rfs(15),
    lineHeight: rfs(25),
  },
  errorText: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(14),
    textAlign: "center",
  },
});
