import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "notification_device_id";

const randomDeviceId = () =>
  `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export async function getOrCreateNotificationDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    id = randomDeviceId();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  }
  return id;
}

