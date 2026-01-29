import { create } from "zustand";

export type SelectedFilters = {
  seasons: string[];
  habitats: string[];
  sizeCategories: string[];
};

type DexState = {
  searchTerm: string;
  filters: SelectedFilters;
  setSearchTerm: (v: string) => void;
  setFilters: (next: SelectedFilters) => void;
  patchFilters: (k: keyof SelectedFilters, vals: string[]) => void;
  reset: () => void;
};

const initial: Pick<DexState, "searchTerm" | "filters"> = {
  searchTerm: "",
  filters: { seasons: [], habitats: [], sizeCategories: [] },
};

export const useDexStore = create<DexState>((set) => ({
  ...initial,
  setSearchTerm: (v) => set({ searchTerm: v }),
  setFilters: (next) => set({ filters: next }),
  patchFilters: (k, vals) =>
    set((s) => ({ filters: { ...s.filters, [k]: vals } })),
  reset: () => set({ ...initial }),
}));
