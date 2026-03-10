import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBar from "@/components/common/SearchBar";
import SearchSuggestions from "@/components/common/SearchSuggestions";
import SimpleHeader from "@/components/common/SimpleHeader";
import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import NoticeIcon from "@/assets/icon/notice/NoticeIcon";
import {
  autocompleteApi,
  BirdInfo,
  fetchBookmarkListApi,
  getBirdInfoByNameApi,
  toggleBookmarkApi,
} from "@/services/api/birds";
import {
  createBirdIdSuggestionApi,
  getBirdIdSuggestionsApi,
  toggleBirdIdSuggestionAgreeApi,
  toggleBirdIdSuggestionDisagreeApi,
} from "@/services/api/birdIdSuggestions";
import { useAuth } from "@/hooks/useAuth";
import { useSaerokForm } from "@/states/useSaerokForm";
import { rs } from "@/theme";

type VoteUi = {
  agreeCount: number;
  disagreeCount: number;
  isAgreedByMe: boolean;
  isDisagreedByMe: boolean;
};

export default function SearchBirdScreen() {
  const router = useRouter();
  const { mode, collectionId, q: initialQ } = useLocalSearchParams<{
    mode?: string;
    collectionId?: string;
    q?: string;
  }>();
  const suggestionMode = mode === "bird-id-suggestion";
  const suggestionCollectionId = Number(collectionId);
  const { isLoggedIn } = useAuth();
  const { setBirdName, setBirdId } = useSaerokForm();

  const inputRef = useRef<TextInput>(null);
  const [q, setQ] = useState(initialQ ?? "");
  const [suggestions, setSuggestions] = useState<BirdInfo[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [suggestionVotes, setSuggestionVotes] = useState<
    Record<number, VoteUi>
  >({});
  const [voteConfirmTarget, setVoteConfirmTarget] = useState<BirdInfo | null>(
    null,
  );
  const [skipAgreeConfirm, setSkipAgreeConfirm] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (typeof initialQ === "string") setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    if (!voteConfirmTarget) {
      anim.setValue(0);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [anim, voteConfirmTarget]);

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      const term = q.trim();
      if (!term) {
        try {
          const res = await fetchBookmarkListApi();
          const list = res.data?.items ?? res.data ?? [];
          const infos: BirdInfo[] = list.map((b: any) => ({
            birdId: b.birdId,
            koreanName: b.koreanName,
            scientificName: b.scientificName,
          }));
          if (canceled) return;
          setSuggestions(infos);
          setBookmarkedIds(new Set(infos.map((x) => x.birdId)));
        } catch {
          if (!canceled) setSuggestions([]);
        }
        return;
      }

      try {
        const res = await autocompleteApi(term);
        const names: string[] = res.data?.suggestions ?? [];
        const infos = await Promise.all(
          names.map((name) => getBirdInfoByNameApi(name)),
        );
        if (!canceled) {
          setSuggestions(infos.filter((x): x is BirdInfo => x !== null));
        }
      } catch {
        if (!canceled) setSuggestions([]);
      }
    };

    const t = setTimeout(load, 300);
    return () => {
      canceled = true;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    if (!suggestionMode || !Number.isFinite(suggestionCollectionId)) return;
    let canceled = false;

    (async () => {
      try {
        const res = await getBirdIdSuggestionsApi(suggestionCollectionId, {
          authenticated: isLoggedIn,
        });
        if (canceled) return;
        const next: Record<number, VoteUi> = {};
        for (const item of res.items ?? []) {
          next[item.birdId] = {
            agreeCount: item.agreeCount,
            disagreeCount: item.disagreeCount,
            isAgreedByMe: item.isAgreedByMe,
            isDisagreedByMe: item.isDisagreedByMe,
          };
        }
        setSuggestionVotes(next);
      } catch {}
    })();

    return () => {
      canceled = true;
    };
  }, [suggestionMode, suggestionCollectionId, isLoggedIn]);

  const onSelect = (info: BirdInfo) => {
    if (suggestionMode && Number.isFinite(suggestionCollectionId)) {
      void (async () => {
        try {
          await createBirdIdSuggestionApi(suggestionCollectionId, info.birdId);
          router.back();
        } catch {}
      })();
      return;
    }

    setBirdName(info.koreanName);
    setBirdId(info.birdId);
    router.back();
  };

  const onPressDetail = (birdId: number) => {
    router.push({
      pathname: "/(tabs)/dex/[birdId]" as any,
      params: {
        birdId: String(birdId),
        returnTo: "/saerok/search-bird",
        returnMode: suggestionMode ? "bird-id-suggestion" : undefined,
        returnCollectionId:
          suggestionMode && Number.isFinite(suggestionCollectionId)
            ? String(suggestionCollectionId)
            : undefined,
        returnQ: q,
      },
    });
  };

  const toggleBookmark = async (id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      await toggleBookmarkApi(id);
    } catch {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  const onPressAgreeSuggestion = async (info: BirdInfo) => {
    if (!suggestionMode || !Number.isFinite(suggestionCollectionId)) return;
    const currentVote = suggestionVotes[info.birdId];
    if (currentVote?.isAgreedByMe) {
      await submitAgreeSuggestion(info);
      return;
    }
    if (!skipAgreeConfirm) {
      setVoteConfirmTarget(info);
      return;
    }
    await submitAgreeSuggestion(info);
  };

  const submitAgreeSuggestion = async (info: BirdInfo) => {
    if (!suggestionMode || !Number.isFinite(suggestionCollectionId)) return;
    try {
      const res = await toggleBirdIdSuggestionAgreeApi(
        suggestionCollectionId,
        info.birdId,
      );
      setSuggestionVotes((prev) => ({ ...prev, [info.birdId]: res }));
    } catch {}
  };

  const onPressDisagreeSuggestion = async (info: BirdInfo) => {
    if (!suggestionMode || !Number.isFinite(suggestionCollectionId)) return;
    try {
      const res = await toggleBirdIdSuggestionDisagreeApi(
        suggestionCollectionId,
        info.birdId,
      );
      setSuggestionVotes((prev) => ({ ...prev, [info.birdId]: res }));
    } catch {}
  };

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const opacity = anim;

  return (
    <SafeAreaView style={styles.root}>
      <SimpleHeader
        title={
          suggestionMode
            ? "\uc774 \uc0c8 \uac19\uc544\uc694!"
            : "\uc774\ub984 \ucc3e\uae30"
        }
      />

      <View style={styles.searchSection}>
        <SearchBar
          ref={inputRef}
          value={q}
          onChangeText={setQ}
          placeholder={
            suggestionMode
              ? "\uc0c8 \uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694"
              : "\uc0c8 \uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694"
          }
          onSubmit={() => {}}
          onBack={() => router.back()}
          onClear={() => setQ("")}
        />
      </View>

      <SearchSuggestions
        visible={true}
        suggestions={suggestions}
        onSelect={onSelect}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={toggleBookmark}
        onPressDetail={onPressDetail}
        suggestionVotes={suggestionMode ? suggestionVotes : undefined}
        onPressAgreeSuggestion={
          suggestionMode ? onPressAgreeSuggestion : undefined
        }
        onPressDisagreeSuggestion={
          suggestionMode ? onPressDisagreeSuggestion : undefined
        }
      />

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
          <Animated.View
            style={[styles.modalWrap, { opacity, transform: [{ scale }] }]}
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
                  {`‘${voteConfirmTarget?.koreanName ?? ""}’\uac00 \ub9de\ub098\uc694?`}
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
                  <Text style={styles.confirmLeftBtnText}>
                    {"\ucde8\uc18c"}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.confirmRightBtn}
                  onPress={() => {
                    const t = voteConfirmTarget;
                    setVoteConfirmTarget(null);
                    if (t) void submitAgreeSuggestion(t);
                  }}
                >
                  <Text style={styles.confirmRightBtnText}>
                    {"\ub3d9\uc815 \ub3d5\uae30"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F7F7" },
  searchSection: {
    paddingHorizontal: rs(24),
    paddingTop: rs(10),
    paddingBottom: rs(20),
    backgroundColor: "#FFFFFF",
  },
  confirmDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  modalWrap: { width: "100%", alignItems: "center" },
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
    fontSize: rs(14),
  },
  confirmSubText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: rs(13),
    lineHeight: rs(18),
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
    borderWidth: rs(1.5),
    borderColor: "#A3A3A3",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCheckCircleActive: { borderColor: "#91BFFF" },
  confirmCheckDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: "#91BFFF",
  },
  confirmCheckText: {
    color: "#979797",
    fontSize: rs(12),
    lineHeight: rs(16),
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
    fontSize: rs(15),
    fontWeight: "600",
    lineHeight: rs(18),
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
    fontSize: rs(15),
    fontWeight: "600",
    lineHeight: rs(18),
  },
});
