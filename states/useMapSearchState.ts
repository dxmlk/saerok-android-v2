import { create } from "zustand";

type Center = {
  latitude: number;
  longitude: number;
};

type MapSearchState = {
  selectedCenter: Center | null;
  setSelectedCenter: (center: Center | null) => void;
};

export const useMapSearchState = create<MapSearchState>((set) => ({
  selectedCenter: null,
  setSelectedCenter: (center) => set({ selectedCenter: center }),
}));
