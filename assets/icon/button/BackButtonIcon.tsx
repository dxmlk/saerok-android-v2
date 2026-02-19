import * as React from "react";
import Svg, {
  Rect,
  Path,
  Defs,
  ClipPath,
  ForeignObject,
} from "react-native-svg";

type Props = {
  size?: number;
};

export default function BackButtonIcon({ size = 40 }: Props) {
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
      <Path
        d="M23.3157 26.0232C23.6911 26.3903 23.6909 26.9943 23.3154 27.3612C22.9518 27.7164 22.3712 27.7163 22.0078 27.361L15.3708 20.8734C15.2533 20.7592 15.1601 20.6234 15.0964 20.4738C15.0328 20.3243 15 20.1639 15 20.0019C15 19.8398 15.0328 19.6794 15.0964 19.5299C15.1601 19.3803 15.2533 19.2445 15.3708 19.1303L22.0078 12.6393C22.3712 12.2839 22.9518 12.2839 23.3152 12.6392C23.6902 13.0059 23.6902 13.6094 23.3152 13.9761L17.156 20L23.3157 26.0232Z"
        fill="#0D0D0D"
      />
      <Defs>
        <ClipPath id="clip">
          <Rect x={0.5} y={0.5} width={39} height={39} rx={19.5} />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
