import AsyncStorage from "@react-native-async-storage/async-storage";

export type SaerokActionButtonVariant = "horizontal" | "vertical";

const STORAGE_KEY = "saerok.actionButtonVariant.v1";

let cachedVariant: SaerokActionButtonVariant | null = null;

function createVariant(): SaerokActionButtonVariant {
  return Math.random() < 0.5 ? "horizontal" : "vertical";
}

export async function getSaerokActionButtonVariant() {
  if (cachedVariant) return cachedVariant;

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored === "horizontal" || stored === "vertical") {
    cachedVariant = stored;
    return stored;
  }

  const next = createVariant();
  cachedVariant = next;
  await AsyncStorage.setItem(STORAGE_KEY, next);
  return next;
}

export async function clearSaerokActionButtonVariant() {
  cachedVariant = null;
  await AsyncStorage.removeItem(STORAGE_KEY);
}
