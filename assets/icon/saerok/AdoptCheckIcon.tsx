import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function AdoptCheckIcon({
  width = 18,
  height = 18,
  color = "#0D0D0D",
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.5 10.5L11.5 14.5L21.5 4.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 3C14.0095 3 15.8645 3.65939 17.3623 4.77246L15.9287 6.20605C14.8085 5.44502 13.4563 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 11.5217 18.9508 11.0549 18.8594 10.6035L20.4805 8.98242C20.8162 9.92583 21 10.9414 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3ZM18.8252 6.1377C19.0845 6.43933 19.3249 6.75739 19.543 7.0918L18.0879 8.54688C17.8888 8.19663 17.6626 7.86387 17.4082 7.55469L18.8252 6.1377Z"
        fill={color}
      />
    </Svg>
  );
}
