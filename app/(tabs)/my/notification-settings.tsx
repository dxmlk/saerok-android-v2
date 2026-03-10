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

const NOTI_KEYS = {
  comment: "COMMENTED_ON_COLLECTION",
  like: "LIKED_ON_COLLECTION",
  sameBirdOpinion: "BIRD_ID_SUGGESTED_ON_COLLECTION",
  featureAnnouncement: "NOTICE",
} as const satisfies Record<string, NotificationType>;

type LocalSettingState = {
  comment: boolean;
  like: boolean;
  sameBirdOpinion: boolean;
  featureAnnouncement: boolean;
};

const DEFAULT_SETTINGS: LocalSettingState = {
  comment: true,
  like: true,
  sameBirdOpinion: true,
  featureAnnouncement: false,
};

const getPlatform = (): NotificationPlatform =>
  Platform.OS === "ios" ? "IOS" : "ANDROID";

export default function NotificationSettingsPage() {
  const [deviceId, setDeviceId] = useState<string>("");
  const [settings, setSettings] = useState<LocalSettingState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [remoteReady, setRemoteReady] = useState(false);

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
        setSettings({
          comment: byType.get(NOTI_KEYS.comment) ?? DEFAULT_SETTINGS.comment,
          like: byType.get(NOTI_KEYS.like) ?? DEFAULT_SETTINGS.like,
          sameBirdOpinion:
            byType.get(NOTI_KEYS.sameBirdOpinion) ??
            DEFAULT_SETTINGS.sameBirdOpinion,
          featureAnnouncement:
            byType.get(NOTI_KEYS.featureAnnouncement) ??
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
        await fetchSettings(id);
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
    async (key: keyof LocalSettingState) => {
      if (!deviceId) return;
      if (!remoteReady) {
        // Remote setting row not provisioned yet on backend.
        return;
      }
      const prev = settings[key];
      setSettings((s) => ({ ...s, [key]: !prev }));
      try {
        const res = await toggleNotificationSettingApi({
          deviceId,
          platform,
          type: NOTI_KEYS[key],
        });
        setSettings((s) => ({ ...s, [key]: !!res.enabled }));
      } catch (e) {
        console.log("[NotificationSettingsPage] toggle ERROR", e);
        setSettings((s) => ({ ...s, [key]: prev }));
      }
    },
    [deviceId, platform, remoteReady, settings],
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <SimpleHeader title="알림 설정" />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator />
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
