import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
};

export default function FreeBoardEntryArrowIcon({
  width = 24,
  height = 24,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.6843 18.0232C11.3089 18.3903 11.3091 18.9943 11.6846 19.3612C12.0482 19.7164 12.6288 19.7163 12.9922 19.361L19.6292 12.8734C19.7467 12.7592 19.8399 12.6234 19.9036 12.4738C19.9672 12.3243 20 12.1639 20 12.0019C20 11.8398 19.9672 11.6794 19.9036 11.5299C19.8399 11.3803 19.7467 11.2445 19.6292 11.1303L12.9922 4.63928C12.6288 4.28393 12.0482 4.28391 11.6848 4.63923C11.3098 5.00594 11.3098 5.60936 11.6848 5.9761L17.844 12L11.6843 18.0232Z"
        fill="#FEFEFE"
      />
      <Path
        d="M18 12H6"
        stroke="#FEFEFE"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
