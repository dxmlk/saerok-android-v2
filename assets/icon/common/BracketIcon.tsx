import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function BracketIcon({
  width = 17,
  height = 17,
  color = "#0D0D0D",
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill="none"
    >
      <Path
        d="M12.6292 2.47678C13.0046 2.10972 13.0044 1.50569 12.6289 1.1388C12.2653 0.783644 11.6847 0.78373 11.3212 1.139L4.68423 7.6266C4.56673 7.74079 4.47351 7.87658 4.40986 8.02616C4.3462 8.17574 4.31338 8.33614 4.31338 8.49815C4.31338 8.66015 4.3462 8.82056 4.40986 8.97014C4.47351 9.11971 4.56673 9.25551 4.68423 9.3697L11.3212 15.8607C11.6846 16.2161 12.2652 16.2161 12.6286 15.8608C13.0036 15.4941 13.0036 14.8906 12.6286 14.5239L6.46936 8.5L12.6292 2.47678Z"
        fill={color}
      />
    </Svg>
  );
}
