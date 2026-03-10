import * as React from "react";
import Svg, { Circle } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function SuggestionAgreeIcon({
  width = 14,
  height = 14,
  color = "#4190FF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="5.41667" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
