import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function CloseLineIcon({
  width = 24,
  height = 24,
  color = "#0D0D0D",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d="M3.5 3.4873L20.5 20.4873" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M20.5 3.4873L3.5 20.4873" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
