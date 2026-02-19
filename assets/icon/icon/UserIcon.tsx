import * as React from "react";
import Svg, { Ellipse, Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

export default function UserIcon({
  width = 24,
  height = 24,
  color = "#F6C343",
  strokeWidth = 2,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.7317 14.0322C5.39399 14.0322 2.4593 17.0246 2.05018 21.0009C1.99366 21.5503 2.44772 21.9999 3 21.9999H20C20.5523 21.9999 21.0062 21.5508 20.9448 21.0019C20.5509 17.478 17.9983 14.0322 11.7317 14.0322Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Ellipse
        cx="11.5"
        cy="6.70588"
        rx="4.75"
        ry="4.70588"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
