import AsyncStorage from "@react-native-async-storage/async-storage";

export type SearchRecord = { keyword: string; date: string };

const KEY = "dexSearchHistory_v1";

export async function loadDexHistory(): Promise<SearchRecord[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** 최신이 앞(삭제/표시가 단순) */
export async function addDexHistory(keyword: string) {
  const now = new Date();
  const date = `${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}.`;

  const prev = await loadDexHistory();
  const next = [
    { keyword, date },
    ...prev.filter((x) => x.keyword !== keyword),
  ];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function deleteDexHistoryAt(index: number) {
  const prev = await loadDexHistory();
  const next = prev.filter((_, i) => i !== index);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
