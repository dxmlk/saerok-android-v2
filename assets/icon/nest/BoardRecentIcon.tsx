import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number };

export default function BoardRecentIcon({ width = 17, height = 17 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 17" fill="none">
      <Path
        d="M8.5 14.875C12.0208 14.875 14.875 12.0208 14.875 8.5C14.875 4.97918 12.0208 2.125 8.5 2.125C4.97918 2.125 2.125 4.97918 2.125 8.5C2.125 9.52923 2.36891 10.5015 2.80207 11.3622C2.90937 11.5753 2.95385 11.8165 2.91016 12.0511L2.71054 13.1233C2.58201 13.8137 3.18635 14.418 3.87668 14.2895L4.94889 14.0898C5.18353 14.0462 5.42465 14.0906 5.63785 14.1979C6.4985 14.6311 7.47076 14.875 8.5 14.875Z"
        fill="#FEFEFE"
      />
    </Svg>
  );
}
