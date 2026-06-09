import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CloseTinyIcon from "@/assets/icon/common/CloseTinyIcon";
import SearchBar from "@/components/common/SearchBar";
import SearchSuggestions from "@/components/common/SearchSuggestions";
import FilterHeader, { SelectedFilters } from "@/components/dex/FilterHeader";
import { openDexDetail } from "@/lib/navigation";
import { toStringArray, toStringValue } from "@/lib/safeParams";
import {
  addSearchRecord,
  deleteSearchRecordAt,
  loadSearchHistory,
  SearchRecord,
} from "@/lib/searchHistory";
import {
  autocompleteApi,
  BirdInfo,
  getBirdInfoByNameApi,
} from "@/services/api/birds";
import { rfs, rs } from "@/theme";

const TAB_BAR_HEIGHT = rs(12);

export default function DexSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    seasons?: string | string[];
    habitats?: string | string[];
    sizeCategories?: string | string[];
    q?: string | string[];
  }>();

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    seasons: toStringArray(params.seasons),
    habitats: toStringArray(params.habitats),
    sizeCategories: toStringArray(params.sizeCategories),
  });

  const [searchTerm, setSearchTerm] = useState(toStringValue(params.q));
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<BirdInfo[]>([]);
  const [history, setHistory] = useState<SearchRecord[]>([]);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    (async () => {
      const h = await loadSearchHistory();
      setHistory(h);
    })();
  }, []);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }

    let canceled = false;
    const t = setTimeout(async () => {
      try {
        const res = await autocompleteApi(q);
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
    }, 200);

    return () => {
      canceled = true;
      clearTimeout(t);
    };
  }, [searchTerm]);

  const handleSearch = async (term: string) => {
    const trimmed = term.trim();
    const nothingSelected =
      !trimmed &&
      selectedFilters.seasons.length === 0 &&
      selectedFilters.habitats.length === 0 &&
      selectedFilters.sizeCategories.length === 0;

    if (nothingSelected) return;

    setSearchTerm(trimmed);

    if (trimmed) {
      const next = await addSearchRecord(trimmed);
      setHistory(next);
    }

    router.replace({
      pathname: "/dex",
      params: {
        q: trimmed,
        seasons: selectedFilters.seasons,
        habitats: selectedFilters.habitats,
        sizeCategories: selectedFilters.sizeCategories,
      },
    });
  };

  const handleSuggestionSelect = (info: BirdInfo) => {
    setSearchTerm(info.koreanName);
    setShowSuggestions(false);
    handleSearch(info.koreanName);
  };

  const handlePressDetail = (birdId: number) => {
    setShowSuggestions(false);
    openDexDetail(router, birdId, { from: "dex_search" });
  };

  const handleDeleteHistory = async (reverseIndex: number) => {
    const next = await deleteSearchRecordAt(reverseIndex);
    setHistory(next);
  };

  const reversedHistory = useMemo(() => [...history].reverse(), [history]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <SearchBar
          ref={inputRef}
          value={searchTerm}
          onChangeText={(v) => {
            setSearchTerm(v);
            setShowSuggestions(true);
          }}
          placeholder="궁금한 새 이름을 검색해보세요."
          onSubmit={() => handleSearch(searchTerm)}
          onBack={() => router.back()}
          onClear={() => setSearchTerm("")}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
        />

        <View style={styles.filterWrap}>
          <FilterHeader
            selectedFilters={selectedFilters}
            onFilterChange={(group, vals) =>
              setSelectedFilters((prev) => ({ ...prev, [group]: vals }))
            }
          />
        </View>
        
      </View>

      <ScrollView
        style={[styles.contentScroll, { marginBottom: TAB_BAR_HEIGHT }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showSuggestions && searchTerm.trim() && suggestions.length > 0 ? (
          <SearchSuggestions
            visible
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
            onPressDetail={handlePressDetail}
          />
        ) : !searchTerm.trim() ? (
          <View style={styles.historyWrap}>
            {reversedHistory.length === 0 ? (
              <Text style={styles.empty}>
                검색 기록이 없어요. 궁금한 새 이름을 검색해보세요.
              </Text>
            ) : (
              reversedHistory.map((rec, idx) => (
                <Pressable
                  key={`${rec.keyword}-${idx}`}
                  onPress={() => handleSearch(rec.keyword)}
                  style={styles.historyRow}
                >
                  <Text style={styles.historyKeyword}>{rec.keyword}</Text>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyDate}>{rec.date}</Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleDeleteHistory(idx);
                      }}
                      hitSlop={rs(10)}
                    >
                      <CloseTinyIcon
                        width={rs(10)}
                        height={rs(10)}
                        color="#979797"
                      />
                    </Pressable>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: rs(24),
    paddingTop: rs(20),
  },
  filterWrap: {
    marginLeft: rs(-16),
  },
  historyWrap: {
    marginTop: rs(10),
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: rs(40),
  },
  tempSignupBtn: {
    alignSelf: "flex-end",
    marginTop: rs(8),
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
    borderWidth: rs(1),
    borderColor: "#91BFFF",
    borderRadius: rs(8),
    backgroundColor: "#FFFFFF",
  },
  tempSignupText: {
    color: "#91BFFF",
    fontSize: rfs(13),
    fontWeight: "500",
  },
  empty: {
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
    textAlign: "center",
    color: "#6B7280",
  },
  historyRow: {
    height: rs(55),
    paddingLeft: rs(25),
    paddingRight: rs(24),
    paddingVertical: rs(18),
    borderTopWidth: rs(1),
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fefefe",
  },
  historyKeyword: {
    color: "#6D6D6D",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(15),
  },
  historyDate: {
    color: "#9CA3AF",
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
});
