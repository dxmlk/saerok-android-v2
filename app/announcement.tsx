import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import SimpleHeader from "@/components/common/SimpleHeader";
import {
  AnnouncementListItem,
  getAnnouncements,
} from "@/services/api/announcements";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatElapsed(publishedAt: string) {
  const now = Date.now();
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return "";

  const diffMin = Math.max(0, Math.floor((now - t) / (1000 * 60)));
  if (diffMin < 1) return "\ubc29\uae08 \uc804";
  if (diffMin < 60) return `${diffMin}\ubd84 \uc804`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}\uc2dc\uac04 \uc804`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}\uc77c \uc804`;
}

export default function AnnouncementPage() {
  const router = useRouter();
  const [items, setItems] = useState<AnnouncementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const list = await getAnnouncements();
      setItems(list);
    } catch {
      setError(
        "\uacf5\uc9c0\uc0ac\ud56d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc5b4\uc694.",
      );
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const empty = useMemo(
    () => (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          {
            "\ub4f1\ub85d\ub41c \uacf5\uc9c0\uc0ac\ud56d\uc774 \uc5c6\uc5b4\uc694."
          }
        </Text>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <SimpleHeader title={"\uacf5\uc9c0\uc0ac\ud56d"} circleBackButton />
      <View style={styles.headerDivider} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#4190FF" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>{"\ub2e4\uc2dc \uc2dc\ub3c4"}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={empty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#4190FF"
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: "/announcement/[id]",
                  params: { id: String(item.id) },
                })
              }
            >
              <View style={styles.rowLeft}>
                <View style={styles.tagWrap}>
                  <Text style={styles.tagText}>{"공지사항"}</Text>
                </View>

                <Text style={styles.titleText}>{item.title}</Text>

                <Text style={styles.dateText}>
                  {formatElapsed(item.publishedAt)}
                  {"  |  "}
                  {"새록 운영팀"}
                </Text>
              </View>

              <View style={styles.rowRight}>
                <InfoChevronIcon
                  width={rs(15)}
                  height={rs(15)}
                  color="#0D0D0D"
                />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
    gap: rs(12),
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  listContent: {
    paddingBottom: rs(32),
    flexGrow: 1,
  },
  row: {
    width: "100%",
    paddingTop: rs(12),
    paddingBottom: rs(15),
    paddingHorizontal: rs(24),
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    backgroundColor: "#FEFEFE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rs(12),
  },
  rowLeft: {
    flex: 1,
    gap: rs(8),
  },
  rowRight: {
    width: rs(20),
    alignItems: "flex-end",
    justifyContent: "center",
    alignSelf: "stretch",
    paddingTop: rs(4),
  },
  tagWrap: {
    alignSelf: "flex-start",
    paddingHorizontal: rs(3),
    paddingVertical: rs(1),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: rs(5),
    backgroundColor: "#979797",
  },
  tagText: {
    color: "#FEFEFE",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "700",
    fontFamily: font.bold,
  },
  titleText: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(20),
    fontFamily: font.semibold,
  },
  dateText: {
    marginTop: -rs(4),
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontFamily: font.regular,
  },
  emptyWrap: {
    flex: 1,
    minHeight: rs(240),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  emptyText: {
    color: "#979797",
    fontSize: rfs(14),
    fontFamily: font.regular,
    textAlign: "center",
  },
  errorText: {
    color: "#979797",
    fontSize: rfs(14),
    textAlign: "center",
    fontFamily: font.regular,
  },
  retryBtn: {
    backgroundColor: "#4190FF",
    borderRadius: rs(12),
    paddingHorizontal: rs(16),
    paddingVertical: rs(10),
  },
  retryText: {
    color: "#FEFEFE",
    fontSize: rfs(14),
    fontFamily: font.semibold,
  },
});
