import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function SuggestionDisagreeIcon({
  width = 14,
  height = 14,
  color = "#FF234F",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M2.03906 2.03418L11.9557 11.9508"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M11.957 2.03418L2.04036 11.9508"
        stroke={color}
        strokeWidth={1.86667}
        strokeLinecap="round"
      />
    </Svg>
  );
}
