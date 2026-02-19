import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function NoticeIcon({
  width = 31,
  height = 30,
  color = "#4190FF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 31 30" fill="none">
      <Circle cx="15.5" cy="15" r="13" stroke={color} strokeWidth={2} />
      <Path
        d="M15.5 7.36523L15.5 17.4912"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="15.5" cy="21.8711" r="1.5" fill={color} />
    </Svg>
  );
}
