import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
};

export default function ScrapIcon({
  width = 24,
  height = 24,
  stroke = "#0D0D0D",
  fill = "none",
  strokeWidth = 2,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.5 1.5L7.5 1.5C5.84315 1.5 4.5 2.84315 4.5 4.5L4.5 22.3199C4.5 22.7615 5.03056 22.9863 5.3478 22.6792L11.6522 16.5752C11.8461 16.3875 12.1539 16.3875 12.3478 16.5752L18.6522 22.6792C18.9694 22.9863 19.5 22.7615 19.5 22.3199L19.5 4.5C19.5 2.84315 18.1569 1.5 16.5 1.5Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </Svg>
  );
}
