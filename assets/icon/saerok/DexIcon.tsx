import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function DexIcon({
  width = 22,
  height = 21.319,
  color = "#FEFEFE",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
      <Path
        d="M18.082 0.146041C20.0183 -0.476228 21.9994 0.967886 22 3.00151V16.0201C21.9999 16.8696 21.4629 17.6268 20.6611 17.9078L11.2568 21.2017L10.9238 21.3189L10.5908 21.2007L1.33008 17.9078C0.532775 17.6242 0 16.8692 0 16.023V3.0142C0.000432948 0.975025 1.9919 -0.469718 3.93066 0.162642L10.9297 2.44487L18.082 0.146041ZM11 4.58647C10.4478 4.58647 10.0002 5.03436 10 5.58647V17.5865C10 18.1388 10.4477 18.5865 11 18.5865C11.5523 18.5865 12 18.1388 12 17.5865V5.58647C11.9998 5.03436 11.5522 4.58647 11 4.58647Z"
        fill={color}
      />
    </Svg>
  );
}
