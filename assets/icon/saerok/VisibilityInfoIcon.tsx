import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function VisibilityInfoIcon({
  width = 17,
  height = 17,
  color = "#F7BE65",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 17" fill="none">
      <Path
        d="M8.65856 7C2.25758 7 2.00996 7 2.00039 14.9954C1.99972 15.5477 2.44772 16 3 16H14C14.5523 16 15.0003 15.5477 14.9996 14.9954C14.9905 7 14.7547 7 8.65856 7Z"
        fill={color}
      />
      <Path d="M5 5C5 3.34315 6.34315 2 8 2H8.5C10.433 2 12 3.567 12 5.5V9" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
