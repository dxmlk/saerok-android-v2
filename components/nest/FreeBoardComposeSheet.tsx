import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import ProfileAvatar from "@/components/my/ProfileAvatar";
import { font } from "@/theme";
import { rfs, rs } from "@/theme/scale";

const LABEL_FREEBOARD = "자유게시판";
const LABEL_PLACEHOLDER = "자유롭게 글을 남겨보세요.";
const COMPOSE_BUTTON_GAP = 17;
const SUBMIT_BUTTON_HEIGHT = 53;

type Props = {
  mounted: boolean;
  open: boolean;
  text: string;
  onChangeText: (next: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  nickname: string;
  avatarUrl: string | null;
  onClosed: () => void;
  submitLabel?: string;
};

export default function FreeBoardComposeSheet({
  mounted,
  open,
  text,
  onChangeText,
  onClose,
  onSubmit,
  submitting,
  nickname,
  avatarUrl,
  onClosed,
  submitLabel = "게시하기",
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const sheetClosedY = Math.max(rs(420), screenHeight);
  const sheetAnim = useRef(new Animated.Value(sheetClosedY)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const wasOpenRef = useRef(false);
  const canSubmit = text.trim().length > 0 && !submitting;
  const composeInputBottomInset =
    keyboardHeight +
    insets.bottom +
    rs(COMPOSE_BUTTON_GAP) +
    rs(SUBMIT_BUTTON_HEIGHT);

  useEffect(() => {
    if (!mounted) {
      setKeyboardHeight(0);
      sheetAnim.setValue(sheetClosedY);
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [mounted, sheetAnim, sheetClosedY]);

  useEffect(() => {
    if (!mounted) return;

    Animated.timing(sheetAnim, {
      toValue: open ? 0 : sheetClosedY,
      duration: open ? 260 : 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!open && finished) onClosed();
    });

    if (open && !wasOpenRef.current) {
      wasOpenRef.current = true;
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        setTimeout(() => {
          inputRef.current?.focus();
        }, 40);
      });
    }

    if (!open) {
      wasOpenRef.current = false;
    }
  }, [mounted, onClosed, open, sheetAnim, sheetClosedY]);

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onShow={() => inputRef.current?.focus()}
      onRequestClose={onClose}
    >
      <Pressable style={styles.composeDim} onPress={onClose}>
        <Animated.View
          style={[
            styles.composeSheet,
            {
              height: screenHeight - insets.top,
              transform: [{ translateY: sheetAnim }],
            },
          ]}
        >
          <Pressable style={styles.composeTouchBlock} onPress={() => {}}>
            <View style={styles.composeHeader}>
              <Text style={styles.composeTitle}>{LABEL_FREEBOARD}</Text>
              <Pressable hitSlop={12} onPress={onClose}>
                <CloseLineIcon width={rs(14)} height={rs(14)} color="#979797" />
              </Pressable>
            </View>

            <View style={styles.composeDivider} />

            <View style={styles.composeProfileRow}>
              <View style={styles.composeAvatarWrap}>
                {avatarUrl && !avatarFailed ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.composeAvatarImage}
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <ProfileAvatar
                    size={rs(25)}
                    imageUrl={null}
                    seed={nickname || "user"}
                  />
                )}
              </View>
              <Text style={styles.composeNickname}>{nickname}</Text>
            </View>

            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={onChangeText}
              placeholder={LABEL_PLACEHOLDER}
              placeholderTextColor="#B0B0B0"
              multiline
              scrollEnabled
              autoFocus
              textAlignVertical="top"
              style={[
                styles.composeInput,
                { marginBottom: composeInputBottomInset },
              ]}
              returnKeyType="default"
            />

            <View pointerEvents="box-none" style={styles.composeFooterOverlay}>
              <Animated.View
                style={[
                  styles.submitButtonDock,
                  { bottom: keyboardHeight > 0 ? keyboardHeight : 0 },
                ]}
              >
                <View
                  style={[
                    styles.submitButtonDockInner,
                    { paddingBottom: insets.bottom + rs(COMPOSE_BUTTON_GAP) },
                  ]}
                >
                  <Pressable
                    onPress={onSubmit}
                    disabled={!canSubmit}
                    style={[
                      styles.submitButtonInner,
                      !canSubmit && styles.submitButtonDisabled,
                    ]}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>{submitLabel}</Text>
                    )}
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  composeDim: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  composeSheet: {
    backgroundColor: "#FEFEFE",
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    overflow: "hidden",
  },
  composeTouchBlock: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  composeHeader: {
    height: rs(62),
    paddingHorizontal: rs(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  composeTitle: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(18),
    lineHeight: rfs(27),
    fontWeight: "400",
  },
  composeDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  composeProfileRow: {
    marginTop: rs(13),
    marginLeft: rs(24),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
  },
  composeAvatarWrap: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(12.5),
    overflow: "hidden",
    borderWidth: rs(1),
    borderColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
  },
  composeAvatarImage: {
    width: "100%",
    height: "100%",
  },
  composeNickname: {
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontFamily: font.haru,
    lineHeight: rfs(22),
    fontWeight: "400",
  },
  composeInput: {
    flex: 1,
    marginTop: rs(3),
    marginLeft: rs(54),
    marginRight: rs(24),
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(25),
    fontWeight: "400",
  },
  composeFooterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  submitButtonDock: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 30,
  },
  submitButtonDockInner: {
    paddingHorizontal: rs(24),
    backgroundColor: "transparent",
  },
  submitButtonInner: {
    height: rs(SUBMIT_BUTTON_HEIGHT),
    borderRadius: rs(20),
    backgroundColor: "#91bfff",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#d4d7d6",
  },
  submitButtonText: {
    color: "#FEFEFE",
    fontSize: rfs(18),
    lineHeight: rfs(21),
    fontWeight: "500",
  },
});
