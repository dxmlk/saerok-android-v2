import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AddSaerokDexIcon from "@/assets/icon/button/AddSaerokDexIcon";
import { SpeechBubbleIcon } from "@/assets/SaerokSvgs";
import SaerokCirclesBg from "@/assets/images/SaerokCirclesBg";
import { fetchMyCollections } from "@/services/api/collections";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";

const SAEROK_MESSAGES = [
  "오늘은 어떤 새를\n관찰해볼까요?",
  "오늘 발견한 새를\n기록해보세요.",
  "작은 조각들도\n탐조 기록이에요.",
  "새를 보기 위한\n기다림도\n새록의 시작이에요.",
  "관찰을 통해\n새를 더 알아가요.",
  "오늘은 어떤 새를\n보게 될까요?",
  "오늘은 어떤 새를\n보셨나요?",
  "오늘 시야를\n새록으로 남겨볼까요?",
  "보아간 새를\n기록으로\n남겨보아요.",
  "오늘 만난\n새의 이름은\n무엇일까요?",
  "잠시 멈춰\n새들의 노래를\n기억해보세요.",
  "여러분만의\n새록 지도를\n만들어보세요!",
  "새를 만나\n어떤 감정을\n느끼셨나요?",
];

export default function SaerokMain({
  refreshKey = 0,
  topInset = 0,
}: {
  refreshKey?: number;
  topInset?: number;
}) {
  const router = useRouter();
  const [birdCount, setBirdCount] = useState(0);
  const isLoggedIn = true;

  const haruFont = (font as any).haru ?? (font as any).logo ?? font.regular;
  const randomMessage = useMemo(() => {
    const idx = Math.floor(Math.random() * SAEROK_MESSAGES.length);
    return SAEROK_MESSAGES[idx];
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const items = await fetchMyCollections();
        setBirdCount(items.length);
      } catch {
        setBirdCount(0);
      }
    })();
  }, [refreshKey]);

  return (
    <View style={[styles.hero, { height: rs(420) + topInset }]}>
      <View pointerEvents="none" style={styles.bgWrap}>
        <View style={styles.circlesPos}>
          <SaerokCirclesBg width={rs(543)} height={rs(464)} />
        </View>
        <BlurView intensity={80} tint="light" style={styles.blur} />
        <View style={styles.overlay} />
      </View>

      <View style={[styles.msgWrap, { top: rs(48) + topInset }]}>
        <Text style={[styles.msg, { fontFamily: haruFont }]}>{randomMessage}</Text>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.count}>{birdCount}</Text>
        <Text style={styles.countSub}>종의 새가 담겨있어요</Text>
      </View>

      {isLoggedIn ? (
        <Pressable
          style={[styles.fab, styles.fabActive]}
          onPress={() => router.push("/saerok/write")}
        >
          <AddSaerokDexIcon width={rs(40)} height={rs(38.333)} color="#FEFEFE" />
        </Pressable>
      ) : (
        <>
          <Pressable style={styles.loginBubble} onPress={() => router.push("/login")}>
            <View style={styles.bubbleBox}>
              <SpeechBubbleIcon width={rs(176)} height={rs(56)} />
            </View>
          </Pressable>
          <View style={[styles.fab, styles.fabDisabled]}>
            <AddSaerokDexIcon width={rs(40)} height={rs(38.333)} color="#979797" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#F2F2F2",
    overflow: "hidden",
  },
  bgWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  circlesPos: {
    position: "absolute",
    left: rs(-75),
    top: rs(-90),
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(242,242,242,0.60)",
  },
  msgWrap: {
    position: "absolute",
    left: rs(24),
    zIndex: 10,
  },
  msg: {
    fontSize: rfs(30),
    lineHeight: rfs(40),
    color: "#111827",
  },
  countRow: {
    position: "absolute",
    left: rs(24),
    bottom: rs(28),
    zIndex: 10,
  },
  count: {
    fontSize: rfs(40),
    lineHeight: rfs(40),
    color: "#4190FF",
    fontFamily: font.bold,
  },
  countSub: {
    marginTop: rs(6),
    color: "#111827",
    fontFamily: font.regular,
  },
  fab: {
    position: "absolute",
    right: rs(24),
    bottom: rs(28),
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  fabActive: { backgroundColor: "#4190FF" },
  fabDisabled: { backgroundColor: "#E6E6E6" },
  loginBubble: {
    position: "absolute",
    right: rs(24),
    bottom: rs(100),
    zIndex: 10,
  },
  bubbleBox: { width: rs(176), height: rs(56) },
});
