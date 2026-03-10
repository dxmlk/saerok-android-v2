import * as React from "react";
import Svg, { Rect, Path, G } from "react-native-svg";

type Props = {
  size?: number;
  withBackground?: boolean;
};

export default function BackButtonIcon({
  size = 40,
  withBackground = true,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {withBackground ? (
        <Rect
          x={0}
          y={0}
          width={40}
          height={40}
          rx={20}
          fill="#FEFEFE"
          fillOpacity={0.6}
        />
      ) : null}
      <G transform="translate(11.5 11.5)">
        <Path
          d="M12.3157 14.5232C12.6911 14.8903 12.6909 15.4943 12.3154 15.8612C11.9518 16.2164 11.3712 16.2163 11.0078 15.861L4.37084 9.3734C4.25332 9.25921 4.16005 9.12342 4.09641 8.97384C4.03276 8.82426 4 8.66386 4 8.50185C4 8.33985 4.03276 8.17944 4.09641 8.02986C4.16005 7.88029 4.25332 7.74449 4.37084 7.6303L11.0078 1.13928C11.3712 0.783932 11.9518 0.783907 12.3152 1.13923C12.6902 1.50594 12.6902 2.10936 12.3152 2.4761L6.15597 8.5L12.3157 14.5232Z"
          fill="#0D0D0D"
        />
      </G>
    </Svg>
  );
}
