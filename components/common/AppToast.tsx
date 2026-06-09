import React, { useEffect } from "react";
import TouchableOpacity from "@/components/common/TouchableOpacity";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { rfs, rs } from "@/theme/scale";

type BaseToastProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
  autoHideMs?: number;
  bottomOffset?: number;
  height?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingVertical?: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  closeColor: string;
  dark?: boolean;
  leading?: React.ReactNode;
  leadingGap?: number;
  contentGap?: number;
};

function ToastCloseIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.22806 2.20051C3.09335 2.0704 2.91292 1.9984 2.72563 2.00003C2.53835 2.00165 2.3592 2.07678 2.22676 2.20921C2.09433 2.34164 2.01921 2.5208 2.01758 2.70808C2.01595 2.89536 2.08795 3.07579 2.21806 3.21051L5.99878 6.99122L2.21806 10.7719C2.14984 10.8378 2.09543 10.9166 2.05799 11.0038C2.02056 11.0909 2.00085 11.1847 2.00003 11.2795C1.9992 11.3743 2.01728 11.4684 2.05319 11.5562C2.08911 11.644 2.14214 11.7237 2.20921 11.7908C2.27628 11.8579 2.35603 11.9109 2.44381 11.9468C2.53159 11.9827 2.62565 12.0008 2.72049 12C2.81533 11.9991 2.90906 11.9794 2.99621 11.942C3.08335 11.9046 3.16217 11.8502 3.22806 11.7819L7.00878 8.00122L10.7895 11.7819C10.9242 11.912 11.1046 11.984 11.2919 11.9824C11.4792 11.9808 11.6584 11.9057 11.7908 11.7732C11.9232 11.6408 11.9983 11.4616 12 11.2744C12.0016 11.0871 11.9296 10.9067 11.7995 10.7719L8.01878 6.99122L11.7995 3.21051C11.9296 3.07579 12.0016 2.89536 12 2.70808C11.9983 2.5208 11.9232 2.34164 11.7908 2.20921C11.6584 2.07678 11.4792 2.00165 11.2919 2.00003C11.1046 1.9984 10.9242 2.0704 10.7895 2.20051L7.00878 5.98122L3.22806 2.20051Z"
        fill={color}
      />
    </Svg>
  );
}

function SuccessIcon() {
  return (
    <View style={[styles.iconBox, { backgroundColor: "#4190FF" }]}>
      <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
        <Rect width="16.0588" height="16.0588" rx="8.02941" fill="#FEFEFE" />
        <Path
          d="M3.87891 8.45215L6.59658 11.1698L12.1037 5.55919"
          stroke="#4190FF"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function ErrorIcon() {
  return (
    <View style={[styles.iconBox, { backgroundColor: "#FF234F" }]}>
      <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
        <Rect width="16.0588" height="16.0588" rx="8.02941" fill="#FEFEFE" />
        <Path
          d="M4.52734 4.5293L11.5273 11.5293"
          stroke="#FF234F"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M11.5273 4.5293L4.52734 11.5293"
          stroke="#FF234F"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function ToastBase({
  visible,
  message,
  onClose,
  autoHideMs = 3000,
  bottomOffset = rs(61),
  height = rs(38),
  paddingLeft = rs(8),
  paddingRight = rs(11),
  paddingVertical = rs(5),
  backgroundColor,
  borderColor,
  textColor,
  closeColor,
  dark = false,
  leading,
  leadingGap = 0,
  contentGap = 0,
}: BaseToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(timer);
  }, [autoHideMs, onClose, visible]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.portal, { bottom: insets.bottom + bottomOffset }]}
    >
      <View
        style={[
          styles.shadowWrap,
          dark ? styles.shadowDark : styles.shadowLight,
          styles.shadowWrapContent,
        ]}
      >
        <View
          style={[
            styles.card,
            {
              height,
              paddingLeft,
              paddingRight,
              paddingVertical,
              backgroundColor,
              borderColor,
            },
          ]}
        >
          {leading}
          <View
            style={[
              styles.messageWrap,
              {
                marginLeft: leading ? leadingGap : 0,
                marginRight: contentGap,
              },
            ]}
          >
            <Text style={[styles.message, { color: textColor }]} numberOfLines={1}>
              {message}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeButton}>
            <ToastCloseIcon color={closeColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function FreeBoardUploadSuccessToast({
  visible,
  onClose,
  message = "게시글을 올렸어요.",
}: {
  visible: boolean;
  onClose: () => void;
  message?: string;
}) {
  return (
    <ToastBase
      visible={visible}
      onClose={onClose}
      message={message}
      backgroundColor="rgba(254, 254, 254, 0.80)"
      borderColor="#91BFFF"
      textColor="#0D0D0D"
      closeColor="#979797"
      leading={<SuccessIcon />}
      leadingGap={rs(7)}
      contentGap={rs(8)}
      height={rs(38)}
    />
  );
}

export function FreeBoardUploadErrorToast({
  visible,
  onClose,
  message = "게시글 업로드를 실패했어요.",
}: {
  visible: boolean;
  onClose: () => void;
  message?: string;
}) {
  return (
    <ToastBase
      visible={visible}
      onClose={onClose}
      message={message}
      backgroundColor="rgba(254, 254, 254, 0.80)"
      borderColor="#F77465"
      textColor="#0D0D0D"
      closeColor="#979797"
      leading={<ErrorIcon />}
      leadingGap={rs(7)}
      contentGap={rs(8)}
      height={rs(38)}
    />
  );
}

export function MapMineOnlyToast({
  visible,
  onClose,
  bottomOffset,
}: {
  visible: boolean;
  onClose: () => void;
  bottomOffset?: number;
}) {
  return (
    <ToastBase
      visible={visible}
      onClose={onClose}
      bottomOffset={bottomOffset}
      height={rs(38)}
      paddingLeft={rs(13)}
      paddingRight={rs(11)}
      paddingVertical={rs(5)}
      message="'내 새록만 보기' 모드로 전환되었어요."
      backgroundColor="rgba(254, 254, 254, 0.80)"
      borderColor="#DAE0DE"
      textColor="#0D0D0D"
      closeColor="#979797"
      contentGap={rs(8)}
    />
  );
}

export function MapAllToast({
  visible,
  onClose,
  bottomOffset,
}: {
  visible: boolean;
  onClose: () => void;
  bottomOffset?: number;
}) {
  return (
    <ToastBase
      visible={visible}
      onClose={onClose}
      bottomOffset={bottomOffset}
      height={rs(38)}
      paddingLeft={rs(13)}
      paddingRight={rs(11)}
      paddingVertical={rs(5)}
      message="'모든 새록 보기' 모드로 전환되었어요."
      backgroundColor="#0D0D0D"
      borderColor="#DAE0DE"
      textColor="#FEFEFE"
      closeColor="#F2F2F2"
      dark
      contentGap={rs(8)}
    />
  );
}

const styles = StyleSheet.create({
  portal: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: rs(16),
    zIndex: 100,
  },
  shadowWrap: {
    borderRadius: rs(12),
  },
  shadowWrapContent: {
    alignSelf: "center",
  },
  shadowLight: {
    shadowColor: "#545454",
    shadowOpacity: 0.5,
    shadowRadius: rs(10),
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  shadowDark: {
    shadowColor: "#545454",
    shadowOpacity: 0.5,
    shadowRadius: rs(10),
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  card: {
    borderRadius: rs(12),
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  iconBox: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(8),
    alignItems: "center",
    justifyContent: "center",
  },
  messageWrap: {
    flexShrink: 1,
  },
  message: {
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  closeButton: {
    marginLeft: rs(8),
    width: rs(14),
    height: rs(14),
    alignItems: "center",
    justifyContent: "center",
  },
});
