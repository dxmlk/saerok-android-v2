import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
};

export default function NestSearchIcon({ width = 17, height = 17 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 17" fill="none">
      <Path
        d="M8.30469 2C11.785 2.0002 14.6083 4.82553 14.6084 8.31348C14.6084 11.8015 11.7851 14.6268 8.30469 14.627C4.82412 14.627 2 11.8016 2 8.31348C2.00012 4.82541 4.82419 2 8.30469 2Z"
        stroke="#DAE0DE"
        strokeWidth="2"
      />
      <Path
        d="M13.0469 13.1865L15.9989 16.0001"
        stroke="#DAE0DE"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
