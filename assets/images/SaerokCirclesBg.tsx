import * as React from "react";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
};

export default function SaerokCirclesBg({ width = 543, height = 464 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 543 464" fill="none">
      <Circle cx="216.4" cy="216.4" r="216.4" fill="#F9E2BE" />
      <Circle cx="433.49" cy="355.278" r="108.695" fill="#91BFFF" />
      <Circle cx="463" cy="235" r="79" fill="url(#paint0_linear_9099_39537)" />
      <Defs>
        <LinearGradient
          id="paint0_linear_9099_39537"
          x1="719.585"
          y1="94.1898"
          x2="314.502"
          y2="185.436"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CDDDF3" />
          <Stop offset="0.837491" stopColor="#F3F3F3" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}
