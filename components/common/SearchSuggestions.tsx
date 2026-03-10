import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { rfs, rs } from "@/theme";
import { font } from "@/theme/typography";
import { BirdInfo } from "@/services/api/birds";
import ScrapIcon from "@/assets/icon/button/ScrapIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import SuggestionAgreeIcon from "@/assets/icon/saerok/SuggestionAgreeIcon";
import SuggestionDisagreeIcon from "@/assets/icon/saerok/SuggestionDisagreeIcon";

type SuggestionVoteUi = {
  agreeCount: number;
  disagreeCount: number;
  isAgreedByMe: boolean;
  isDisagreedByMe: boolean;
};

type Props = {
  visible: boolean;
  suggestions: BirdInfo[];
  onSelect: (info: BirdInfo) => void;
  bookmarkedIds?: Set<number>;
  onToggleBookmark?: (id: number) => void;
  onPressDetail?: (id: number) => void;
  suggestionVotes?: Record<number, SuggestionVoteUi>;
  onPressAgreeSuggestion?: (info: BirdInfo) => void;
  onPressDisagreeSuggestion?: (info: BirdInfo) => void;
};

export default function SearchSuggestions({
  visible,
  suggestions,
  onSelect,
  bookmarkedIds = new Set<number>(),
  onToggleBookmark,
  onPressDetail,
  suggestionVotes,
  onPressAgreeSuggestion,
  onPressDisagreeSuggestion,
}: Props) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <View style={styles.panel}>
      {suggestions.map((info, idx) => {
        const isBookmarked = bookmarkedIds.has(info.birdId);
        const vote = suggestionVotes?.[info.birdId];
        return (
          <Pressable
            key={info.birdId}
            onPress={() => onSelect(info)}
            style={[styles.row, idx === 0 && styles.rowFirst]}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          >
            <View style={styles.rowLeft}>
              <Pressable
                onPress={() => onToggleBookmark?.(info.birdId)}
                hitSlop={rs(8)}
              >
                <ScrapIcon
                  width={rs(24)}
                  height={rs(24)}
                  stroke={isBookmarked ? "#F7BE65" : "#D1D5DB"}
                  fill={isBookmarked ? "#F7BE65" : "none"}
                  color={isBookmarked ? "#F7BE65" : "#D1D5DB"}
                />
              </Pressable>
              <View style={styles.texts}>
                <Text style={styles.kor}>{info.koreanName}</Text>
                <Text style={styles.sci}>{info.scientificName}</Text>
              </View>
            </View>
            {vote ? (
              <View style={styles.voteWrap}>
                <Pressable
                  onPress={() => onPressAgreeSuggestion?.(info)}
                  hitSlop={rs(8)}
                  style={styles.voteBtnOuter}
                >
                  <View
                    style={[
                      styles.voteCircle,
                      vote.isAgreedByMe && styles.voteCircleActiveBlue,
                    ]}
                  >
                    <SuggestionAgreeIcon
                      width={rs(24)}
                      height={rs(24)}
                      color={vote.isAgreedByMe ? "#FFFFFF" : "#4190FF"}
                    />
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => onPressDisagreeSuggestion?.(info)}
                  hitSlop={rs(8)}
                  style={styles.voteBtnOuter}
                >
                  <View
                    style={[
                      styles.voteXCircle,
                      vote.isDisagreedByMe && styles.voteXCircleActive,
                    ]}
                  >
                    <SuggestionDisagreeIcon
                      width={rs(24)}
                      height={rs(24)}
                      color={vote.isDisagreedByMe ? "#FFFFFF" : "#FF234F"}
                    />
                  </View>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => onPressDetail?.(info.birdId)}
                hitSlop={rs(8)}
              >
                <View style={styles.bracket}>
                  <InfoChevronIcon width={rs(17)} height={rs(17)} color="#0D0D0D" />
                </View>
              </Pressable>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderWidth: rs(1),
    borderColor: "#E5E7EB",
  },
  row: {
    height: rs(68),
    paddingHorizontal: rs(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: rs(1),
    borderTopColor: "#F3F4F6",
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(18),
  },
  texts: {
    flexDirection: "column",
    gap: rs(2),
  },
  kor: { fontSize: rfs(14), color: "#0D0D0D", fontFamily: font.money },
  sci: { fontSize: rfs(12), color: "#9CA3AF", fontFamily: font.regular },
  bracket: {
    alignItems: "center",
    justifyContent: "center",
  },
  voteWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  voteBtnOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  voteCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: rs(1),
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  voteCircleActiveBlue: {
    borderColor: "#5B86FF",
    backgroundColor: "#5B86FF",
  },
  voteXCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    borderWidth: rs(1),
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  voteXCircleActive: {
    borderColor: "#E83F5B",
    backgroundColor: "#E83F5B",
  },
});
