import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = { width?: number; height?: number; color?: string };

export default function HabitatIcon({
  width = 24,
  height = 24,
  color = "#4190FF",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.60742 4.14209C9.26123 2.76236 11.2401 2.78023 11.8691 4.17236V4.17334L14.9434 10.9771L15.4453 12.0864L16.4355 11.3804C16.6477 11.2291 16.8935 11.1242 17.1553 11.0757C17.4171 11.0272 17.6869 11.0363 17.9443 11.1021C18.2017 11.1678 18.4392 11.288 18.6396 11.4526C18.84 11.6172 18.9981 11.8222 19.1045 12.0503L19.1094 12.0601L22.1172 18.3198C22.6772 19.4878 21.841 20.8823 20.4961 20.8823H3.50098C2.20337 20.8822 1.3774 19.5809 1.83008 18.438L1.87793 18.3276L8.60645 4.14209H8.60742Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
