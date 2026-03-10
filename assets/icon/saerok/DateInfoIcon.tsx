import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function DateInfoIcon({
  width = 17,
  height = 17,
  color = "#F7BE65",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 17" fill="none">
      <Path
        d="M8.5 1C12.6421 1 16 4.35786 16 8.5C16 12.6421 12.6421 16 8.5 16C4.35786 16 1 12.6421 1 8.5C1 4.35786 4.35786 1 8.5 1ZM8.5 4.34863C7.86497 4.34863 7.34977 4.86403 7.34961 5.49902V7.52441C7.34969 8.57154 7.96696 9.52096 8.92383 9.94629L11.4082 11.0498C11.9886 11.3076 12.6679 11.0461 12.9258 10.4658C13.1834 9.88553 12.922 9.20613 12.3418 8.94824L9.85742 7.84375C9.73142 7.78748 9.65047 7.66244 9.65039 7.52441V5.49902C9.65023 4.86403 9.13503 4.34863 8.5 4.34863Z"
        fill={color}
      />
    </Svg>
  );
}
