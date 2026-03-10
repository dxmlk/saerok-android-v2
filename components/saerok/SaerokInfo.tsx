import React, { useMemo, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import CollectionLikeButton from "@/components/saerok/CollectionLikeButton";
import CollectionCommentButton from "@/components/saerok/CollectionCommentButton";
import EmptyState from "@/components/common/EmptyState";
import { font, rfs, rs } from "@/theme";
import TrapBgIcon from "@/assets/icon/saerok/TrapBgIcon";
import EditIcon from "@/assets/icon/saerok/EditIcon";
import DexIcon from "@/assets/icon/saerok/DexIcon";
import IdentifyHelpIcon from "@/assets/icon/saerok/IdentifyHelpIcon";
import AdoptCheckIcon from "@/assets/icon/saerok/AdoptCheckIcon";
import SuggestionAgreeIcon from "@/assets/icon/saerok/SuggestionAgreeIcon";
import SuggestionDisagreeIcon from "@/assets/icon/saerok/SuggestionDisagreeIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import LocationInfoIcon from "@/assets/icon/saerok/LocationInfoIcon";
import DateInfoIcon from "@/assets/icon/saerok/DateInfoIcon";
import VisibilityInfoIcon from "@/assets/icon/saerok/VisibilityInfoIcon";
import CrownYellowIcon from "@/assets/icon/saerok/CrownYellowIcon";
import MoreVerticalIcon from "@/assets/icon/saerok/MoreVerticalIcon";
import AddImageIcon from "@/assets/icon/button/AddImageIcon";
import { useAuth } from "@/hooks/useAuth";
import {
  adoptBirdIdSuggestionApi,
  BirdIdSuggestionItem,
  getBirdIdSuggestionsApi,
  toggleBirdIdSuggestionAgreeApi,
  toggleBirdIdSuggestionDisagreeApi,
} from "@/services/api/birdIdSuggestions";
import FootprintsLoading from "../common/FootprintsLoading";

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
  createdAt: string;
  address: string;
  locationAlias: string;
  note: string;
  accessLevel: "PUBLIC" | "PRIVATE";
  birdInfo: BirdInfo;
  user: UserInfo;
  isMine?: boolean;
};

function formatDate(dateString: string) {
  if (!dateString) return "";
  const [y, m, d] = dateString.split("-");
  return `${y}.${m}.${d}.`;
}

function formatElapsed(createdAt: string) {
  if (!createdAt) return "";
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return "";
  const diffMs = Math.max(0, Date.now() - created);
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 31) return `${diffDay}일 전`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${Math.min(diffMonth, 12)}달 전`;
}

export default function SaerokInfo({
  collectionId,
  img,
  date,
  createdAt,
  address,
  locationAlias,
  note,
  birdInfo,
  user,
  accessLevel,
  isMine = false,
}: SaerokInfoProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [alertOpen, setAlertOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [heroRatio, setHeroRatio] = useState<number | null>(null);
  const [suggestionSheetOpen, setSuggestionSheetOpen] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<BirdIdSuggestionItem[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<BirdIdSuggestionItem | null>(null);
  const [suggestionPreviewRatioMap, setSuggestionPreviewRatioMap] = useState<
    Record<number, number>
  >({});
  const [suggestionPreviewRatio, setSuggestionPreviewRatio] = useState<
    number | null
  >(null);
  const [suggestionPreviewLoading, setSuggestionPreviewLoading] =
    useState(false);
  const [suggestionPreviewHasShown, setSuggestionPreviewHasShown] =
    useState(false);
  const previewOpacity = React.useRef(new Animated.Value(1)).current;
  const [voteConfirmTarget, setVoteConfirmTarget] =
    useState<BirdIdSuggestionItem | null>(null);
  const [adoptConfirmTarget, setAdoptConfirmTarget] =
    useState<BirdIdSuggestionItem | null>(null);
  const [skipAgreeConfirm, setSkipAgreeConfirm] = useState(false);
  const [sheetActionLoadingBirdId, setSheetActionLoadingBirdId] = useState<
    number | null
  >(null);

  const selectedSuggestionRatio = selectedSuggestion?.birdId
    ? (suggestionPreviewRatioMap[selectedSuggestion.birdId] ??
      suggestionPreviewRatio)
    : null;

  const dateText = useMemo(() => formatDate(date), [date]);
  const elapsedText = useMemo(() => formatElapsed(createdAt), [createdAt]);
  const isUnknownBird = !birdInfo.koreanName;

  const onEdit = () => {
    router.push(`/saerok/write/${collectionId}`);
  };

  const onOpenImageViewer = () => {
    if (!img) return;
    router.push({
      pathname: "/saerok/image-viewer" as any,
      params: { uri: img, collectionId: String(collectionId) },
    });
  };

  const onDex = () => {
    if (isUnknownBird) {
      void openSuggestionSheet();
      return;
    }
    if (birdInfo.koreanName && birdInfo.birdId) {
      router.push({
        pathname: "/(tabs)/dex/[birdId]" as any,
        params: {
          birdId: String(birdInfo.birdId),
          returnTo: "/saerok/[collectionId]",
          returnCollectionId: String(collectionId),
        },
      });
      return;
    }
    setAlertOpen(true);
  };

  const openSuggestionSheet = async () => {
    setSuggestionSheetOpen(true);
    setSuggestionLoading(true);
    setSuggestionError(null);
    try {
      const res = await getBirdIdSuggestionsApi(collectionId, {
        authenticated: isLoggedIn,
      });
      const sorted = [...(res.items ?? [])].sort(
        (a, b) =>
          b.agreeCount - a.agreeCount || a.disagreeCount - b.disagreeCount,
      );
      setSuggestions(sorted);
      setSelectedSuggestion((prev) => {
        if (!sorted.length) return null;
        if (prev) {
          const found = sorted.find((x) => x.birdId === prev.birdId);
          if (found) return found;
        }
        return sorted[0];
      });
    } catch {
      setSuggestionError(
        "\ub3d9\uc815 \uc758\uacac\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc5b4\uc694.",
      );
      setSuggestions([]);
      setSelectedSuggestion(null);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const applyVoteResultToSuggestions = (
    birdId: number,
    patch: {
      agreeCount: number;
      disagreeCount: number;
      isAgreedByMe: boolean;
      isDisagreedByMe: boolean;
    },
  ) => {
    setSuggestions((prev) => {
      const next = prev.map((item) =>
        item.birdId === birdId ? { ...item, ...patch } : item,
      );
      next.sort(
        (a, b) =>
          b.agreeCount - a.agreeCount || a.disagreeCount - b.disagreeCount,
      );
      return next;
    });
    setSelectedSuggestion((prev) =>
      prev?.birdId === birdId ? { ...prev, ...patch } : prev,
    );
  };

  const handlePressAgree = (s: BirdIdSuggestionItem) => {
    setSelectedSuggestion(s);
    if (s.isAgreedByMe) {
      void submitAgreeVote(s);
      return;
    }
    if (skipAgreeConfirm) {
      void submitAgreeVote(s);
      return;
    }
    setVoteConfirmTarget(s);
  };

  const submitAgreeVote = async (s: BirdIdSuggestionItem) => {
    try {
      setSheetActionLoadingBirdId(s.birdId);
      const res = await toggleBirdIdSuggestionAgreeApi(collectionId, s.birdId);
      applyVoteResultToSuggestions(s.birdId, res);
    } catch {
      setSuggestionError(
        "\ub3d9\uc758 \ud22c\ud45c\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.",
      );
    } finally {
      setSheetActionLoadingBirdId(null);
    }
  };

  const submitDisagreeVote = async (s: BirdIdSuggestionItem) => {
    try {
      setSelectedSuggestion(s);
      setSheetActionLoadingBirdId(s.birdId);
      const res = await toggleBirdIdSuggestionDisagreeApi(
        collectionId,
        s.birdId,
      );
      applyVoteResultToSuggestions(s.birdId, res);
    } catch {
      setSuggestionError(
        "\ube44\ub3d9\uc758 \ud22c\ud45c\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.",
      );
    } finally {
      setSheetActionLoadingBirdId(null);
    }
  };

  const submitAdopt = async (s: BirdIdSuggestionItem) => {
    try {
      setSheetActionLoadingBirdId(s.birdId);
      await adoptBirdIdSuggestionApi(collectionId, s.birdId);
      setSuggestionSheetOpen(false);
      router.replace({
        pathname: "/saerok/[collectionId]" as any,
        params: { collectionId: String(collectionId) },
      });
    } catch {
      setSuggestionError("\ucc44\ud0dd\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.");
    } finally {
      setSheetActionLoadingBirdId(null);
      setAdoptConfirmTarget(null);
    }
  };

  const onReport = () => {
    setReportOpen(true);
  };

  React.useEffect(() => {
    if (!img) {
      setHeroRatio(null);
      return;
    }
    let cancelled = false;
    Image.getSize(
      img,
      (w, h) => {
        if (cancelled) return;
        if (!w || !h) return;
        setHeroRatio(w / h);
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [img]);

  React.useEffect(() => {
    const uri = selectedSuggestion?.birdImageUrl;
    const birdId = selectedSuggestion?.birdId;
    if (!uri || !birdId) {
      setSuggestionPreviewRatio(null);
      return;
    }

    const cached = suggestionPreviewRatioMap[birdId];
    if (cached) {
      setSuggestionPreviewRatio(cached);
      return;
    }

    let cancelled = false;
    Image.getSize(
      uri,
      (w, h) => {
        if (cancelled) return;
        if (!w || !h) return;
        const ratio = w / h;
        setSuggestionPreviewRatio(ratio);
        setSuggestionPreviewRatioMap((prev) =>
          prev[birdId] ? prev : { ...prev, [birdId]: ratio },
        );
      },
      () => {
        if (!cancelled && !suggestionPreviewRatio)
          setSuggestionPreviewRatio(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [
    selectedSuggestion?.birdId,
    selectedSuggestion?.birdImageUrl,
    suggestionPreviewRatio,
    suggestionPreviewRatioMap,
  ]);

  React.useEffect(() => {
    suggestions.forEach((s) => {
      if (!s.birdImageUrl) return;
      if (suggestionPreviewRatioMap[s.birdId]) return;
      Image.prefetch(s.birdImageUrl).catch(() => {});
      Image.getSize(
        s.birdImageUrl,
        (w, h) => {
          if (!w || !h) return;
          const ratio = w / h;
          setSuggestionPreviewRatioMap((prev) =>
            prev[s.birdId] ? prev : { ...prev, [s.birdId]: ratio },
          );
        },
        () => {},
      );
    });
  }, [suggestions, suggestionPreviewRatioMap]);

  React.useEffect(() => {
    if (!selectedSuggestion?.birdImageUrl) {
      setSuggestionPreviewLoading(false);
      setSuggestionPreviewHasShown(false);
      previewOpacity.setValue(1);
      return;
    }
    setSuggestionPreviewLoading(true);
    if (!suggestionPreviewHasShown) {
      previewOpacity.setValue(0);
    }
  }, [
    previewOpacity,
    selectedSuggestion?.birdImageUrl,
    suggestionPreviewHasShown,
  ]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.page}>
        <View style={styles.heroWrap}>
          <Pressable onPress={onOpenImageViewer} disabled={!img}>
            {img ? (
              <Image
                source={{ uri: img }}
                style={[
                  styles.heroImg,
                  heroRatio ? { aspectRatio: heroRatio } : styles.heroFallback,
                ]}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.heroImg,
                  styles.heroFallback,
                  { backgroundColor: "#E5E7EB" },
                ]}
              />
            )}
          </Pressable>
        </View>

        <View style={styles.mainBlock}>
          <View style={styles.titleArea}>
            <View style={styles.titlePill}>
              <Text
                numberOfLines={1}
                style={[
                  styles.titleText,
                  isUnknownBird && styles.titleTextUnknown,
                ]}
              >
                {birdInfo.koreanName ?? "이름 모를 새"}
              </Text>
            </View>

            <View style={styles.trapWrap}>
              <View style={styles.trapBg}>
                <TrapBgIcon width={rs(127)} height={rs(60)} />
              </View>
              <View style={styles.trapBtns}>
                <Pressable
                  onPress={onDex}
                  style={[
                    styles.iconBtn,
                    isUnknownBird ? styles.yellowBtn : styles.blueBtn,
                  ]}
                >
                  {isUnknownBird ? (
                    <IdentifyHelpIcon
                      width={rs(24)}
                      height={rs(24)}
                      color="#FEFEFE"
                    />
                  ) : (
                    <DexIcon
                      width={rs(22)}
                      height={rs(21.319)}
                      color="#FEFEFE"
                    />
                  )}
                </Pressable>

                {isMine ? (
                  <Pressable
                    onPress={onEdit}
                    style={[styles.iconBtn, styles.glassBtn]}
                  >
                    <EditIcon width={rs(24)} height={rs(24)} color="#0D0D0D" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={onReport}
                    style={[styles.iconBtn, styles.glassBtn]}
                  >
                    <MoreVerticalIcon
                      width={rs(24)}
                      height={rs(24)}
                      color="#0D0D0D"
                    />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          <View style={styles.noteCard}>
            <View style={styles.noteInner}>
              <Text style={styles.noteText}>{note}</Text>
              <Text style={styles.noteTime}>{elapsedText}</Text>
            </View>

            <View style={styles.actionRow}>
              <CollectionLikeButton collectionId={collectionId} />
              <View style={styles.divider} />
              <CollectionCommentButton
                collectionId={collectionId}
                authorNickname={user?.nickname ?? null}
              />
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRowTop}>
            <View style={styles.infoLeft}>
              <LocationInfoIcon
                width={rs(17)}
                height={rs(17)}
                color="#F7BE65"
              />
              <View style={{ flexDirection: "column", gap: rs(5) }}>
                <Text style={styles.infoMain}>{locationAlias}</Text>
                <Text style={styles.infoSub}>{address}</Text>
              </View>
            </View>
            <InfoChevronIcon width={rs(17)} height={rs(17)} color="#979797" />
          </View>

          <View style={styles.infoRowMid}>
            <DateInfoIcon width={rs(17)} height={rs(17)} color="#F7BE65" />
            <Text style={styles.infoMain}>{dateText}</Text>
          </View>

          {isMine ? (
            <View style={styles.infoRowBot}>
              <View style={styles.infoLeft}>
                <VisibilityInfoIcon
                  width={rs(17)}
                  height={rs(17)}
                  color="#F7BE65"
                />
                <Text style={styles.infoMain}>
                  {/* TODO: 나만 보기 상태일 때 아이콘 다른 걸로, 잠긴 자물쇠로 */}
                  {accessLevel === "PUBLIC" ? "함께 보기" : "나만 보기"}
                </Text>
              </View>
              <InfoChevronIcon width={rs(17)} height={rs(17)} color="#979797" />
            </View>
          ) : null}
        </View>
      </View>

      {reportOpen ? (
        <View style={styles.modalDim}>
          <View style={styles.reportModalCard}>
            <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />
            <Pressable
              onPress={() => setReportOpen(false)}
              style={styles.reportModalCloseBtn}
              hitSlop={12}
            >
              <CloseLineIcon width={rs(16)} height={rs(16)} color="#979797" />
            </Pressable>
            <Text style={styles.reportModalTitle}>
              {
                "\uac8c\uc2dc\ubb3c\uc744 \uc2e0\uace0\ud558\uc2dc\uaca0\uc5b4\uc694?"
              }
            </Text>
            <Text style={styles.reportModalSub}>
              {
                "\ucee4\ubba4\ub2c8\ud2f0 \uac00\uc774\ub4dc\uc5d0 \ub530\ub77c\n\uc2e0\uace0 \uc0ac\uc720\uc5d0 \ud574\ub2f9\ud558\ub294\uc9c0 \uac80\ud1a0 \ud6c4 \ucc98\ub9ac\ub3fc\uc694."
              }
            </Text>

            <View style={styles.reportModalBtns}>
              <Pressable
                onPress={() => setReportOpen(false)}
                style={[styles.reportModalBtn, styles.reportModalBtnDanger]}
              >
                <Text style={styles.reportModalBtnTextDanger}>
                  {"\uc2e0\uace0\ud558\uae30"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setReportOpen(false)}
                style={[styles.reportModalBtn, styles.reportModalBtnPrimary]}
              >
                <Text style={styles.reportModalBtnTextPrimary}>
                  {"\ub3cc\uc544\uac00\uae30"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      <Modal
        transparent
        visible={suggestionSheetOpen}
        animationType="fade"
        onRequestClose={() => setSuggestionSheetOpen(false)}
      >
        <View style={styles.suggestionDim}>
          <Pressable
            style={styles.suggestionBackdrop}
            onPress={() => setSuggestionSheetOpen(false)}
          />

          {selectedSuggestion?.birdImageUrl ? (
            <View
              style={[
                styles.suggestionPreviewWrap,
                selectedSuggestionRatio
                  ? selectedSuggestionRatio >= 1
                    ? {
                        width: rs(250),
                        height: rs(250) / selectedSuggestionRatio,
                        marginLeft: -rs(125),
                      }
                    : {
                        width: rs(250) * selectedSuggestionRatio,
                        height: rs(250),
                        marginLeft: -(rs(250) * selectedSuggestionRatio) / 2,
                      }
                  : {
                      width: rs(250),
                      height: rs(250),
                      marginLeft: -rs(125),
                    },
              ]}
            >
              {suggestionPreviewLoading && !suggestionPreviewHasShown ? (
                <View style={styles.suggestionPreviewSkeleton} />
              ) : null}
              {selectedSuggestionRatio ? (
                <Animated.View
                  style={[
                    styles.suggestionPreviewImageWrap,
                    { opacity: previewOpacity },
                  ]}
                >
                  <Image
                    source={{ uri: selectedSuggestion.birdImageUrl }}
                    style={styles.suggestionPreviewImage}
                    resizeMode="contain"
                    onLoadStart={() => {
                      setSuggestionPreviewLoading(true);
                      if (!suggestionPreviewHasShown)
                        previewOpacity.setValue(0);
                    }}
                    onLoadEnd={() => {
                      setSuggestionPreviewLoading(false);
                      setSuggestionPreviewHasShown(true);
                      Animated.timing(previewOpacity, {
                        toValue: 1,
                        duration: 120,
                        useNativeDriver: true,
                      }).start();
                    }}
                  />
                </Animated.View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.suggestionSheet}>
            <View style={styles.suggestionHandle} />
            <View style={styles.suggestionHeaderRow}>
              <View>
                <Text style={styles.suggestionTitle}>{"이 새 같아요!"}</Text>
                <Text style={styles.suggestionSub}>
                  {isMine
                    ? "다른 사용자들이 이 새의 이름을 알려주고 있어요."
                    : `${user.nickname}님에게 새의 이름을 알려주세요.`}
                </Text>
              </View>
              <Pressable
                onPress={() => setSuggestionSheetOpen(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.suggestionCloseText}>{"\u00d7"}</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.suggestionListScroll}
              contentContainerStyle={styles.suggestionListContent}
              showsVerticalScrollIndicator={false}
            >
              {suggestionLoading ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <FootprintsLoading scale={0.8} />
                </View>
              ) : suggestionError ? (
                <Text style={styles.suggestionPlaceholderText}>
                  {suggestionError}
                </Text>
              ) : suggestions.length === 0 ? (
                isMine ? (
                  <EmptyState
                    bgColor="gray"
                    upperText={"아직 새 이름을 아는 친구가 없네요."}
                    lowerText={
                      "누군가 이름 후보를 등록하면 알림으로 알려드릴게요."
                    }
                  />
                ) : (
                  <Pressable
                    style={styles.addCandidateRow}
                    onPress={() => {
                      setSuggestionSheetOpen(false);
                      router.push({
                        pathname: "/saerok/search-bird" as any,
                        params: {
                          mode: "bird-id-suggestion",
                          collectionId: String(collectionId),
                        },
                      });
                    }}
                  >
                    <Text style={styles.addCandidateText}>
                      {"\ud6c4\ubcf4 \ucd94\uac00\ud558\uae30"}
                    </Text>
                    <View style={styles.addCandidatePlusWrap}>
                      <AddImageIcon
                        width={rs(24)}
                        height={rs(24)}
                        color="#4190FF"
                      />
                    </View>
                  </Pressable>
                )
              ) : (
                <>
                  {suggestions.map((s, index) => (
                    <Pressable
                      key={s.birdId}
                      style={[
                        styles.suggestionItemCard,
                        selectedSuggestion?.birdId === s.birdId &&
                          styles.suggestionItemCardSelected,
                      ]}
                      onPress={() => setSelectedSuggestion(s)}
                    >
                      <View style={styles.suggestionItemMain}>
                        <View style={styles.suggestionNameRow}>
                          <Text style={styles.suggestionNameText}>
                            {s.birdKoreanName}
                          </Text>
                          {index === 0 ? (
                            <View style={styles.crownWrap}>
                              <CrownYellowIcon width={rs(17)} height={rs(17)} />
                            </View>
                          ) : null}
                        </View>
                        <Text
                          style={styles.suggestionScientificText}
                          numberOfLines={1}
                        >
                          {s.birdScientificName}
                        </Text>
                      </View>

                      {isMine ? (
                        <View style={styles.adoptArea}>
                          <Pressable
                            style={styles.adoptBtn}
                            onPress={() => {
                              setSelectedSuggestion(s);
                              setAdoptConfirmTarget(s);
                            }}
                            disabled={sheetActionLoadingBirdId === s.birdId}
                          >
                            <View style={styles.adoptBtnInner}>
                              <AdoptCheckIcon
                                width={rs(24)}
                                height={rs(24)}
                                color="#0D0D0D"
                              />
                              <Text style={styles.adoptBtnText}>{"채택"}</Text>
                            </View>
                          </Pressable>
                          <View style={styles.voteArea}>
                            <View style={styles.voteOne}>
                              <SuggestionAgreeIcon
                                width={rs(24)}
                                height={rs(24)}
                              />
                              <Text style={styles.voteCountText}>
                                {s.agreeCount}
                              </Text>
                            </View>
                            <View style={styles.voteOne}>
                              <SuggestionDisagreeIcon
                                width={rs(24)}
                                height={rs(24)}
                              />
                              <Text style={styles.voteCountText}>
                                {s.disagreeCount}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.voteArea}>
                          <Pressable
                            style={styles.voteOne}
                            onPress={() => handlePressAgree(s)}
                            disabled={sheetActionLoadingBirdId === s.birdId}
                          >
                            <View
                              style={[
                                styles.voteCircleBtn,
                                s.isAgreedByMe && styles.voteCircleBtnActive,
                              ]}
                            >
                              <SuggestionAgreeIcon
                                width={rs(24)}
                                height={rs(24)}
                                color={s.isAgreedByMe ? "#FFFFFF" : "#4190FF"}
                              />
                            </View>
                            <Text style={styles.voteCountText}>
                              {s.agreeCount}
                            </Text>
                          </Pressable>
                          <Pressable
                            style={styles.voteOne}
                            onPress={() => void submitDisagreeVote(s)}
                            disabled={sheetActionLoadingBirdId === s.birdId}
                          >
                            <View
                              style={[
                                styles.voteXBtn,
                                s.isDisagreedByMe && styles.voteXBtnActive,
                              ]}
                            >
                              <SuggestionDisagreeIcon
                                width={rs(24)}
                                height={rs(24)}
                                color={
                                  s.isDisagreedByMe ? "#FFFFFF" : "#FF234F"
                                }
                              />
                            </View>
                            <Text style={styles.voteCountText}>
                              {s.disagreeCount}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </Pressable>
                  ))}

                  {!isMine ? (
                    <Pressable
                      style={styles.addCandidateRow}
                      onPress={() => {
                        setSuggestionSheetOpen(false);
                        router.push({
                          pathname: "/saerok/search-bird" as any,
                          params: {
                            mode: "bird-id-suggestion",
                            collectionId: String(collectionId),
                          },
                        });
                      }}
                    >
                      <Text style={styles.addCandidateText}>
                        {"\ud6c4\ubcf4 \ucd94\uac00\ud558\uae30"}
                      </Text>
                      <View style={styles.addCandidatePlusWrap}>
                        <AddImageIcon
                          width={rs(24)}
                          height={rs(24)}
                          color="#4190FF"
                        />
                      </View>
                    </Pressable>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={!!voteConfirmTarget}
        animationType="fade"
        onRequestClose={() => setVoteConfirmTarget(null)}
      >
        <Pressable
          style={styles.confirmDim}
          onPress={() => setVoteConfirmTarget(null)}
        >
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <Pressable
              style={styles.confirmCloseBtn}
              onPress={() => setVoteConfirmTarget(null)}
            >
              <CloseLineIcon width={rs(20)} height={rs(20)} color="#979797" />
            </Pressable>

            <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

            <View style={styles.confirmTextBlock}>
              <Text style={styles.confirmMainText}>
                {`‘${voteConfirmTarget?.birdKoreanName ?? ""}’\uac00 \ub9de\ub098\uc694?`}
              </Text>
              <Text style={styles.confirmSubText}>
                {
                  "\uc815\ud655\ud558\uc9c0 \uc54a\uc740 \uc774\ub984\uc758 \uc81c\uc548\uc740 \uc0ac\uc6a9\uc790\ub4e4\uc5d0\uac8c\n\ud63c\ub780\uc744 \uc77c\uc73c\ud0ac \uc218 \uc788\uc5b4\uc694."
                }
              </Text>
            </View>

            <Pressable
              style={styles.confirmCheckRow}
              onPress={() => setSkipAgreeConfirm((v) => !v)}
            >
              <View
                style={[
                  styles.confirmCheckCircle,
                  skipAgreeConfirm && styles.confirmCheckCircleActive,
                ]}
              >
                {skipAgreeConfirm ? (
                  <View style={styles.confirmCheckDot} />
                ) : null}
              </View>
              <Text style={styles.confirmCheckText}>
                {"\ub2e4\uc2dc \ubcf4\uc9c0 \uc54a\uae30"}
              </Text>
            </Pressable>

            <View style={styles.confirmBtnRow}>
              <Pressable
                style={styles.confirmLeftBtn}
                onPress={() => setVoteConfirmTarget(null)}
              >
                <Text style={styles.confirmLeftBtnText}>{"\ucde8\uc18c"}</Text>
              </Pressable>
              <Pressable
                style={styles.confirmRightBtn}
                onPress={() => {
                  const target = voteConfirmTarget;
                  setVoteConfirmTarget(null);
                  if (target) void submitAgreeVote(target);
                }}
              >
                <Text style={styles.confirmRightBtnText}>
                  {"\ub3d9\uc815 \ub3d5\uae30"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={!!adoptConfirmTarget}
        animationType="fade"
        onRequestClose={() => setAdoptConfirmTarget(null)}
      >
        <Pressable
          style={styles.confirmDim}
          onPress={() => setAdoptConfirmTarget(null)}
        >
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <Pressable
              style={styles.confirmCloseBtn}
              onPress={() => setAdoptConfirmTarget(null)}
            >
              <CloseLineIcon width={rs(20)} height={rs(20)} color="#979797" />
            </Pressable>

            <NoticeIcon width={rs(30)} height={rs(30)} color="#91BFFF" />

            <View style={styles.confirmTextBlock}>
              <Text style={styles.confirmMainText}>
                {`‘${adoptConfirmTarget?.birdKoreanName ?? ""}’\ub85c \ucc44\ud0dd\ud558\uc2dc\uaca0\uc5b4\uc694?`}
              </Text>
              <Text style={styles.confirmSubText}>
                {
                  "\ucc44\ud0dd\ub41c \uc774\ud6c4 \ub3d9\uc815 \ub3d5\uae30 \ucc3d\uc740 \uc0ac\ub77c\uc9c0\uba70,\n\ub2e4\uc2dc \uc774\ub984 \ubaa8\ub97c \uc0c8\ub85c \uc804\ud658\ud558\uba74\n\ubcf4\uc774\uac8c \ud560 \uc218 \uc788\uc5b4\uc694."
                }
              </Text>
            </View>

            <View style={styles.confirmBtnRow}>
              <Pressable
                style={styles.confirmLeftBtn}
                onPress={() => setAdoptConfirmTarget(null)}
              >
                <Text style={styles.confirmLeftBtnText}>{"\ucde8\uc18c"}</Text>
              </Pressable>
              <Pressable
                style={styles.confirmRightBtn}
                onPress={() => {
                  const target = adoptConfirmTarget;
                  if (target) void submitAdopt(target);
                }}
              >
                <Text style={styles.confirmRightBtnText}>
                  {"\ucc44\ud0dd\ud558\uae30"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {alertOpen ? (
        <View style={styles.modalDim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>게시물을 수정하시겠어요?</Text>
            <Text style={styles.modalSub}>
              수정하면 기존 게시물이 삭제되고 새로운 게시물이 등록됩니다.
            </Text>

            <View style={styles.modalBtns}>
              <Pressable
                onPress={() => setAlertOpen(false)}
                style={[styles.modalBtn, styles.modalNormal]}
              >
                <Text style={styles.modalBtnText}>취소</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAlertOpen(false);
                  router.push(`/saerok/write/${collectionId}`);
                }}
                style={[styles.modalBtn, styles.modalPrimary]}
              >
                <Text style={styles.modalBtnTextPrimary}>수정하기</Text>
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

  heroWrap: {
    paddingTop: rs(14),
    paddingHorizontal: rs(9),
  },
  heroImg: {
    width: "100%",
    borderRadius: rs(35),
  },
  heroFallback: {
    aspectRatio: 1,
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
    fontFamily: font.money,
    fontSize: rfs(20),
    fontWeight: "400",
    lineHeight: rfs(22),
  },
  titleTextUnknown: {
    color: "#979797",
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
    backgroundColor: "#91BFFF",
  },
  yellowBtn: {
    backgroundColor: "#F7BE65",
  },
  glassBtn: {
    backgroundColor: "#FFFFFF",
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
    fontFamily: font.haru,
    color: "#0D0D0D",
    fontSize: rfs(15),
    lineHeight: rfs(22),
    fontWeight: "400",
  },
  noteTime: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
    marginTop: rs(7),
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
    color: "#0D0D0D",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  infoSub: {
    color: "#979797",
    fontSize: rfs(12),
    lineHeight: rfs(16),
    fontWeight: "400",
  },

  suggestionDim: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  suggestionBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  suggestionPreviewWrap: {
    position: "absolute",
    bottom: rs(460 + 15),
    left: "50%",
    borderRadius: rs(24),
    overflow: "hidden",
  },
  suggestionPreviewImage: {
    width: "100%",
    height: "100%",
  },
  suggestionPreviewImageWrap: {
    width: "100%",
    height: "100%",
  },
  suggestionPreviewSkeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E8EAEC",
    borderRadius: rs(24),
  },
  suggestionSheet: {
    height: rs(460),
    backgroundColor: "#F2F2F2",
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    paddingTop: rs(10),
    paddingHorizontal: rs(18),
  },
  suggestionHandle: {
    alignSelf: "center",
    width: rs(84),
    height: rs(5),
    borderRadius: rs(999),
    backgroundColor: "#D9DDDC",
    marginBottom: rs(16),
  },
  suggestionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  suggestionTitle: {
    color: "#0D0D0D",
    fontFamily: font.money,
    fontSize: rfs(18),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  suggestionSub: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  suggestionCloseText: {
    color: "#979797",
    fontSize: rfs(22),
    lineHeight: rfs(22),
  },
  suggestionListScroll: {
    marginTop: rs(26),
  },
  suggestionListContent: {
    paddingBottom: rs(20),
    gap: rs(7),
  },
  suggestionPlaceholderText: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(14),
    textAlign: "center",
    marginTop: rs(40),
  },
  suggestionEmptyWrap: {
    minHeight: rs(260),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(18),
  },
  suggestionEmptyTitle: {
    color: "#0D0D0D",
    fontFamily: font.money,
    fontSize: rfs(16),
    lineHeight: rfs(22),
    textAlign: "center",
  },
  suggestionEmptySub: {
    marginTop: rs(6),
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(13),
    lineHeight: rfs(18),
    textAlign: "center",
  },
  suggestionItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingLeft: rs(19),
    paddingRight: rs(10),
    paddingVertical: rs(11),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestionItemCardSelected: {
    borderWidth: 1,
    borderColor: "#4190FF",
  },
  suggestionItemMain: {
    flex: 1,
  },
  suggestionNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
  },
  crownWrap: {
    marginTop: -rs(1.5),
  },
  suggestionNameText: {
    color: "#0D0D0D",
    fontFamily: font.money,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(17),
  },
  suggestionScientificText: {
    marginTop: rs(2),
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  voteArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(7),
    marginRight: rs(6),
  },
  voteOne: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(2),
  },
  voteCircleBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  voteCircleBtnActive: {
    borderColor: "#F2F2F2",
    backgroundColor: "#4190FF",
  },
  voteXBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  voteXBtnActive: {
    borderColor: "#F2F2F2",
    backgroundColor: "#FF234F",
  },
  voteCountText: {
    color: "#0D0D0D",
    fontFamily: font.regular,
    fontSize: rfs(13),
    lineHeight: rfs(20),
  },
  adoptBtn: {
    height: rs(40),
    borderRadius: rs(30.5),
    borderWidth: 0.35,
    borderColor: "#979797",
    paddingVertical: rs(9),
    paddingLeft: rs(12),
    paddingRight: rs(15),
    alignItems: "center",
    justifyContent: "center",
  },
  adoptBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  adoptArea: {
    alignItems: "flex-end",
    gap: rs(7),
    marginRight: rs(2),
  },
  adoptBtnText: {
    color: "#0D0D0D",
    fontWeight: "600",
    fontSize: rfs(15),
    lineHeight: rfs(18),
  },
  addCandidateRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingLeft: rs(19),
    paddingRight: rs(10),
    paddingVertical: rs(11),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addCandidateText: {
    color: "#4190FF",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  addCandidatePlusWrap: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  addCandidatePlus: {
    color: "#4190FF",
    fontSize: rfs(24),
    lineHeight: rfs(24),
  },

  reportModalCard: {
    width: "100%",
    maxWidth: rs(380),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingHorizontal: rs(24),
    paddingTop: rs(22),
    paddingBottom: rs(20),
    alignItems: "center",
    position: "relative",
  },
  reportModalCloseBtn: {
    position: "absolute",
    top: rs(30),
    right: rs(30),
  },
  reportModalTitle: {
    marginTop: rs(15),
    textAlign: "center",
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(22),
  },
  reportModalSub: {
    marginTop: rs(6),
    textAlign: "center",
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(20),
  },
  reportModalBtns: {
    marginTop: rs(20),
    width: "100%",
    flexDirection: "row",
    gap: rs(16),
  },
  reportModalBtn: {
    flex: 1,
    height: rs(40),
    borderRadius: rs(15),
    alignItems: "center",
    justifyContent: "center",
  },
  reportModalBtnDanger: {
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1.5),
    borderColor: "#D90000",
  },
  reportModalBtnPrimary: {
    backgroundColor: "#91BFFF",
  },
  reportModalBtnTextDanger: {
    color: "#D90000",
    fontFamily: font.semibold,
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  reportModalBtnTextPrimary: {
    color: "#FEFEFE",
    fontFamily: font.semibold,
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },

  confirmDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  confirmCard: {
    width: rs(316),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    paddingHorizontal: rs(16),
    paddingTop: rs(18),
    paddingBottom: rs(18),
    alignItems: "center",
    gap: rs(15),
    position: "relative",
  },
  confirmCloseBtn: {
    position: "absolute",
    right: rs(16),
    top: rs(16),
    zIndex: 1,
  },
  confirmTextBlock: {
    alignItems: "center",
    gap: rs(6),
    paddingHorizontal: rs(6),
  },
  confirmMainText: {
    textAlign: "center",
    color: "#111827",
    fontSize: rfs(14),
    fontFamily: font.money,
  },
  confirmSubText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: rfs(13),
    lineHeight: rfs(18),
    fontFamily: font.regular,
  },
  confirmCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    marginTop: rs(-2),
  },
  confirmCheckCircle: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(9),
    borderWidth: 1.5,
    borderColor: "#A3A3A3",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCheckCircleActive: {
    borderColor: "#91BFFF",
  },
  confirmCheckDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: "#91BFFF",
  },
  confirmCheckText: {
    color: "#979797",
    fontFamily: font.regular,
    fontSize: rfs(12),
    lineHeight: rfs(16),
  },
  confirmBtnRow: {
    marginTop: rs(5),
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rs(16),
    paddingHorizontal: rs(4),
  },
  confirmLeftBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(15),
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1.5),
    borderColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmLeftBtnText: {
    color: "#91BFFF",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  confirmRightBtn: {
    width: rs(128),
    height: rs(40),
    borderRadius: rs(15),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmRightBtnText: {
    color: "#FFFFFF",
    fontSize: rfs(15),
    fontWeight: "600",
    lineHeight: rfs(18),
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
