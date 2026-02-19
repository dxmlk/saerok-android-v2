import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function KakaoLogo({
  width = 20,
  height = 20,
  color = "#000000",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <G clipPath="url(#clip0_2584_6787)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.1719 0.913086C4.79435 0.913086 0.435547 4.28071 0.435547 8.43413C0.435547 11.0172 2.12144 13.2944 4.68871 14.6488L3.60853 18.5947C3.51309 18.9434 3.91185 19.2213 4.21806 19.0193L8.95301 15.8942C9.35258 15.9328 9.75867 15.9553 10.1719 15.9553C15.5489 15.9553 19.908 12.5878 19.908 8.43413C19.908 4.28071 15.5489 0.913086 10.1719 0.913086Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2584_6787">
          <Rect
            width="19.4725"
            height="19.4726"
            fill="#fff"
            transform="translate(0.435547 0.263672)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
