import * as React from "react";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  soft?: boolean;
};

export default function SaerokCirclesBg({
  width = 543,
  height = 500,
  soft = false,
}: Props) {
  if (soft) {
    return (
      <Svg width={width} height={height} viewBox="0 0 543 500" fill="none">
        <Circle cx="216.4" cy="216.4" r="244" fill="url(#softYellow)" />
        <Circle cx="433.49" cy="355.278" r="146" fill="url(#softBlue)" />
        <Circle cx="463" cy="235" r="118" fill="url(#softPale)" />
        <Defs>
          <RadialGradient
            id="softYellow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(216.4 216.4) rotate(90) scale(244)"
          >
            <Stop offset="0" stopColor="#F9E2BE" stopOpacity="0.95" />
            <Stop offset="0.58" stopColor="#F9E2BE" stopOpacity="0.62" />
            <Stop offset="1" stopColor="#F9E2BE" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="softBlue"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(433.49 355.278) rotate(90) scale(146)"
          >
            <Stop offset="0" stopColor="#91BFFF" stopOpacity="0.9" />
            <Stop offset="0.52" stopColor="#91BFFF" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#91BFFF" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="softPale"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(463 235) rotate(90) scale(118)"
          >
            <Stop offset="0" stopColor="#CDDDF3" stopOpacity="0.74" />
            <Stop offset="0.72" stopColor="#F3F3F3" stopOpacity="0.36" />
            <Stop offset="1" stopColor="#F3F3F3" stopOpacity="0" />
          </RadialGradient>
        </Defs>
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 543 500" fill="none">
      <Circle cx="216.4" cy="216.4" r="216.4" fill="#F9E2BE" />
      <Circle cx="433.49" cy="355.278" r="108.695" fill="#91BFFF" />
      <Circle
        cx="463"
        cy="235"
        r="79"
        fill="url(#paint0_linear_9099_39537)"
      />
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
