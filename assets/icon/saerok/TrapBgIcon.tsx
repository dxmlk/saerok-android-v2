import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function TrapBgIcon({
  width = 127,
  height = 60,
  color = "#FEFEFE",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 127 60" fill="none">
      <Path
        d="M15.2133 13.7506C17.9124 5.54535 25.5741 0 34.2119 0H107C118.046 0 127 8.95431 127 20V60H0L15.2133 13.7506Z"
        fill={color}
      />
    </Svg>
  );
}
