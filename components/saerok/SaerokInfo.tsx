import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import CollectionLikeButton from "@/components/saerok/CollectionLikeButton";
import CollectionCommentButton from "@/components/saerok/CollectionCommentButton";
import { rfs, rs } from "@/theme";

type BirdInfo = {
  birdId: number | null;
  koreanName: string | null;
  scientificName: string | null;
};

type UserInfo = {
  userId?: number;
  nickname?: string;
};

export type SaerokInfoProps = {
  collectionId: number;
  img: string | null;
  date: string;
  address: string;
  locationAlias: string;
  note: string;
  birdInfo: BirdInfo;
  user: UserInfo;
  isMine?: boolean;
};

function formatDate(dateString: string) {
  if (!dateString) return "";
  const [y, m, d] = dateString.split("-");
  return `${y}년 ${m}월 ${d}일`;
}

export default function SaerokInfo({
  collectionId,
  img,
  date,
  address,
  locationAlias,
  note,
  birdInfo,
  user,
  isMine = false,
}: SaerokInfoProps) {
  const router = useRouter();
  const [alertOpen, setAlertOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const dateText = useMemo(() => formatDate(date), [date]);

  const onEdit = () => {
    router.push(`/saerok/write/${collectionId}`);
  };

  const onDex = () => {
    if (birdInfo.koreanName && birdInfo.birdId) {
      router.push({
        pathname: "/(tabs)/dex/[birdId]" as any,
        params: { birdId: String(birdInfo.birdId) },
      });
      return;
    }
    setAlertOpen(true);
  };

  const onReport = () => {
    setReportOpen(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.page}>
        {img ? (
          <Image
            source={{ uri: img }}
            style={styles.heroImg}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImg, { backgroundColor: "#E5E7EB" }]} />
        )}

        <View style={styles.mainBlock}>
          <View style={styles.titleArea}>
            <View style={styles.titlePill}>
              <Text numberOfLines={1} style={styles.titleText}>
                {birdInfo.koreanName ?? "이름 모를 새"}
              </Text>
            </View>

            <View style={styles.trapWrap}>
              <View style={styles.trapBg} />
              <View style={styles.trapBtns}>
                <Pressable
                  onPress={onDex}
                  style={[styles.iconBtn, styles.blueBtn]}
                >
                  <Text style={styles.iconTextWhite}>D</Text>
                </Pressable>

                {isMine ? (
                  <Pressable
                    onPress={onEdit}
                    style={[styles.iconBtn, styles.glassBtn]}
                  >
                    <Text style={styles.iconText}>편집</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={onReport}
                    style={[styles.iconBtn, styles.glassBtn]}
                  >
                    <Text style={styles.iconText}>신고</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          <View style={styles.noteCard}>
            <View style={styles.noteInner}>
              <Text style={styles.noteText}>{note}</Text>
            </View>

            <View style={styles.actionRow}>
              <CollectionLikeButton collectionId={collectionId} />
              <View style={styles.divider} />
              <CollectionCommentButton collectionId={collectionId} />
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRowTop}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>아이콘</Text>
              <View style={{ flexDirection: "column", gap: rs(5) }}>
                <Text style={styles.infoMain}>{locationAlias}</Text>
                <Text style={styles.infoSub}>{address}</Text>
              </View>
            </View>
            <Text style={styles.infoChevron}>→</Text>
          </View>

          <View style={styles.infoRowMid}>
            <Text style={styles.infoIcon}>날짜</Text>
            <Text style={styles.infoMain}>{dateText}</Text>
          </View>

          <View style={styles.infoRowBot}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>작성자</Text>
              <Text style={styles.infoMain}>
                {user?.nickname ?? "알 수 없음"}
              </Text>
            </View>
            <Text style={styles.infoChevron}>→</Text>
          </View>
        </View>
      </View>

      {reportOpen ? (
        <View style={styles.modalDim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>게시물을 신고하시겠어요?</Text>
            <Text style={styles.modalSub}>
              커뮤니티 가이드에 따라{"\n"}신고 사유에 해당하는지 검토 후
              처리돼요.
            </Text>

            <View style={styles.modalBtns}>
              <Pressable
                onPress={() => setReportOpen(false)}
                style={[styles.modalBtn, styles.modalDanger]}
              >
                <Text style={styles.modalBtnTextDanger}>신고하기</Text>
              </Pressable>
              <Pressable
                onPress={() => setReportOpen(false)}
                style={[styles.modalBtn, styles.modalNormal]}
              >
                <Text style={styles.modalBtnText}>돌아가기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {alertOpen ? (
        <View style={styles.modalDim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>새 정보를 입력하시겠어요?</Text>
            <Text style={styles.modalSub}>
              이름 모를 새는 도감 확인이 불가능해요.
            </Text>

            <View style={styles.modalBtns}>
              <Pressable
                onPress={() => setAlertOpen(false)}
                style={[styles.modalBtn, styles.modalNormal]}
              >
                <Text style={styles.modalBtnText}>돌아가기</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAlertOpen(false);
                  router.push(`/saerok/write/${collectionId}`);
                }}
                style={[styles.modalBtn, styles.modalPrimary]}
              >
                <Text style={styles.modalBtnTextPrimary}>입력하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: rs(120),
    backgroundColor: "#F2F2F2",
  },
  page: {
    width: "100%",
    maxWidth: rs(500),
    alignSelf: "center",
    backgroundColor: "#F2F2F2",
  },

  heroImg: {
    width: "100%",
    height: rs(360),
    borderBottomLeftRadius: rs(20),
    borderBottomRightRadius: rs(20),
  },

  mainBlock: {
    marginHorizontal: rs(24),
    marginTop: rs(-25),
  },

  titleArea: {
    height: rs(60),
    marginBottom: rs(-19),
  },

  titlePill: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingHorizontal: rs(17),
    paddingVertical: rs(19),
    maxWidth: rs(260),
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: rs(10),
    shadowOffset: { width: rs(0), height: rs(6) },
    elevation: 6,
  },
  titleText: {
    color: "#111827",
    fontSize: rfs(16),
    fontWeight: "800",
  },

  trapWrap: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 5,
    width: rs(127),
    height: rs(60),
    overflow: "hidden",
  },
  trapBg: {
    position: "absolute",
    right: 0,
    top: 0,
    width: rs(127),
    height: rs(60),
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rs(18),
    borderBottomLeftRadius: rs(18),
    transform: [{ skewX: "-18deg" }],
    opacity: 0.92,
  },
  trapBtns: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: rs(27),
    paddingRight: rs(11),
    paddingTop: rs(11),
    paddingBottom: rs(9),
    gap: rs(9),
  },

  iconBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: rs(6),
    shadowOffset: { width: rs(0), height: rs(3) },
    elevation: 3,
  },
  blueBtn: {
    backgroundColor: "#4190FF",
  },
  glassBtn: {
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  iconText: {
    fontSize: rfs(18),
    fontWeight: "900",
    color: "#111827",
    lineHeight: rfs(20),
  },
  iconTextWhite: {
    fontSize: rfs(18),
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: rfs(20),
  },

  noteCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(20),
    borderBottomRightRadius: rs(20),
    overflow: "hidden",
  },
  noteInner: {
    paddingTop: rs(38),
    paddingBottom: rs(19),
    paddingHorizontal: rs(26),
    borderBottomWidth: rs(1),
    borderBottomColor: "#F2F2F2",
  },
  noteText: {
    color: "#111827",
    fontSize: rfs(14),
    lineHeight: rfs(20),
    fontWeight: "500",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: rs(52),
  },
  divider: {
    width: rs(1),
    height: "100%",
    backgroundColor: "#F2F2F2",
  },

  infoCard: {
    marginTop: rs(10),
    marginHorizontal: rs(24),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingVertical: rs(15),
    paddingHorizontal: rs(16),
    gap: rs(20),
  },
  infoRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoRowMid: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
  },
  infoRowBot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(5),
  },
  infoIcon: {
    fontSize: rfs(16),
    lineHeight: rfs(18),
  },
  infoChevron: {
    fontSize: rfs(18),
    fontWeight: "900",
    color: "#9CA3AF",
    lineHeight: rfs(20),
  },
  infoMain: {
    color: "#111827",
    fontSize: rfs(14),
    fontWeight: "500",
  },
  infoSub: {
    color: "#9CA3AF",
    fontSize: rfs(12),
  },

  modalDim: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  modalCard: {
    width: "100%",
    maxWidth: rs(380),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    paddingHorizontal: rs(18),
    paddingVertical: rs(16),
  },
  modalTitle: {
    fontSize: rfs(16),
    fontWeight: "800",
    color: "#111827",
  },
  modalSub: {
    marginTop: rs(8),
    fontSize: rfs(13),
    lineHeight: rfs(18),
    color: "#6B7280",
  },
  modalBtns: {
    marginTop: rs(14),
    flexDirection: "row",
    gap: rs(10),
    justifyContent: "flex-end",
  },
  modalBtn: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(10),
    borderRadius: rs(12),
  },
  modalDanger: {
    backgroundColor: "#FEE2E2",
  },
  modalNormal: {
    backgroundColor: "#F3F4F6",
  },
  modalPrimary: {
    backgroundColor: "#DBEAFE",
  },
  modalBtnTextDanger: {
    color: "#B91C1C",
    fontWeight: "800",
  },
  modalBtnText: {
    color: "#111827",
    fontWeight: "800",
  },
  modalBtnTextPrimary: {
    color: "#1D4ED8",
    fontWeight: "800",
  },
});
