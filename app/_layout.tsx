import React, { useEffect, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "../hooks/useAuth";
import * as Notifications from "expo-notifications";

import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { applyDefaultTypography } from "@/theme/applyDefaultTypography";
import { useAppFonts } from "@/theme/loadfonts";
import GlobalApiLoadingOverlay from "@/components/common/GlobalApiLoadingOverlay";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

type PushData = {
  type?: string;
  relatedId?: string | number;
  notificationId?: string | number;
  unreadCount?: string | number;
  silent?: string | boolean;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function syncBadgeFromData(data: PushData | undefined) {
  const unreadCount = toNumber(data?.unreadCount);
  if (unreadCount == null) return;
  try {
    await Notifications.setBadgeCountAsync(unreadCount);
  } catch (e) {
    console.log("[Push] setBadgeCountAsync ERROR", e);
  }
}

function getRouteFromPushData(data: PushData | undefined) {
  const type = typeof data?.type === "string" ? data.type : "";
  const relatedId = toNumber(data?.relatedId);

  switch (type) {
    case "LIKED_ON_COLLECTION":
    case "COMMENTED_ON_COLLECTION":
    case "COMMENT_ON_COLLECTION":
    case "REPLIED_TO_COMMENT":
    case "REPLIED_ON_COMMENT":
    case "SUGGESTED_BIRD_ID_ON_COLLECTION":
    case "BIRD_ID_SUGGESTED_ON_COLLECTION":
      return relatedId
        ? {
            pathname: "/saerok/[collectionId]" as const,
            params: { collectionId: String(relatedId) },
          }
        : { pathname: "/saerok/notifications" as const };
    case "SYSTEM_PUBLISHED_ANNOUNCEMENT":
      return relatedId
        ? {
            pathname: "/announcement/[id]" as const,
            params: { id: String(relatedId) },
          }
        : { pathname: "/saerok/notifications" as const };
    case "SYSTEM_CONTENT_DELETED":
      return { pathname: "/saerok/notifications" as const };
    default:
      return null;
  }
}

function useNotificationObserver() {
  const router = useRouter();
  const lastHandledResponseIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleResponse = async (
      response: Notifications.NotificationResponse | null,
    ) => {
      if (!response) return;

      const identifier = response.notification.request.identifier;
      if (lastHandledResponseIdRef.current === identifier) return;
      lastHandledResponseIdRef.current = identifier;

      const data = response.notification.request.content.data as PushData | undefined;
      await syncBadgeFromData(data);

      const route = getRouteFromPushData(data);
      if (route) router.push(route as any);
    };

    Notifications.getLastNotificationResponseAsync()
      .then(handleResponse)
      .catch((e) =>
        console.log("[Push] getLastNotificationResponseAsync ERROR", e),
      );

    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        void syncBadgeFromData(notification.request.content.data as PushData);
      },
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        void handleResponse(response);
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router]);
}

export default function RootLayout() {
  const [loaded] = useAppFonts();
  useNotificationObserver();

  useEffect(() => {
    if (loaded) {
      applyDefaultTypography();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <RecoilRoot>
      <AuthProvider>
        <View style={styles.root}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" options={{ gestureEnabled: false }} />
            <Stack.Screen name="register" />
            <Stack.Screen name="register-agreement" />
            <Stack.Screen name="register-survey" />
            <Stack.Screen
              name="register-complete"
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="saerok/image-viewer"
              options={{
                presentation: "transparentModal",
                animation: "fade",
              }}
            />
          </Stack>
          <GlobalApiLoadingOverlay />
        </View>
      </AuthProvider>
    </RecoilRoot>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
