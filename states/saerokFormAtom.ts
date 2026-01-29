import { atom } from "recoil";

export type SaerokImageFile = {
  uri: string; // expo-image-picker 결과 uri
  name: string; // 예: "photo.jpg"
  type: string; // 예: "image/jpeg"
};

export type SaerokFormState = {
  birdName: string | null;
  birdId: number | null;
  address: string;
  locationAlias: string;
  latitude: number | null;
  longitude: number | null;
  date: string; // "YYYY-MM-DD"
  memo: string;
  imageFile: SaerokImageFile | null;
  imagePreviewUrl: string | null; // RN에서는 보통 uri를 그대로 넣어도 OK
  imageId: number | null; // 서버가 주는 imageId 유지
  accessLevel: "PUBLIC" | "PRIVATE";
};

export const saerokFormState = atom<SaerokFormState>({
  key: "saerokFormState",
  default: {
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
  },
});
