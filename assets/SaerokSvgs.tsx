import * as React from "react";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
} from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
};

export function YellowCircle({ width = 433, height = 434 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 433 434" fill="none">
      <Circle cx="216.4" cy="217.052" r="216.4" fill="#F9E2BE" />
    </Svg>
  );
}

export function PinkCircle({ width = 84, height = 158 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 84 158" fill="none">
      <Circle cx="79" cy="79" r="79" fill="url(#paint0_linear_2396_4963)" />
      <Defs>
        <LinearGradient
          id="paint0_linear_2396_4963"
          x1="335.585"
          y1="-61.8102"
          x2="-69.4984"
          y2="29.4359"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CDDDF3" />
          <Stop offset="0.837491" stopColor="#F3F3F3" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

export function BlueCircle({ width = 219, height = 218 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 219 218" fill="none">
      <Circle cx="109.492" cy="108.929" r="108.695" fill="#91BFFF" />
    </Svg>
  );
}

type SpeechBubbleProps = Props & {
  color?: string;
  textColor?: string;
};

export function SpeechBubbleIcon({
  width = 190,
  height = 56,
  color = "#FEFEFE",
  textColor = "#4190FF",
}: SpeechBubbleProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 190 56" fill="none">
      <Path
        d="M169.192 36.9482C170.728 36.9482 171.69 38.6062 170.93 39.9395L162.476 54.75C161.708 56.0947 159.769 56.0947 159.001 54.75L150.547 39.9395C149.786 38.6062 150.749 36.9483 152.284 36.9482H169.192Z"
        fill={color}
      />
      <Rect width="190" height="44" rx="10" fill={color} />
    </Svg>
  );
}
