import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function AnnouncementIcon({
  width = 24,
  height = 24,
  color = "#F7BE65",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4.5V14" stroke={color} strokeWidth={2} />
      <Path
        d="M19 12C20 12 22 11.4 22 9C22 6.6 20 6 19 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M6.01084 10C6.01156 13.3409 5.65334 19.7091 9 22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M16.5967 2.4948L4.39504 5.0069C3.00061 5.29399 2 6.5216 2 7.94527V10.4297C2 11.8813 3.03943 13.1248 4.46812 13.3821L16.6454 15.5758C17.8722 15.7968 19 14.854 19 13.6075V4.45371C19 3.18701 17.8374 2.23936 16.5967 2.4948Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
