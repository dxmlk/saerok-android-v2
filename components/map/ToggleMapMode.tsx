import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { rfs, rs } from "@/theme";

type Props = {
  isMineOnly: boolean;
  onToggle: (value: boolean) => void;
  bottom?: number;
};

export default function ToggleMapMode({
  isMineOnly,
  onToggle,
  bottom = rs(120),
}: Props) {
  const [showNotice, setShowNotice] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNoticeText(isMineOnly ? "내 새록만 보여요" : "다른 사람의 새록도 보여요");
    setShowNotice(true);
    timeoutRef.current = setTimeout(() => setShowNotice(false), 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isMineOnly]);

  return (
    <>
      <Pressable
        onPress={() => onToggle(!isMineOnly)}
        style={[
          styles.switchWrap,
          { bottom },
          isMineOnly ? styles.switchMine : styles.switchAll,
        ]}
      >
        <View style={[styles.knob, isMineOnly ? styles.knobMine : styles.knobAll]}>
          <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="11.998"
              cy="12"
              r="9.6"
              stroke={isMineOnly ? "#B9BDC1" : "#4190FF"}
              strokeWidth={1.8}
            />
            <Path
              d="M11.999 2.40039C12.8548 2.40039 13.8916 3.14878 14.7676 4.96582C15.6129 6.71937 16.1602 9.20547 16.1602 12C16.1602 14.7945 15.6129 17.2806 14.7676 19.0342C13.8916 20.8512 12.8548 21.5996 11.999 21.5996C11.1433 21.5996 10.1064 20.8512 9.23047 19.0342C8.38517 17.2806 7.83789 14.7945 7.83789 12C7.83789 9.20547 8.38517 6.71937 9.23047 4.96582C10.1064 3.14878 11.1433 2.40039 11.999 2.40039Z"
              stroke={isMineOnly ? "#B9BDC1" : "#4190FF"}
              strokeWidth={1.8}
            />
            <Path
              d="M2.40039 12C2.40039 11.1442 3.14878 10.1074 4.96582 9.23145C6.71937 8.38615 9.20547 7.83887 12 7.83887C14.7945 7.83887 17.2806 8.38615 19.0342 9.23144C20.8512 10.1074 21.5996 11.1442 21.5996 12C21.5996 12.8558 20.8512 13.8926 19.0342 14.7686C17.2806 15.6139 14.7945 16.1611 12 16.1611C9.20547 16.1611 6.71937 15.6139 4.96582 14.7686C3.14878 13.8926 2.40039 12.8558 2.40039 12Z"
              stroke={isMineOnly ? "#B9BDC1" : "#4190FF"}
              strokeWidth={1.8}
            />
          </Svg>
        </View>
      </Pressable>

      {showNotice ? (
        <View style={styles.noticeWrap} pointerEvents="none">
          <Text style={styles.noticeText}>{noticeText}</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  switchWrap: {
    position: "absolute",
    right: rs(24),
    width: rs(72),
    height: rs(42),
    borderRadius: rs(21),
    paddingHorizontal: rs(2),
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  switchMine: { backgroundColor: "#D1D5DB" },
  switchAll: { backgroundColor: "#91BFFF" },
  knob: {
    width: rs(38),
    height: rs(38),
    borderRadius: rs(20),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  knobMine: { transform: [{ translateX: 0 }] },
  knobAll: { transform: [{ translateX: rs(30) }] },
  noticeWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    marginTop: -rs(25),
    alignItems: "center",
  },
  noticeText: {
    backgroundColor: "rgba(254,254,254,0.6)",
    borderRadius: rs(10),
    overflow: "hidden",
    height: rs(50),
    paddingHorizontal: rs(24),
    textAlignVertical: "center",
    includeFontPadding: false,
    color: "#0D0D0D",
    fontSize: rfs(18),
    lineHeight: rfs(50),
    fontWeight: "400",
  },
});
