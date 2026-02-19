import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import EggIcon from "@/assets/icon/image/EggIcon";
import { rs } from "@/theme";

const AVATAR_COLORS = [
  "#4190FF",
  "#F7BE65",
  "#91BFFF",
  "#F9E2BE",
  "#CDDDF3",
  "#F1E9DD",
] as const;

function pickColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type Props = {
  size: number;
  imageUrl: string | null;
  seed: string;
  cacheKey?: string | number | null;
  eggWidth?: number;
  eggHeight?: number;
};

export default function ProfileAvatar({
  size,
  imageUrl,
  seed,
  cacheKey,
  eggWidth = rs(47),
  eggHeight = rs(57),
}: Props) {
  const bg = useMemo(() => pickColor(seed || "user"), [seed]);

  const uri = useMemo(() => {
    if (!imageUrl) return null;
    const v = cacheKey ?? "";
    const sep = imageUrl.includes("?") ? "&" : "?";
    return v ? `${imageUrl}${sep}v=${encodeURIComponent(String(v))}` : imageUrl;
  }, [imageUrl, cacheKey]);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: rs(2),
          borderColor: "#F2F2F2",
          backgroundColor: uri ? "#FFFFFF" : bg,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <EggIcon width={eggWidth} height={eggHeight} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
