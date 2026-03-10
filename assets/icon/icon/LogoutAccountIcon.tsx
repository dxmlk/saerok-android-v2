import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number };

export default function LogoutAccountIcon({
  width = 24,
  height = 24,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 2H7C4.79086 2 3 3.79086 3 6V18C3 20.2091 4.79086 22 7 22H9"
        stroke="black"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M9 11C8.44772 11 8 11.4477 8 12C8 12.5523 8.44772 13 9 13L9 12L9 11ZM22.7071 12.7071C23.0976 12.3166 23.0976 11.6834 22.7071 11.2929L16.3431 4.92893C15.9526 4.53841 15.3195 4.53841 14.9289 4.92893C14.5384 5.31946 14.5384 5.95262 14.9289 6.34315L20.5858 12L14.9289 17.6569C14.5384 18.0474 14.5384 18.6805 14.9289 19.0711C15.3195 19.4616 15.9526 19.4616 16.3431 19.0711L22.7071 12.7071ZM9 12L9 13L22 13L22 12L22 11L9 11L9 12Z"
        fill="#0D0D0D"
      />
    </Svg>
  );
}
