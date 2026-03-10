import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
};

export default function HeartIcon({
  width = 22,
  height = 20,
  fillColor = "#FF234F",
  strokeColor = "#FF234F",
  strokeWidth = 2,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 20" fill="none">
      <Path
        d="M6 1C3.23858 1 1 3.2368 1 5.99603C1 8.22356 1.87466 13.51 10.4875 18.8548C10.7994 19.0484 11.2006 19.0484 11.5125 18.8548C20.1253 13.51 21 8.22356 21 5.99603C21 3.2368 18.7614 1 16 1C13.2386 1 11 4.0279 11 4.0279C11 4.0279 8.76142 1 6 1Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
