import * as React from "react";
import Svg, { Rect, Defs, ClipPath, ForeignObject } from "react-native-svg";

type Props = {
  size?: number;
};

export default function OptionButtonIcon({ size = 40 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ForeignObject x={-4} y={-4} width={48} height={48} />
      <Rect
        x={0.5}
        y={0.5}
        width={39}
        height={39}
        rx={19.5}
        fill="#FEFEFE"
        fillOpacity={0.6}
        stroke="#F2F2F2"
      />
      <Rect x={18.2051} y={11.5} width={3} height={3} rx={1.5} fill="#0D0D0D" />
      <Rect x={18.2051} y={18.5} width={3} height={3} rx={1.5} fill="#0D0D0D" />
      <Rect x={18.2051} y={25.5} width={3} height={3} rx={1.5} fill="#0D0D0D" />
      <Defs>
        <ClipPath id="clip">
          <Rect x={0.5} y={0.5} width={39} height={39} rx={19.5} />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
