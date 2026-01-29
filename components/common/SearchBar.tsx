// src/components/common/SearchBar.tsx
import React, { forwardRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onBack?: () => void;
  onClear?: () => void;
};

const SearchBar = forwardRef<TextInput, Props>(
  (
    {
      value,
      onChangeText,
      placeholder,
      onSubmit,
      onFocus,
      onBlur,
      onBack,
      onClear,
    },
    ref
  ) => {
    return (
      <View style={styles.wrap}>
        <View style={styles.box}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={10} style={styles.leftIcon}>
              <Text style={styles.leftText}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.leftIcon}>
              <Text style={[styles.leftText, { opacity: 0.45 }]}>🔍</Text>
            </View>
          )}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
            onFocus={onFocus}
            onBlur={onBlur}
          />

          <Pressable onPress={onClear} hitSlop={10} style={styles.rightIcon}>
            <Text style={[styles.leftText, { opacity: 0.6 }]}>✕</Text>
          </Pressable>
        </View>
      </View>
    );
  }
);

export default SearchBar;

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  box: {
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  leftIcon: { width: 40, alignItems: "center", justifyContent: "center" },
  rightIcon: { width: 40, alignItems: "center", justifyContent: "center" },
  leftText: { fontSize: 16, color: "#2563eb" },
  input: { flex: 1, fontSize: 14, color: "#111827" },
});
