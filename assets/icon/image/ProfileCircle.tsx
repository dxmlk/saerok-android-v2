import * as React from "react";
import { View } from "react-native";

type Props = { size?: number };

export default function ProfileCircle({ size = 61 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#E5E7EB",
      }}
    />
  );
}
