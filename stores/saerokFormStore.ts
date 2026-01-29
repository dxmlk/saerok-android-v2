import { create } from "zustand";

export type SaerokImage = { uri: string; name: string; type: string };

export type SaerokFormState = {
  birdId: number | null;
  birdName: string;

  date: string; // YYYY-MM-DD
  latitude: number | null;
  longitude: number | null;
  locationAlias: string;
  address: string;

  memo: string;
  accessLevel: "PUBLIC" | "PRIVATE";

  image: SaerokImage | null;

  reset: () => void;
  setBird: (birdId: number | null, birdName: string) => void;
  setPlace: (p: {
    latitude: number;
    longitude: number;
    address: string;
    locationAlias: string;
  }) => void;
  setDate: (d: string) => void;
  setMemo: (m: string) => void;
  setAccess: (a: "PUBLIC" | "PRIVATE") => void;
  setImage: (img: SaerokImage | null) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

const initial = (): Omit<SaerokFormState, keyof SaerokFormState> & any => ({
  birdId: null,
  birdName: "",
  date: today(),
  latitude: null,
  longitude: null,
  locationAlias: "",
  address: "",
  memo: "",
  accessLevel: "PUBLIC",
  image: null,
});

export const useSaerokFormStore = create<SaerokFormState>((set) => ({
  ...initial(),
  reset: () => set({ ...initial(), date: today() }),

  setBird: (birdId, birdName) => set({ birdId, birdName }),
  setPlace: ({ latitude, longitude, address, locationAlias }) =>
    set({ latitude, longitude, address, locationAlias }),

  setDate: (d) => set({ date: d }),
  setMemo: (m) => set({ memo: m }),
  setAccess: (a) => set({ accessLevel: a }),
  setImage: (img) => set({ image: img }),
}));
