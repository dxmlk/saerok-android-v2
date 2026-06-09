import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function NestFabPlusIcon({
  width = 40,
  height = 40,
  color = "#FEFEFE",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path d="M8 20H32.9991" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <Path d="M20.5 7.5L20.5 32.4991" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}
