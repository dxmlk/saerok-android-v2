import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBar from "@/components/common/SearchBar";
import FilterHeader, { SelectedFilters } from "@/components/dex/FilterHeader";

import SearchSuggestions from "@/components/common/SearchSuggestions";
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
    const t = setTimeout(async () => {
      try {
        const res = await autocompleteApi(q);
        const names: string[] = res.data?.suggestions ?? [];
        const infos = await Promise.all(
          names.map((name) => getBirdInfoByNameApi(name)),
        );
        setSuggestions(infos.filter((x): x is BirdInfo => x !== null));
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(t);
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

  const handleDeleteHistory = async (reverseIndex: number) => {
    const next = await deleteSearchRecordAt(reverseIndex);
    setHistory(next);
  };

  const reversedHistory = useMemo(() => [...history].reverse(), [history]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ paddingHorizontal: rs(16), paddingTop: rs(12) }}>
        <SearchBar
          ref={inputRef}
          value={searchTerm}
          onChangeText={(v) => {
            setSearchTerm(v);
            setShowSuggestions(true);
          }}
          placeholder="궁금한 새를 검색해보세요"
          onSubmit={() => handleSearch(searchTerm)}
          onBack={() => router.back()}
          onClear={() => setSearchTerm("")}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
        />

        {showSuggestions && (
          <SearchSuggestions
            visible={searchTerm.trim().length > 0}
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
          />
        )}

        <View style={{ marginTop: rs(10) }}>
          <FilterHeader
            selectedFilters={selectedFilters}
            onFilterChange={(group, vals) =>
              setSelectedFilters((prev) => ({ ...prev, [group]: vals }))
            }
          />
        </View>
      </View>

      {!searchTerm.trim() && (
        <View style={{ marginTop: rs(10) }}>
          {reversedHistory.length === 0 ? (
            <Text style={styles.empty}>
              검색 기록이 없어요! 궁금한 새를 검색해보세요.
            </Text>
          ) : (
            reversedHistory.map((rec, idx) => (
              <Pressable
                key={`${rec.keyword}-${idx}`}
                onPress={() => handleSearch(rec.keyword)}
                style={styles.historyRow}
              >
                <Text style={styles.historyKeyword}>{rec.keyword}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: rs(12),
                  }}
                >
                  <Text style={styles.historyDate}>{rec.date}</Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleDeleteHistory(idx);
                    }}
                    hitSlop={rs(10)}
                  >
                    <Text style={{ color: "#6B7280", fontSize: rfs(16) }}>
                      X
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
    textAlign: "center",
    color: "#6B7280",
  },
  historyRow: {
    height: rs(54),
    paddingHorizontal: rs(16),
    borderTopWidth: rs(1),
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  historyKeyword: {
    color: "#111827",
    fontSize: rfs(14),
    fontWeight: "600",
  },
  historyDate: { color: "#9CA3AF", fontSize: rfs(12) },
});
