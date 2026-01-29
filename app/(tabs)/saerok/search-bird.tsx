// src/app/saerok/search-bird.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBar from "@/components/common/SearchBar";
import SearchSuggestions from "@/components/common/SearchSuggestions";
import {
  autocompleteApi,
  BirdInfo,
  getBirdInfoByNameApi,
} from "@/services/api/birds";
import { useSaerokForm } from "@/states/useSaerokForm";

export default function SearchBirdScreen() {
  const router = useRouter();
  const { setBirdName, setBirdId } = useSaerokForm();

  const inputRef = useRef<TextInput>(null);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(true);
  const [suggestions, setSuggestions] = useState<BirdInfo[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await autocompleteApi(term);
        const names: string[] = res.data?.suggestions ?? [];
        const infos = await Promise.all(
          names.map((name) => getBirdInfoByNameApi(name))
        );
        setSuggestions(infos.filter((x): x is BirdInfo => x !== null));
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [q]);

  const onSelect = (info: BirdInfo) => {
    setBirdName(info.koreanName);
    setBirdId(info.birdId);
    router.back();
  };

  const onSubmit = async () => {
    // 엔터 검색 시: 일치하는 것 없으면 첫 번째라도 선택
    const term = q.trim();
    if (!term) return;

    const info = await getBirdInfoByNameApi(term);
    if (!info) {
      Alert.alert("검색 결과 없음", "해당 이름의 새를 찾지 못했습니다.");
      return;
    }
    onSelect(info);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <SearchBar
          ref={inputRef}
          value={q}
          onChangeText={(v) => {
            setQ(v);
            setShow(true);
          }}
          placeholder="새 이름을 검색하세요"
          onSubmit={onSubmit}
          onBack={() => router.back()}
          onClear={() => setQ("")}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 150)}
        />

        <SearchSuggestions
          visible={show && q.trim().length > 0}
          suggestions={suggestions}
          onSelect={onSelect}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12 },
});
