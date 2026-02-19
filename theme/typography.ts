export const font = {
  light: "Pretendard-Light",
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semibold: "Pretendard-SemiBold",
  bold: "Pretendard-Bold",
  money: "Moneygraphy-Rounded",
  haru: "Jalpullineunharu",
} as const;

export const textStyle = {
  h1: { fontFamily: font.bold, fontSize: 24, lineHeight: 32 },
  h2: { fontFamily: font.bold, fontSize: 20, lineHeight: 28 },
  title: { fontFamily: font.semibold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: font.regular, fontSize: 12, lineHeight: 16 },
} as const;
