import { fetchBookmarkListApi, toggleBookmarkApi } from "../services/api/birds";
import { create } from "zustand";

type BookmarkState = {
  ids: Set<number>;
  loading: boolean;
  sync: () => Promise<void>;
  toggle: (id: number) => Promise<void>;
};

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  ids: new Set<number>(),
  loading: false,

  sync: async () => {
    try {
      const res = await fetchBookmarkListApi();
      const list = res.data?.items ?? res.data ?? [];
      const ids = list.map((x: any) => (typeof x === "number" ? x : x.birdId));
      set({ ids: new Set(ids) });
    } catch {
      // 로그인 안 됐거나 토큰 없으면 조용히 무시
      set({ ids: new Set() });
    }
  },

  toggle: async (id: number) => {
    if (get().loading) return;
    set({ loading: true });

    // optimistic
    const prev = get().ids;
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ ids: next });

    try {
      await toggleBookmarkApi(id);
      // 필요하면 sync()로 서버와 재동기화 가능
    } catch {
      // rollback
      set({ ids: prev });
    } finally {
      set({ loading: false });
    }
  },
}));
