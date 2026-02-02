import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
};

export default function DexIcon({
  width = 25,
  height = 25,
  stroke = "currentColor",
  fill = "none",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill={fill}>
      <Path
        d="M12.5766 7.02221L20.0384 4.62377C21.3294 4.20879 22.6504 5.17174 22.6504 6.52782V19.5457C22.6504 19.9706 22.382 20.349 21.981 20.4895L12.5766 23.7842M12.5766 7.02221L5.27064 4.63893C3.97797 4.21725 2.65039 5.18061 2.65039 6.54032V19.5492C2.65039 19.9723 2.91671 20.3497 3.31539 20.4914L12.5766 23.7842M12.5766 7.02221V23.7842"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
