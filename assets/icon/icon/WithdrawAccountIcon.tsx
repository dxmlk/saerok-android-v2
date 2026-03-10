import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type Props = { width?: number; height?: number };

export default function WithdrawAccountIcon({
  width = 24,
  height = 24,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.5" stroke="#C73526" strokeWidth={2} />
      <Path
        d="M12 7V13"
        stroke="#C73526"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="16.5" r="1.2" fill="#C73526" />
    </Svg>
  );
}
