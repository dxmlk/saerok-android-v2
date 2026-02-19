import { fetchMyCollections } from "@/services/api/collections";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";

import addSaerokPng from "@/assets/icon/button/add-saerok.png";
import { SpeechBubbleIcon } from "@/assets/SaerokSvgs";
import SaerokCirclesBg from "@/assets/images/SaerokCirclesBg";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";

const SAEROK_MESSAGES = [
  "오늘은 어떤 새를\n관찰해볼까요?",
  "오늘 발견한 새,\n함께 기록해보아요.",
  "작은 날갯짓도\n소중한 기록이에요!",
  "새를 보기 위한\n기다림은\n탐조의 시작이에요.",
  "관찰을 통해\n새를 더 알아가요!",
  "오늘은 어떤 새를\n보게 될까요?",
  "오늘은 어떤 새를\n보았나요?",
  "오늘 나의 시야를\n사로잡은 새가 있었나요?",
  "날아간 새를\n기록으로\n남겨보아요!",
  "오늘 만난\n새의 이름은\n무엇일까요?",
  "잠시 멈춰\n새들의 노래에\n귀 기울여보세요.",
  "여러분만의\n탐조 일지를\n만들어보아요!",
  "새를 만나\n어떤 감정을\n느꼈나요?",
];

export default function SaerokMain({
  refreshKey = 0,
}: {
  refreshKey?: number;
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
    <View style={styles.hero}>
      <View pointerEvents="none" style={styles.bgWrap}>
        <View style={styles.circlesPos}>
          <SaerokCirclesBg width={rs(543)} height={rs(464)} />
        </View>

        <BlurView intensity={80} tint="light" style={styles.blur} />
        <View style={styles.overlay} />
      </View>

      <View style={styles.msgWrap}>
        <Text style={[styles.msg, { fontFamily: haruFont }]}>
          {randomMessage}
        </Text>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.count}>{birdCount}</Text>
        <Text style={styles.countSub}>종의 새가 새록에 담겨있어요</Text>
      </View>

      {isLoggedIn ? (
        <Pressable
          style={[styles.fab, styles.fabActive]}
          onPress={() => router.push("/saerok/write")}
        >
          <Image
            source={addSaerokPng}
            style={styles.fabIcon}
            resizeMode="contain"
          />
        </Pressable>
      ) : (
        <>
          <Pressable
            style={styles.loginBubble}
            onPress={() => router.push("/login")}
          >
            <View style={styles.bubbleBox}>
              <SpeechBubbleIcon width={rs(176)} height={rs(56)} />
            </View>
          </Pressable>

          <View style={[styles.fab, styles.fabDisabled]}>
            <Image
              source={addSaerokPng}
              style={styles.fabIcon}
              resizeMode="contain"
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: rs(420),
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
    top: rs(72),
    zIndex: 10,
  },
  msg: {
    fontSize: rfs(35),
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
  fabIcon: { width: rs(40), height: rs(40) },

  loginBubble: {
    position: "absolute",
    right: rs(24),
    bottom: rs(100),
    zIndex: 10,
  },
  bubbleBox: { width: rs(176), height: rs(56) },
});
