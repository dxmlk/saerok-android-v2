import React, { useCallback, useEffect } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoCutIcon from "@/assets/icon/background/LogoCutIcon";
import SplashLogo from "@/assets/icon/logo/SplashLogo";
import EditFooter from "@/components/common/EditFooter";
import { font, rfs, rs } from "@/theme";

const LOGO_BASE_WIDTH = 263;
const LOGO_BASE_HEIGHT = 290;
const COMPLETE_LOGO_SCALE = (282 / 263) * 1;
const COMPLETE_LOGO_WIDTH = LOGO_BASE_WIDTH * COMPLETE_LOGO_SCALE;
const COMPLETE_LOGO_HEIGHT = LOGO_BASE_HEIGHT * COMPLETE_LOGO_SCALE;
const COMPLETE_LOGO_VISIBLE_WIDTH = 1;
const COMPLETE_LOGO_VISIBLE_HEIGHT = 0.92;

export default function RegisterCompleteScreen() {
  const navigation = useNavigation();
  const enterApp = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "(tabs)",
            state: {
              index: 2,
              routes: [
                { name: "saerok" },
                { name: "dex" },
                { name: "nest" },
                { name: "map" },
                { name: "my" },
              ],
            },
          },
        ],
      } as any),
    );
  }, [navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      enterApp();
      return true;
    });
    return () => sub.remove();
  }, [enterApp]);

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.logoBg}>
        <LogoCutIcon
          width={rs(COMPLETE_LOGO_WIDTH)}
          height={rs(COMPLETE_LOGO_HEIGHT)}
          color="#91BFFF"
        />
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.page}>
          <View style={styles.content}>
            <SplashLogo width={rs(103)} height={rs(53)} color="#91BFFF" />
            <Text style={styles.title}>회원가입이 완료됐어요 🎉</Text>
          </View>

          <EditFooter
            text="새록 시작하기"
            onClick={enterApp}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  page: {
    flex: 1,
  },
  logoBg: {
    position: "absolute",
    top: -rs(COMPLETE_LOGO_HEIGHT * (1.15 - COMPLETE_LOGO_VISIBLE_HEIGHT)),
    right: -rs(COMPLETE_LOGO_WIDTH * (1.15 - COMPLETE_LOGO_VISIBLE_WIDTH)),
    zIndex: 0,
  },
  content: {
    marginTop: rs(166),
    paddingHorizontal: rs(24),
    zIndex: 1,
  },
  title: {
    marginTop: rs(18.5),
    color: "#0D0D0D",
    fontSize: rfs(30),
    lineHeight: rfs(33),
    fontWeight: "400",
    letterSpacing: -0.62,
    fontFamily: font.haru,
  },
});
