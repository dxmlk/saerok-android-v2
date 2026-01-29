import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  dotColor?: string;
};

export default function NestIcon({
  width = 24,
  height = 25,
  stroke = "currentColor",
  fill = "none",
  dotColor = stroke,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 25" fill="none">
      <Path
        d="M20 2.5H4C2.89543 2.5 2 3.39543 2 4.5V15.29C2 16.3946 2.89543 17.29 4 17.29H8.15217C8.52654 17.29 8.86955 17.4991 9.04106 17.8319L11.1026 21.8317C11.4692 22.5432 12.4815 22.557 12.8675 21.8558L15.0959 17.8078C15.2717 17.4884 15.6074 17.29 15.9719 17.29H20C21.1046 17.29 22 16.3946 22 15.29V4.5C22 3.39543 21.1046 2.5 20 2.5Z"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        fill={fill}
      />
      <Circle cx={7.07812} cy={10.2686} r={0.960938} fill={dotColor} />
      <Circle cx={12} cy={10.2686} r={0.960938} fill={dotColor} />
      <Circle cx={16.9219} cy={10.2686} r={0.960938} fill={dotColor} />
    </Svg>
  );
}
