import { create } from "zustand";

type DexBookmarksState = {
  bookmarkedIds: Set<number>;
  setBookmarkedIds: (ids: number[]) => void;
  setBookmarked: (id: number, bookmarked: boolean) => void;
  toggleBookmarked: (id: number) => void;
};

export const useDexBookmarksState = create<DexBookmarksState>((set) => ({
  bookmarkedIds: new Set<number>(),
  setBookmarkedIds: (ids) =>
    set(() => ({
      bookmarkedIds: new Set(ids),
    })),
  setBookmarked: (id, bookmarked) =>
    set((state) => {
      const next = new Set(state.bookmarkedIds);
      if (bookmarked) next.add(id);
      else next.delete(id);
      return { bookmarkedIds: next };
    }),
  toggleBookmarked: (id) =>
    set((state) => {
      const next = new Set(state.bookmarkedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { bookmarkedIds: next };
    }),
}));
