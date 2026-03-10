import { upsertNotificationTokenApi } from "@/services/api/notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getOrCreateNotificationDeviceId } from "./deviceId";

let didConfigureChannel = false;
let lastRegisteredToken = "";

export async function configureNotificationChannelIfNeeded() {
  if (Platform.OS !== "android" || didConfigureChannel) return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4190FF",
  });
  didConfigureChannel = true;
}

function getExpoProjectId(): string | undefined {
  const easProjectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  return easProjectId;
}

export async function registerPushTokenToServer() {
  if (!Device.isDevice) return;

  await configureNotificationChannelIfNeeded();

  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;

  if (finalStatus !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    finalStatus = req.status;
  }

  if (finalStatus !== "granted") return;

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.log("[Push] missing eas projectId");
    return;
  }

  const tokenRes = await Notifications.getExpoPushTokenAsync({ projectId });
  const expoPushToken = tokenRes.data;
  if (!expoPushToken || expoPushToken === lastRegisteredToken) return;

  const deviceId = await getOrCreateNotificationDeviceId();
  await upsertNotificationTokenApi({
    deviceId,
    token: expoPushToken,
    platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
  });

  lastRegisteredToken = expoPushToken;
}

