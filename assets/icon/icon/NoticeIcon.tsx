import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function NoticeIcon({
  width = 24,
  height = 24,
  color = "#F6C343",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 18L12 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="7.5" r="1.5" fill={color} />
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
