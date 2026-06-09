import React, { useEffect, useRef } from "react";
import {
  Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  visible: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export default function AnimatedModalContent({
  visible,
  style,
  children,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      anim.setValue(0);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [anim, visible]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <Animated.View
      style={[
        { width: "100%", alignItems: "center" },
        style,
        { opacity: anim, transform: [{ scale }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}
