import React from "react";
import { Text, View } from "react-native";

import SaerokImage from "@/assets/images/SaerokImage";

type Props = {
  upperText: string;
  lowerText: string;
};

export default function EmptyState({ upperText, lowerText }: Props) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#111" }}>
        {upperText}
      </Text>
      <Text style={{ marginTop: 6, fontSize: 14, color: "#555" }}>
        {lowerText}
      </Text>

      <View style={{ alignItems: "center", marginTop: 40 }}>
        <SaerokImage width={220} height={220} />
      </View>
    </View>
  );
}
