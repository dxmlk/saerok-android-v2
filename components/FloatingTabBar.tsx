import DexIcon from "@/assets/icon/nav/DexIcon";
import MapIcon from "@/assets/icon/nav/MapIcon";
import MyIcon from "@/assets/icon/nav/MyIcon";
import SaerokIcon from "@/assets/icon/nav/SaerokIcon";
import NestIcon from "@/assets/icon/nav/NestIcon";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tabBarHeightAtom } from "@/states/tabBarAtom";
import { useSetRecoilState } from "recoil";
import { rfs, rs } from "@/theme";

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
  const setTabBarHeight = useSetRecoilState(tabBarHeightAtom);

  return (
    <View
      pointerEvents="box-none"
      style={styles.wrapper}
      onLayout={(e) => {
        setTabBarHeight(e.nativeEvent.layout.height);
      }}
    >
      <View
        style={[
          styles.bar,
          {
            paddingBottom: Math.max(insets.bottom, rs(12)),
          },
        ]}
      >
        {state.routes.map((route, idx) => {
          const isFocused = state.index === idx;
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
          const iconProps =
            name === "nest" ? { dotColor: isFocused ? "#ffffff" : color } : {};

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.item, !isCenter && styles.itemGap]}
              hitSlop={rs(10)}
            >
              <Icon
                width={rs(24)}
                height={rs(24)}
                color={color}
                stroke={color}
                fill={isFocused ? color : "none"}
                {...iconProps}
              />
              <Text style={[styles.label, { color }]}>{LABELS[name]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "stretch",
  },
  bar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(24),
    paddingTop: rs(12),
    borderTopWidth: rs(1),
    borderTopColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemGap: {
    gap: rs(4),
  },
  label: {
    fontSize: rfs(11),
    fontWeight: "500",
  },
});
