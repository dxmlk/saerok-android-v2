import React, { forwardRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { rfs, rs } from "../../theme";
import BackSmallIcon from "@/assets/icon/button/BackSmallIcon";
import SearchSmallIcon from "@/assets/icon/button/SearchSmallIcon";
import DeleteSmallIcon from "@/assets/icon/button/DeleteSmallIcon";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onBack?: () => void;
  onClear?: () => void;
  hideLeftIcon?: boolean;
  editable?: boolean;
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
      hideLeftIcon,
      editable = true,
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    const showBack = !!onBack || focused;

    return (
      <View style={styles.wrap}>
        <View style={styles.box}>
          {hideLeftIcon ? (
            <View style={styles.leftIcon} />
          ) : showBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={rs(10)}
              style={styles.leftIcon}
            >
              <BackSmallIcon width={rs(17)} height={rs(17)} color="#91BFFF" />
            </Pressable>
          ) : (
            <View style={styles.leftIcon}>
              <SearchSmallIcon width={rs(22)} height={rs(22)} color="#D1D5DB" />
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
            onFocus={() => {
              setFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            editable={editable}
          />

          {value.length > 0 ? (
            <Pressable
              onPress={onClear}
              hitSlop={rs(10)}
              style={styles.rightIcon}
            >
              <DeleteSmallIcon width={rs(15)} height={rs(15)} color="#979797" />
            </Pressable>
          ) : (
            <View style={styles.rightIcon} />
          )}
        </View>
      </View>
    );
  },
);

export default SearchBar;

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  box: {
    height: rs(44),
    borderRadius: rs(17),
    borderWidth: rs(2),
    borderColor: "#91BFFF",
    backgroundColor: "#FEFEFE",
    flexDirection: "row",
    alignItems: "center",
  },
  leftIcon: { width: rs(40), alignItems: "center", justifyContent: "center" },
  rightIcon: { width: rs(40), alignItems: "center", justifyContent: "center" },
  input: { flex: 1, fontSize: rfs(15), lineHeight: rfs(18), color: "#111827" },
});
