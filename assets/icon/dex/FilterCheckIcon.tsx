import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function FilterCheckIcon({
  width = 12,
  height = 12,
  color = "#91BFFF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 12" fill="none">
      <G clipPath="url(#clip0_filter_check)">
        <Path
          d="M1.43164 6.23926L4.0425 8.85011L10.5696 2.32297"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_filter_check">
          <Rect width={12} height={12} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

