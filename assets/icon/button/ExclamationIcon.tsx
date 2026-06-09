import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function ExclamationIcon({
  width = 30,
  height = 30,
  color = "#91BFFF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
      <Circle cx="15" cy="15" r="13" stroke={color} strokeWidth="2" />
      <Path
        d="M15 7.36523L15 17.4912"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle
        cx="15"
        cy="21.8711"
        r="1.5"
        fill={color}
      />
    </Svg>
  );
}
