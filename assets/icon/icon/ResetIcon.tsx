import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function ResetIcon({
  width = 17,
  height = 17,
  color = "#0D0D0D",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 17" fill="none">
      <Path
        d="M15 9.475C14.5269 12.6023 11.8133 15 8.53652 15C4.9265 15 2 12.0899 2 8.5C2 4.91015 4.9265 2 8.53652 2C11.2169 2 13.5205 3.60432 14.5291 5.9M14.5291 5.9V2M14.5291 5.9H11.1511"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
