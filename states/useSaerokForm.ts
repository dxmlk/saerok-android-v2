import { create } from "zustand";

export type AccessLevel = "PUBLIC" | "PRIVATE";

export type SaerokImageFile = {
  uri: string;
  name: string;
  type: string;
};

export type SaerokFormState = {
  birdName: string;
  birdId: number | null;

  address: string;
  locationAlias: string;
  latitude: number | null;
  longitude: number | null;

  date: string; // YYYY-MM-DD
  memo: string;

  imageFile: SaerokImageFile | null;
  imagePreviewUrl: string | null;
  imageId: number | null;

  accessLevel: AccessLevel;
};

type AddressDetailsPayload = {
  address: string;
  locationAlias: string;
  latitude: number;
  longitude: number;
};

type SaerokFormStore = {
  form: SaerokFormState;

  setBirdName: (name: string | null) => void;
  setBirdId: (id: number | null) => void;

  setAddress: (addr: string) => void;
  setLocationAlias: (alias: string) => void;
  setLatitude: (lat: number | null) => void;
  setLongitude: (lng: number | null) => void;

  setDate: (date: string) => void;
  setMemo: (memo: string) => void;

  setImageFile: (file: SaerokImageFile | null) => void;
  setImagePreviewUrl: (url: string | null) => void;
  setImageId: (id: number | null) => void;

  setAccessLevel: (access: AccessLevel) => void;

  setAddressDetails: (payload: AddressDetailsPayload) => void;

  resetForm: () => void;
};

const defaultForm: SaerokFormState = {
  birdName: "",
  birdId: null,

  address: "",
  locationAlias: "",
  latitude: null,
  longitude: null,

  date: "",
  memo: "",

  imageFile: null,
  imagePreviewUrl: null,
  imageId: null,

  accessLevel: "PUBLIC",
};

export const useSaerokForm = create<SaerokFormStore>((set) => ({
  form: defaultForm,

  setBirdName: (name) =>
    set((s) => ({ form: { ...s.form, birdName: name ?? "" } })),

  setBirdId: (id) => set((s) => ({ form: { ...s.form, birdId: id } })),

  setAddress: (addr) => set((s) => ({ form: { ...s.form, address: addr } })),
  setLocationAlias: (alias) =>
    set((s) => ({ form: { ...s.form, locationAlias: alias } })),
  setLatitude: (lat) => set((s) => ({ form: { ...s.form, latitude: lat } })),
  setLongitude: (lng) => set((s) => ({ form: { ...s.form, longitude: lng } })),

  setDate: (date) => set((s) => ({ form: { ...s.form, date } })),
  setMemo: (memo) => set((s) => ({ form: { ...s.form, memo } })),

  setImageFile: (file) =>
    set((s) => ({ form: { ...s.form, imageFile: file } })),
  setImagePreviewUrl: (url) =>
    set((s) => ({ form: { ...s.form, imagePreviewUrl: url } })),
  setImageId: (id) => set((s) => ({ form: { ...s.form, imageId: id } })),

  setAccessLevel: (access) =>
    set((s) => ({ form: { ...s.form, accessLevel: access } })),

  setAddressDetails: ({ address, locationAlias, latitude, longitude }) =>
    set((s) => ({
      form: { ...s.form, address, locationAlias, latitude, longitude },
    })),

  resetForm: () => set({ form: defaultForm }),
}));
