import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function ScrapIcon({
  width = 17,
  height = 24,
  color = "#6B7280",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 24" fill="none">
      <Path
        d="M13 0.999023H4C2.34315 0.999023 1 2.34217 1 3.99902V21.819C1 22.2605 1.53056 22.4853 1.8478 22.1782L8.1522 16.0742C8.34608 15.8865 8.65392 15.8865 8.8478 16.0742L15.1522 22.1782C15.4694 22.4853 16 22.2605 16 21.819V3.99902C16 2.34217 14.6569 0.999023 13 0.999023Z"
        fill={color}
      />
    </Svg>
  );
}
