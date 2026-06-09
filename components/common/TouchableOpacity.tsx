import React from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

type Props = PressableProps & {
  pressedOpacity?: number;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

export default function TouchableOpacity({
  pressedOpacity = 0.7,
  style,
  children,
  ...rest
}: Props) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => {
        const resolvedStyle = typeof style === "function" ? style({ pressed }) : style;
        return [resolvedStyle, pressed ? { opacity: pressedOpacity } : undefined];
      }}
    >
      {children}
    </Pressable>
  );
}
