import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function CheckIcon({
  width = 13,
  height = 12,
  color = "#FFFFFF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 13 12" fill="none">
      <Path
        d="M2.0918 6.23926L4.70265 8.85011L11.2298 2.32297"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
