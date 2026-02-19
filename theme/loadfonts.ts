import { useFonts } from "expo-font";

export function useAppFonts() {
  return useFonts({
    "Pretendard-Light": require("@/assets/fonts/Pretendard-Light.ttf"),
    "Pretendard-Regular": require("@/assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-Medium": require("@/assets/fonts/Pretendard-Medium.ttf"),
    "Pretendard-SemiBold": require("@/assets/fonts/Pretendard-SemiBold.ttf"),
    "Pretendard-Bold": require("@/assets/fonts/Pretendard-Bold.ttf"),
    "Moneygraphy-Rounded": require("@/assets/fonts/Moneygraphy-Rounded.ttf"),
    Jalpullineunharu: require("@/assets/fonts/Jalpullineunharu.ttf"),
  });
}
