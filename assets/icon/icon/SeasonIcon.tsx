import * as React from "react";
import Svg, { Path, Rect } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function SeasonIcon({
  width = 24,
  height = 25,
  color = "#4190FF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 25" fill="none">
      <Rect
        x={8.23828}
        y={8.43164}
        width={7.60117}
        height={7.72424}
        rx={3.80058}
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M22.5879 12.2942L20.2431 12.2942"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M3.75586 12.2942L1.41106 12.2942"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 1.70605L12 4.05089"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 20.5374L12 22.8822"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M19.4883 4.80664L17.8303 6.46469"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M6.17188 18.1233L4.51385 19.7813"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M19.4883 19.7817L17.8303 18.1237"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M6.17188 6.46387L4.51385 4.80582"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
