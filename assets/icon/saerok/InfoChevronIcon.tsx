import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function InfoChevronIcon({
  width = 17,
  height = 17,
  color = "#979797",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 17" fill="none">
      <Path
        d="M4.68432 2.47678C4.30894 2.10972 4.30908 1.50569 4.68463 1.1388C5.04818 0.783644 5.62879 0.78373 5.99223 1.139L12.6292 7.6266C12.7467 7.74079 12.8399 7.87658 12.9036 8.02616C12.9672 8.17574 13 8.33614 13 8.49815C13 8.66015 12.9672 8.82056 12.9036 8.97014C12.8399 9.11971 12.7467 9.25551 12.6292 9.3697L5.99218 15.8607C5.62884 16.2161 5.04819 16.2161 4.68482 15.8608C4.30979 15.4941 4.30976 14.8906 4.68475 14.5239L10.844 8.5L4.68432 2.47678Z"
        fill={color}
      />
    </Svg>
  );
}
