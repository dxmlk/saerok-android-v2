import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function ExclamationIcon({
  width = 3,
  height = 11,
  color = "#2563EB",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 3 11" fill="none">
      <Path
        d="M2.45801 0.101562L2.3623 7.21094H1.21387L1.11816 0.101562H2.45801ZM1.78809 10.082C1.30957 10.082 0.899414 9.68555 0.913086 9.19336C0.899414 8.71484 1.30957 8.31836 1.78809 8.31836C2.2666 8.31836 2.66309 8.71484 2.66309 9.19336C2.66309 9.68555 2.2666 10.082 1.78809 10.082Z"
        fill={color}
      />
    </Svg>
  );
}
