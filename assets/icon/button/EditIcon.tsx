import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function EditIcon({
  width = 24,
  height = 24,
  color = "#0D0D0D",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.6389 5.9332L16.1274 3.49923C16.6994 2.93971 17.61 2.92774 18.1965 3.47203L20.8475 5.93196C21.475 6.51429 21.4887 7.50289 20.8775 8.10237L18.364 10.5677M13.6389 5.9332L3.82771 15.5293C3.63616 15.7167 3.49828 15.9519 3.42843 16.2106L2.56839 19.3953C2.29422 20.4105 3.1227 21.3854 4.16886 21.2786L7.30147 20.9588C7.63993 20.9242 7.95659 20.7756 8.19947 20.5374L18.364 10.5677M13.6389 5.9332L18.364 10.5677"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
