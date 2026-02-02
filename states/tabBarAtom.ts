import { atom } from "recoil";

export const tabBarHeightAtom = atom<number>({
  key: "tabBarHeightAtom",
  default: 0,
});
