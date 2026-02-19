import * as React from "react";
import Svg, { Path, Rect } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  background?: string;
  backgroundOpacity?: number;
};

export default function SearchIcon({
  width = 40,
  height = 40,
  stroke = "#0D0D0D",
  strokeWidth = 2,
  background = "#FEFEFE",
  backgroundOpacity = 0.6,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      {/* background */}
      <Rect
        x={0}
        y={0}
        width={40}
        height={40}
        rx={20}
        fill={background}
        opacity={backgroundOpacity}
      />

      {/* magnifier circle */}
      <Path
        d="M19.7393 10.999C24.5647 10.999 28.4785 14.9165 28.4785 19.751C28.4783 24.5853 24.5646 28.502 19.7393 28.502C14.914 28.5019 11.0002 24.5852 11 19.751C11 14.9165 14.9139 10.9991 19.7393 10.999Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* handle */}
      <Path
        d="M26.0645 26.2471L30.0007 29.9985"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
