import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

export default function SearchSmallIcon({
  width = 22,
  height = 22,
  color = "#D1D5DB",
  strokeWidth = 2,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
      <Path
        d="M10 3.5C13.5899 3.5 16.5 6.41015 16.5 10C16.5 13.5899 13.5899 16.5 10 16.5C6.41015 16.5 3.5 13.5899 3.5 10C3.5 6.41015 6.41015 3.5 10 3.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M15.5 15.5L19 19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
