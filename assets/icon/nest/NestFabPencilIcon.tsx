import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
};

export default function NestFabPencilIcon({
  width = 36,
  height = 36,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
      <Path
        d="M18 30H31.5"
        stroke="#4190FF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24.75 5.25034C25.3467 4.6536 26.1561 4.31836 27 4.31836C27.4179 4.31836 27.8316 4.40066 28.2177 4.56057C28.6037 4.72048 28.9545 4.95487 29.25 5.25034C29.5455 5.54581 29.7799 5.89659 29.9398 6.28265C30.0997 6.6687 30.182 7.08248 30.182 7.50034C30.182 7.9182 30.0997 8.33198 29.9398 8.71803C29.7799 9.10409 29.5455 9.45487 29.25 9.75034L10.5 28.5003L4.5 30.0003L6 24.0003L24.75 5.25034Z"
        fill="#4190FF"
        stroke="#4190FF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
