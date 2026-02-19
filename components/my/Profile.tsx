import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ExclamationIcon from "@/assets/icon/button/ExclamationIcon";
import EditIcon from "@/assets/icon/button/EditIcon";

import LoginButton from "@/components/common/LoginButton";
import ProfileAvatar from "@/components/my/ProfileAvatar";
import { useAuth } from "@/hooks/useAuth";
import { font } from "@/theme/typography";
import { rfs, rs } from "@/theme";

type Props = {
  isUser: boolean;
  nickname?: string;
  joinedDays?: number;

  profileImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  email?: string | null;

  onPressEdit: () => void;
  onPressLogin: () => void;
};

export default function Profile({
  isUser,
  nickname,
  joinedDays = 0,
  profileImageUrl,
  thumbnailImageUrl,
  email,
  onPressEdit,
  onPressLogin,
}: Props) {
  const { user } = useAuth();

  if (!isUser) {
    return (
      <View style={styles.guestWrap}>
        <View style={styles.guestRow}>
          <View style={styles.badge}>
            <ExclamationIcon />
          </View>
          <View style={{ gap: 0 }}>
            <Text style={styles.guestText}>현재 비회원으로 사용 중이에요.</Text>
            <Text style={styles.guestText}>로그인하시겠어요?</Text>
          </View>
        </View>

        <LoginButton onPress={onPressLogin} />
      </View>
    );
  }

  const avatarUrl = thumbnailImageUrl || profileImageUrl || null;
  const seed = (nickname?.trim() || email?.trim() || "user").toLowerCase();

  return (
    <View style={styles.wrap}>
      <ProfileAvatar
        size={rs(49)}
        imageUrl={avatarUrl}
        seed={seed}
        cacheKey={user?.thumbnailImageUrl || user?.profileImageUrl ? 1 : 0}
      />

      <View style={styles.textCol}>
        <Text style={styles.greeting}>안녕하세요,</Text>
        <Text style={styles.nameLine}>
          <Text style={styles.name}>{nickname ?? ""}</Text>
          <Text style={styles.nameSuffix}>님!</Text>
        </Text>

        <Text style={styles.days}>새록과 함께한지 +{joinedDays}일</Text>
      </View>

      <Pressable onPress={onPressEdit} hitSlop={rs(10)} style={styles.editBtn}>
        <EditIcon width={rs(24)} height={rs(24)} color="#0D0D0D" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  guestWrap: { paddingTop: rs(47), paddingBottom: rs(24), gap: rs(16) },
  guestRow: { flexDirection: "row", gap: rs(11), alignItems: "center" },
  badge: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(999),
    borderWidth: rs(2),
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  guestText: { fontSize: rfs(15), color: "#0D0D0D" },

  wrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: rs(24),
    paddingBottom: rs(20),
  },

  textCol: {
    flex: 1,
    marginLeft: rs(8),
    marginRight: rs(12),
    marginTop: rs(-2),
  },

  greeting: {
    fontSize: rfs(18),
    fontWeight: "400",
    color: "#0D0D0D",
    lineHeight: rfs(20),
    fontFamily: font.haru,
  },

  nameLine: {
    marginTop: rs(1),
    fontSize: rfs(22),
    fontWeight: "400",
    color: "#0D0D0D",
    lineHeight: rfs(33),
    fontFamily: font.haru,
  },

  name: {
    fontSize: rfs(22),
    fontWeight: "400",
    color: "#0D0D0D",
    lineHeight: rfs(33),
    fontFamily: font.haru,
  },

  nameSuffix: {
    fontSize: rfs(18),
    fontWeight: "400",
    color: "#0D0D0D",
    lineHeight: rfs(20),
    fontFamily: font.haru,
  },

  days: {
    marginTop: rs(4),
    fontSize: rfs(13),
    fontWeight: "400",
    color: "#979797",
    lineHeight: rfs(16),
  },

  editBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(27),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.08,
    shadowRadius: rs(12),
    shadowOffset: { width: rs(0), height: rs(6) },
    elevation: 3,
  },
});
