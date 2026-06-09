import SimpleHeader from "@/components/common/SimpleHeader";
import ToggleRow from "@/components/my/ToggleRow";
import {
  fetchNotificationSettingsApi,
  toggleNotificationSettingApi,
  type NotificationPlatform,
  type NotificationType,
} from "@/services/api/notifications";
import { getOrCreateNotificationDeviceId } from "@/services/notifications/deviceId";
import { registerPushTokenToServer } from "@/services/notifications/push";
import { rs } from "@/theme";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LocalSettingState = {
  comment: boolean;
  like: boolean;
  sameBirdOpinion: boolean;
  featureAnnouncement: boolean;
};
type LocalSettingKey = keyof LocalSettingState;

const DEFAULT_SERVER_TYPE_BY_KEY: Record<LocalSettingKey, NotificationType> = {
  comment: "COMMENTED_ON_COLLECTION",
  like: "LIKED_ON_COLLECTION",
  sameBirdOpinion: "SUGGESTED_BIRD_ID_ON_COLLECTION",
  featureAnnouncement: "SYSTEM_PUBLISHED_ANNOUNCEMENT",
};

const DEFAULT_SETTINGS: LocalSettingState = {
  comment: true,
  like: true,
  sameBirdOpinion: true,
  featureAnnouncement: false,
};

const getPlatform = (): NotificationPlatform =>
  Platform.OS === "ios" ? "IOS" : "ANDROID";

function pickType(serverTypes: Set<string>, candidates: string[]): string | undefined {
  for (const c of candidates) {
    if (serverTypes.has(c)) return c;
  }
  return undefined;
}

function pickTypeByPattern(serverTypes: Set<string>, includesAll: string[]): string | undefined {
  for (const t of serverTypes) {
    const upper = t.toUpperCase();
    if (includesAll.every((k) => upper.includes(k))) return t;
  }
  return undefined;
}

export default function NotificationSettingsPage() {
  const [deviceId, setDeviceId] = useState<string>("");
  const [settings, setSettings] = useState<LocalSettingState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [remoteReady, setRemoteReady] = useState(false);
  const [serverTypeByKey, setServerTypeByKey] = useState<
    Partial<Record<LocalSettingKey, NotificationType>>
  >(DEFAULT_SERVER_TYPE_BY_KEY);

  const platform = useMemo(() => getPlatform(), []);

  const ensureDeviceId = useCallback(async () => {
    const id = await getOrCreateNotificationDeviceId();
    setDeviceId(id);
    return id;
  }, []);

  const fetchSettings = useCallback(
    async (id: string) => {
      try {
        const res = await fetchNotificationSettingsApi(id, platform);
        const byType = new Map(res.items.map((v) => [v.type, v.enabled]));
        const serverTypes = new Set(res.items.map((v) => v.type));

        const likeType =
          pickType(serverTypes, ["LIKED_ON_COLLECTION"]) ??
          pickTypeByPattern(serverTypes, ["LIKE", "COLLECTION"]);
        const commentType =
          pickType(serverTypes, [
            "COMMENTED_ON_COLLECTION",
            "COMMENT_ON_COLLECTION",
          ]) ??
          pickTypeByPattern(serverTypes, ["COMMENT", "COLLECTION"]);
        const sameBirdType =
          pickType(serverTypes, [
            "SUGGESTED_BIRD_ID_ON_COLLECTION",
            "BIRD_ID_SUGGESTED_ON_COLLECTION",
          ]) ??
          pickTypeByPattern(serverTypes, ["SUGGEST"]);
        const featureType =
          pickType(serverTypes, [
            "SYSTEM_PUBLISHED_ANNOUNCEMENT",
          ]) ??
          pickTypeByPattern(serverTypes, ["SYSTEM", "PUBLISHED", "ANNOUNCEMENT"]);
        setServerTypeByKey({
          comment: commentType ?? DEFAULT_SERVER_TYPE_BY_KEY.comment,
          like: likeType ?? DEFAULT_SERVER_TYPE_BY_KEY.like,
          sameBirdOpinion: sameBirdType ?? DEFAULT_SERVER_TYPE_BY_KEY.sameBirdOpinion,
          featureAnnouncement:
            featureType ?? DEFAULT_SERVER_TYPE_BY_KEY.featureAnnouncement,
        });

        setSettings({
          comment: (commentType ? byType.get(commentType) : undefined) ?? DEFAULT_SETTINGS.comment,
          like: (likeType ? byType.get(likeType) : undefined) ?? DEFAULT_SETTINGS.like,
          sameBirdOpinion:
            (sameBirdType ? byType.get(sameBirdType) : undefined) ??
            DEFAULT_SETTINGS.sameBirdOpinion,
          featureAnnouncement:
            (featureType ? byType.get(featureType) : undefined) ??
            DEFAULT_SETTINGS.featureAnnouncement,
        });
        setRemoteReady(true);
        return true;
      } catch (e: any) {
        const status = e?.response?.status;
        // 404: device/token not registered on server yet
        if (status === 404) {
          setSettings(DEFAULT_SETTINGS);
          setRemoteReady(false);
          setServerTypeByKey(DEFAULT_SERVER_TYPE_BY_KEY);
          return false;
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [platform],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const id = await ensureDeviceId();
        if (!mounted) return;
        await registerPushTokenToServer().catch((e) => {
          console.log("[NotificationSettingsPage] registerPushTokenToServer ERROR", e);
        });
        let ready = await fetchSettings(id);
        if (!ready) {
          for (let attempt = 0; attempt < 2 && !ready; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (!mounted) return;
            ready = await fetchSettings(id);
          }
        }
      } catch (e) {
        console.log("[NotificationSettingsPage] init ERROR", e);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ensureDeviceId, fetchSettings]);

  const onToggle = useCallback(
    async (key: LocalSettingKey) => {
      if (!deviceId) return;
      const type = serverTypeByKey[key] ?? DEFAULT_SERVER_TYPE_BY_KEY[key];
      if (!type) {
        console.log("[NotificationSettingsPage] skip toggle: unsupported type", key);
        return;
      }
      const prev = settings[key];
      setSettings((s) => ({ ...s, [key]: !prev }));
      try {
        const res = await toggleNotificationSettingApi({
          deviceId,
          platform,
          type,
        });
        setRemoteReady(true);
        setSettings((s) => ({ ...s, [key]: !!res.enabled }));
      } catch (e) {
        console.log("[NotificationSettingsPage] toggle ERROR", e);
        setSettings((s) => ({ ...s, [key]: prev }));
      }
    },
    [deviceId, platform, serverTypeByKey, settings],
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <SimpleHeader title="알림 설정" />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color="#4190FF" />
          </View>
        ) : (
          <>
            <ToggleRow
              label="댓글 알림"
              value={settings.comment}
              onToggle={() => onToggle("comment")}
            />
            <ToggleRow
              label="좋아요 알림"
              value={settings.like}
              onToggle={() => onToggle("like")}
            />
            <ToggleRow
              label="동정 의견 알림"
              value={settings.sameBirdOpinion}
              onToggle={() => onToggle("sameBirdOpinion")}
            />
            <ToggleRow
              label="새로운 기능 공지 알림"
              value={settings.featureAnnouncement}
              onToggle={() => onToggle("featureAnnouncement")}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: rs(24),
  },
  loaderWrap: {
    paddingTop: rs(20),
  },
});
