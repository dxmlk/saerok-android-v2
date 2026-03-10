import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
};

export default function CommentIcon({
  width = 20,
  height = 20,
  color = "#0D0D0D",
  fillColor = "none",
  strokeWidth = 2,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 11.6393 1.43827 13.1762 2.20404 14.5L1.45 18.55L5.5 17.796C6.82378 18.5617 8.36071 19 10 19Z"
        fill={fillColor}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
