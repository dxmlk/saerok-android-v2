import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import SimpleHeader from "@/components/common/SimpleHeader";
import NicknameInput from "@/components/my/NicknameInput";
import EditFooter from "@/components/common/EditFooter";

import ProfileAvatar from "@/components/my/ProfileAvatar";
import EditIcon from "@/assets/icon/button/EditIcon";

import {
  checkNicknameAvailable,
  presignProfileImage,
  updateUserInfo,
} from "@/services/api/user";
import { useAuth } from "@/hooks/useAuth";
import { rs } from "@/theme";

const DEFAULT_HELPER = "닉네임은 14일에 한 번씩 변경할 수 있어요.";

function guessContentType(uri: string) {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser, setUser } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [saving, setSaving] = useState(false);

  const [localUri, setLocalUri] = useState<string | null>(null);
  const [avatarCacheKey, setAvatarCacheKey] = useState<number>(Date.now());

  const seed = (nickname.trim() || user?.email?.trim() || "user").toLowerCase();
  const avatarUrl = user?.thumbnailImageUrl || user?.profileImageUrl || null;
  const shownAvatarUrl = localUri || avatarUrl;

  const canSubmit = useMemo(() => {
    return nickname.trim().length > 0 && isNicknameAvailable && !saving;
  }, [nickname, isNicknameAvailable, saving]);

  const openImagePicker = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled) return;
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    setLocalUri(uri);

    try {
      setSaving(true);

      const contentType = guessContentType(uri);

      const { presignedUrl, objectKey } = await presignProfileImage({
        contentType,
      });

      const fileRes = await fetch(uri);
      const blob = await fileRes.blob();

      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });

      if (!putRes.ok) throw new Error(`S3 업로드 실패 (${putRes.status})`);

      const updated = await updateUserInfo({
        profileImageObjectKey: objectKey,
        profileImageContentType: contentType,
      });

      const nextUser = {
        ...(user as any),
        nickname: updated.nickname ?? user?.nickname ?? "",
        email: updated.email ?? user?.email ?? "",
        profileImageUrl:
          (updated as any).profileImageUrl ?? user?.profileImageUrl ?? null,
        thumbnailImageUrl:
          (updated as any).thumbnailProfileImageUrl ??
          (updated as any).thumbnailImageUrl ??
          user?.thumbnailImageUrl ??
          null,
      };

      setUser(nextUser);
      setAvatarCacheKey(Date.now());
      setLocalUri(null);

      await refreshUser({ silent: true });

      Alert.alert("완료", "프로필 사진이 변경되었습니다.");
    } catch (e: any) {
      setLocalUri(null);
      Alert.alert("실패", e?.message || "프로필 사진 업로드에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitNickname = async () => {
    if (!canSubmit) return;

    try {
      setSaving(true);

      const updated = await updateUserInfo({ nickname: nickname.trim() });

      const nextUser = {
        ...(user as any),
        nickname: updated.nickname ?? nickname.trim(),
        email: updated.email ?? user?.email ?? "",
      };

      setUser(nextUser);
      await refreshUser({ silent: true });

      Alert.alert("완료", "닉네임이 변경되었습니다.", [
        { text: "확인", onPress: () => router.replace("/my") },
      ]);
    } catch (err: any) {
      Alert.alert(
        "실패",
        err?.response?.data?.message ||
          err?.message ||
          "닉네임 변경에 실패했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.root}>
        <SimpleHeader title="프로필 편집" onPressBack={() => router.back()} />

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarWrap}>
            <Pressable
              onPress={openImagePicker}
              style={styles.avatarBox}
              hitSlop={rs(8)}
            >
              <ProfileAvatar
                size={rs(100)}
                imageUrl={shownAvatarUrl}
                seed={seed}
                cacheKey={avatarCacheKey}
                eggWidth={rs(47)}
                eggHeight={rs(57)}
              />
              <View style={styles.editBadge}>
                <EditIcon width={rs(24)} height={rs(24)} color="#0D0D0D" />
              </View>
            </Pressable>
          </View>

          <NicknameInput
            nickname={nickname}
            setNickname={(v) => {
              setNickname(v);
              setIsNicknameAvailable(false);
            }}
            onCheckResult={(ok) => setIsNicknameAvailable(ok)}
            checkNicknameAvailable={checkNicknameAvailable}
            helperText={DEFAULT_HELPER}
          />
        </ScrollView>

        <EditFooter
          text={saving ? "변경 중..." : "닉네임 변경하기"}
          disabled={!canSubmit}
          onClick={handleSubmitNickname}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  root: { flex: 1, backgroundColor: "#FFFFFF" },

  body: {
    paddingHorizontal: rs(24),
    paddingTop: rs(22),
    paddingBottom: rs(140),
  },

  avatarWrap: {
    alignItems: "center",
    marginBottom: rs(28),
  },

  avatarBox: {
    width: rs(100),
    height: rs(100),
  },

  editBadge: {
    position: "absolute",
    right: rs(-4),
    bottom: rs(-4),
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.12,
    shadowRadius: rs(6),
    shadowOffset: { width: rs(0), height: rs(2) },
    elevation: 3,
  },
});
