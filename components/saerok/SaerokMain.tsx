import { BlurView } from "@react-native-community/blur";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import AddSaerokDexIcon from "@/assets/icon/button/AddSaerokDexIcon";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import NotificationIcon from "@/assets/icon/icon/NotificationIcon";
import { SpeechBubbleIcon } from "@/assets/SaerokSvgs";
import SaerokCirclesBg from "@/assets/images/SaerokCirclesBg";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyCollections } from "@/services/api/collections";
import { fetchUnreadNotificationCountApi } from "@/services/api/notifications";
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
  const { isLoggedIn } = useAuth();
  const [birdCount, setBirdCount] = useState(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const haruFont = (font as any).haru ?? (font as any).logo ?? font.regular;
  const randomMessage = useMemo(() => {
    const idx = Math.floor(Math.random() * SAEROK_MESSAGES.length);
    return SAEROK_MESSAGES[idx];
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setBirdCount(0);
      return;
    }

    (async () => {
      try {
        const items = await fetchMyCollections();
        setBirdCount(items.length);
      } catch {
        setBirdCount(0);
      }
    })();
  }, [isLoggedIn, refreshKey]);

  useEffect(() => {
    if (!isLoggedIn) {
      setHasUnreadNotifications(false);
      return;
    }

    (async () => {
      try {
        const res = await fetchUnreadNotificationCountApi();
        setHasUnreadNotifications((res.unreadCount ?? 0) > 0);
      } catch {
        setHasUnreadNotifications(false);
      }
    })();
  }, [isLoggedIn, refreshKey]);

  return (
    <View style={[styles.hero, { height: rs(420) + topInset }]}>
      <View pointerEvents="none" style={styles.bgWrap}>
        <View style={styles.circlesPos}>
          <SaerokCirclesBg width={rs(543)} height={rs(550)} />
        </View>
        <BlurView
          blurType="light"
          blurAmount={40}
          {...(Platform.OS === "android"
            ? {
                blurRadius: 25,
                downsampleFactor: 12,
                overlayColor: "transparent",
              }
            : {})}
          reducedTransparencyFallbackColor="#F2F2F2"
          style={styles.blur}
        />
        <View style={styles.overlay} />
      </View>

      <TouchableOpacity
        style={[styles.notificationBtn, { top: rs(48) + topInset }]}
        onPress={() => router.push("/saerok/notifications")}
      >
        <View style={styles.notificationBtnInner}>
          <NotificationIcon width={rs(24)} height={rs(24)} color="#0D0D0D" />
          {hasUnreadNotifications ? (
            <View style={styles.notificationDot}>
              <Svg width={rs(9)} height={rs(9)} viewBox="0 0 9 9" fill="none">
                <Rect
                  x="1"
                  y="1"
                  width="7"
                  height="7"
                  rx="3.5"
                  fill="#4190FF"
                  stroke="#FEFEFE"
                  strokeOpacity="0.6"
                  strokeWidth="2"
                />
              </Svg>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={[styles.msgWrap, { top: rs(48) + topInset }]}>
        <Text style={[styles.msg, { fontFamily: haruFont }]}>
          {randomMessage}
        </Text>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.count}>{birdCount}</Text>
        <Text style={styles.countSub}>종의 새가 담겨있어요</Text>
      </View>

      {isLoggedIn ? (
        <TouchableOpacity
          style={[styles.fab, styles.fabActive]}
          onPress={() => router.push("/saerok/write")}
        >
          <AddSaerokDexIcon
            width={rs(40)}
            height={rs(38.333)}
            color="#FEFEFE"
          />
        </TouchableOpacity>
      ) : (
        <>
          <Pressable
            style={styles.loginBubble}
            onPress={() => router.push("/login")}
          >
            <View style={styles.bubbleBox}>
              <SpeechBubbleIcon width={rs(190)} height={rs(56)} />
              <View pointerEvents="none" style={styles.bubbleTextWrap}>
                <Text style={styles.bubbleText}>로그인하고 새록 작성하기</Text>
              </View>
            </View>
          </Pressable>
          <View style={[styles.fab, styles.fabDisabled]}>
            <AddSaerokDexIcon
              width={rs(40)}
              height={rs(38.333)}
              color="#979797"
            />
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
    backgroundColor: "rgba(242,242,242,0.30)",
  },
  notificationBtn: {
    position: "absolute",
    right: rs(8),
    width: rs(72),
    height: rs(72),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  notificationBtnInner: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "rgba(254, 254, 254, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: rs(-1),
    right: rs(4),
    zIndex: 11,
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
  bubbleBox: {
    width: rs(190),
    height: rs(56),
    position: "relative",
  },
  bubbleTextWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: rs(12),
  },
  bubbleText: {
    fontSize: rfs(15),
    lineHeight: rfs(20),
    fontFamily: font.bold,
    color: "#4190FF",
    textAlign: "center",
  },
});
