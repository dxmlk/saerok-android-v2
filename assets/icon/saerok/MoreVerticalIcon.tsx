import * as React from "react";
import Svg, { Rect } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function MoreVerticalIcon({
  width = 24,
  height = 24,
  color = "#0D0D0D",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="10.2051" y="3.5" width="3" height="3" rx="1.5" fill={color} />
      <Rect x="10.2051" y="10.5" width="3" height="3" rx="1.5" fill={color} />
      <Rect x="10.2051" y="17.5" width="3" height="3" rx="1.5" fill={color} />
    </Svg>
  );
}
