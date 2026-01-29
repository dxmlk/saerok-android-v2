import AsyncStorage from "@react-native-async-storage/async-storage";

export type SearchRecord = { keyword: string; date: string };

const KEY = "searchHistory:dex";

export async function loadSearchHistory(): Promise<SearchRecord[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SearchRecord[];
  } catch {
    return [];
  }
}

export async function saveSearchHistory(list: SearchRecord[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function addSearchRecord(
  keyword: string,
): Promise<SearchRecord[]> {
  const trimmed = keyword.trim();
  const now = new Date();
  const date = `${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate(),
  ).padStart(2, "0")}.`;

  const prev = await loadSearchHistory();
  const updated = [...prev, { keyword: trimmed, date }];
  await saveSearchHistory(updated);
  return updated;
}

export async function deleteSearchRecordAt(
  reverseIndex: number,
): Promise<SearchRecord[]> {
  // 화면에서 reverse로 보여주면 index가 뒤집히므로 reverseIndex를 그대로 받아 처리
  const prev = await loadSearchHistory();
  const reversed = [...prev].reverse();
  const nextReversed = reversed.filter((_, i) => i !== reverseIndex);
  const next = nextReversed.reverse();
  await saveSearchHistory(next);
  return next;
}
