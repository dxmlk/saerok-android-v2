import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  stroke?: string;
};

export default function LoginIcon({
  width = 24,
  height = 24,
  stroke = "#FFFFFF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.71289 17.4233V17.4233C7.71289 19.951 9.76193 22 12.2896 22L16.9986 22C19.76 22 21.9986 19.7614 21.9986 17L21.9986 11.4737"
        stroke={stroke}
        strokeWidth={2}
      />
      <Path
        d="M7.71289 6.57666V6.57666C7.71289 4.04904 9.76193 2 12.2896 2L16.9986 2C19.76 2 21.9986 4.23858 21.9986 7L21.9986 12.5263"
        stroke={stroke}
        strokeWidth={2}
      />
      <Path
        d="M18.0352 12L1.99831 12M18.0352 12L14.0352 16M18.0352 12L14.0352 8"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
