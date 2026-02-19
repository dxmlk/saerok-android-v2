import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function DocumentIcon({
  width = 24,
  height = 24,
  color = "#F6C343",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19V3C4 1.89543 4.89543 1 6 1H19C20.1046 1 21 1.89543 21 3V19C21 20.1046 20.1046 21 19 21H6C4.89543 21 4 20.1046 4 19Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 1.47607V3.54508C8 4.64965 8.89543 5.54508 10 5.54508H15C16.1046 5.54508 17 4.64965 17 3.54508V1.47607"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 10.1816H17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 13.4287H17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
