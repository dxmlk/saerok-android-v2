import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoCutIcon from "@/assets/icon/background/LogoCutIcon";
import UserIcon from "@/assets/icon/icon/UserIcon";
import BellIcon from "@/assets/icon/icon/BellIcon";
import LockIcon from "@/assets/icon/icon/LockIcon";
import NoticeIcon from "@/assets/icon/icon/NoticeIcon";
import DocumentIcon from "@/assets/icon/icon/DocumentIcon";

import Profile from "@/components/my/Profile";
import MenuItem from "@/components/my/MenuItem";
import NotificationIcon from "@/assets/icon/icon/NotificationIcon";
import { rs } from "@/theme";

export default function MyHome() {
  const router = useRouter();
  const { isLoggedIn, user, loading } = useAuth();

  const joinedDays = useMemo(() => {
    if (!user?.joinedDate) return 0;
    const diff = Date.now() - new Date(user.joinedDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [user?.joinedDate]);

  const openExternal = async (url: string) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
    } catch {}
  };

  if (loading) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.logoBg}>
        <LogoCutIcon width={rs(175)} height={rs(211)} />
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.profilePad}>
              <Profile
                isUser={!!isLoggedIn}
                nickname={user?.nickname}
                joinedDays={joinedDays}
                email={user?.email ?? null}
                profileImageUrl={(user as any)?.profileImageUrl ?? null}
                thumbnailImageUrl={(user as any)?.thumbnailImageUrl ?? null}
                onPressEdit={() => router.push("/my/edit-profile")}
                onPressLogin={() => router.push("/login")}
              />
            </View>

            <View style={styles.menuWrap}>
              <MenuItem
                icon={<UserIcon color={isLoggedIn ? "#F6C343" : "#D1D5DB"} />}
                label="내 계정 관리"
                isActive={!!isLoggedIn}
                labelColor={isLoggedIn ? "#111111" : "#979797"}
                disabled={!isLoggedIn}
                onPress={() => router.push("/my/account")}
              />

              <MenuItem
                icon={
                  <NotificationIcon
                    color={isLoggedIn ? "#F6C343" : "#D1D5DB"}
                  />
                }
                label="알림 설정"
                isActive={!!isLoggedIn}
                labelColor={isLoggedIn ? "#111111" : "#979797"}
                disabled={!isLoggedIn}
                onPress={() => router.push("/my/notification-settings")}
              />

              <MenuItem
                icon={<DocumentIcon color="#F6C343" />}
                label="의견 보내기"
                isActive
                labelColor="#111111"
                onPress={() => router.push("/my/feedback")}
              />

              <MenuItem
                icon={<BellIcon color="#F6C343" />}
                label="새록 소식 / 이용 가이드"
                isActive
                labelColor="#111111"
                onPress={() =>
                  openExternal(
                    "https://www.instagram.com/saerok.app?igsh=MW1oemdxd3Ftb3F5bA==",
                  )
                }
              />

              <MenuItem
                icon={<LockIcon color="#F6C343" />}
                label="개인정보 처리 방침"
                isActive
                labelColor="#111111"
                onPress={() =>
                  openExternal(
                    "https://shine-guppy-3de.notion.site/2127cea87e0581af9a9acd2f36f28e3b",
                  )
                }
              />

              <MenuItem
                icon={<NoticeIcon color="#F6C343" />}
                label="버전 정보"
                isActive
                labelColor="#111111"
                onPress={() => {}}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },

  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },

  logoBg: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 0,
    elevation: 0,
  },

  scrollContent: {
    paddingBottom: rs(40),
  },

  content: {
    zIndex: 1,
  },

  profilePad: {
    paddingHorizontal: rs(24),
    marginTop: rs(71),
  },

  menuWrap: {
    paddingHorizontal: rs(24),
    marginTop: rs(24),
    gap: rs(16),
  },
});
