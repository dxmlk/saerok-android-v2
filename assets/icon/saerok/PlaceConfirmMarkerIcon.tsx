import Svg, { Circle, Defs, G, Path, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite, FeBlend } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
};

export default function PlaceConfirmMarkerIcon({
  width = 71,
  height = 85,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 71 85" fill="none">
      <Defs>
        <Filter id="f" x="0" y="0" width="71" height="85.5869" filterUnits="userSpaceOnUse">
          <FeFlood floodOpacity="0" result="BackgroundImageFix" />
          <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <FeOffset />
          <FeGaussianBlur stdDeviation="5" />
          <FeComposite in2="hardAlpha" operator="out" />
          <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </Filter>
      </Defs>
      <G filter="url(#f)">
        <Path
          d="M35.5 10.1748C42.2163 10.1748 48.6578 12.8571 53.4072 17.6309C58.1566 22.4047 60.8252 28.8794 60.8252 35.6309C60.8252 43.1116 56.9318 50.8432 52.1729 57.4941C47.4173 64.1404 41.815 69.6829 38.4346 72.7822C36.7559 74.3212 34.2441 74.3212 32.5654 72.7822C29.185 69.6829 23.5827 64.1404 18.8271 57.4941C14.0682 50.8432 10.1748 43.1116 10.1748 35.6309C10.1748 28.8794 12.8434 22.4047 17.5928 17.6309C22.3422 12.8571 28.7837 10.1748 35.5 10.1748ZM35.5 26.3018C33.0381 26.3018 30.6772 27.2848 28.9365 29.0342C27.1959 30.7837 26.2178 33.157 26.2178 35.6309C26.2178 38.1047 27.1959 40.477 28.9365 42.2266C30.6772 43.9762 33.0379 44.96 35.5 44.96C36.7191 44.96 37.9265 44.7179 39.0527 44.249C40.1788 43.7801 41.2017 43.0928 42.0635 42.2266C42.9253 41.3603 43.6098 40.3319 44.0762 39.2002C44.5425 38.0686 44.7822 36.8556 44.7822 35.6309C44.7822 33.157 43.8041 30.7837 42.0635 29.0342C40.3228 27.2848 37.9619 26.3018 35.5 26.3018Z"
          fill="#F7BE65"
          stroke="#DAE0DE"
          strokeWidth={0.35}
        />
        <Circle cx={35.4995} cy={35.4995} r={17.6538} fill="#FEFEFE" />
        <Circle cx={35.5} cy={35.5} r={11.5} fill="#F7BE65" />
      </G>
    </Svg>
  );
}

