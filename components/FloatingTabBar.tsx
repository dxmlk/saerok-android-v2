import DexIcon from "@/assets/icon/nav/dex.svg";
import MapIcon from "@/assets/icon/nav/map.svg";
import MyIcon from "@/assets/icon/nav/my.svg";
import NestIcon from "@/assets/icon/nav/NestIcon";
import SaerokIcon from "@/assets/icon/nav/saerok.svg";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONS: Record<string, React.FC<any>> = {
  saerok: SaerokIcon,
  dex: DexIcon,
  nest: NestIcon,
  map: MapIcon,
  my: MyIcon,
};

const LABELS: Record<string, string> = {
  saerok: "새록",
  dex: "도감",
  nest: "둥지",
  map: "지도",
  my: "마이",
};

export default function FloatingTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ bottom: insets.bottom + 12 }}
      className="absolute left-0 right-0 items-center"
      pointerEvents="box-none"
    >
      <View className="flex-row items-center justify-between px-6 py-3 bg-white rounded-full shadow-lg">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const name = route.name;
          const isCenter = name === "nest";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = ICONS[name];
          const color = isFocused ? "#91BFFF" : "#979797";

          // NestIcon 점 색깔 바꾸기 위해
          const iconProps =
            name === "nest" ? { dotColor: isFocused ? "#ffffff" : color } : {};

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className={`flex-1 items-center justify-center ${
                isCenter ? "" : "gap-1"
              }`}
            >
              <>
                <Icon
                  width={24}
                  height={24}
                  color={color}
                  stroke={color}
                  fill={isFocused ? color : "none"}
                  {...iconProps}
                />
                <Text className="text-[11px]" style={{ color }}>
                  {LABELS[name]}
                </Text>
              </>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
