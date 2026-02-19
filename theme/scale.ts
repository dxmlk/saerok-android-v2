import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const round = (size: number) => PixelRatio.roundToNearestPixel(size);

export const rs = (size: number, factor = 0.5) =>
  round(moderateScale(size, factor));
export const rvs = (size: number, factor = 0.5) =>
  round(size + (verticalScale(size) - size) * factor);
export const rfs = (size: number, factor = 0.2) =>
  round(moderateScale(size, factor) * PixelRatio.getFontScale());
