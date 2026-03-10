import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function ScrollTopChevronIcon({
  width = 24,
  height = 24,
  color = "#0D0D0D",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 15L10.5853 6.41425C11.3663 5.63318 12.6326 5.63315 13.4137 6.41417L22 15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
