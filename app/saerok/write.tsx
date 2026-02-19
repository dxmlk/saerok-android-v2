import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { uploadToPresignedUrl } from "@/lib/uploadPresigned";
import {
  createCollectionApi,
  deleteCollectionImageApi,
  fetchEditCollectionDetail,
  getPresignedUrlApi,
  patchCollectionApi,
  registerImageMetaApi,
} from "@/services/api/collections";
import { useSaerokForm } from "@/states/useSaerokForm";
import { rfs, rs } from "@/theme";

export default function SaerokWriteScreen() {
  const router = useRouter();
  const { collectionId, birdName } = useLocalSearchParams<{
    collectionId?: string;
    birdName?: string;
  }>();
  const isEdit = !!collectionId;
  const idNum = collectionId ? Number(collectionId) : null;

  const initializedRef = useRef(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    form,
    setBirdId,
    setBirdName,
    setDate,
    setMemo,
    setAccessLevel,
    setLatitude,
    setLongitude,
    setAddress,
    setLocationAlias,
    setImageId,
    setImageFile,
    setImagePreviewUrl,
    resetForm,
  } = useSaerokForm();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!form.date) {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [form.date, setDate]);

  useEffect(() => {
    if (!isEdit || !idNum) return;

    (async () => {
      setLoadingEdit(true);
      try {
        const data = await fetchEditCollectionDetail(idNum);

        setBirdId(data.birdId);
        if (typeof birdName === "string" && birdName.length > 0) {
          setBirdName(birdName);
        } else {
          setBirdName(form.birdName ?? "");
        }
        setDate(data.discoveredDate);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setLocationAlias(data.locationAlias);
        setAddress(data.address);
        setMemo(data.note);
        setAccessLevel(data.accessLevel);
        setImageId(data.imageId ?? null);
        setImageFile(null);
        setImagePreviewUrl(data.imageUrl ?? null);
      } catch (e: any) {
        Alert.alert("오류", e?.message ?? "수정 데이터를 불러오지 못했습니다.");
        router.back();
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [isEdit, idNum, router]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("권한 없음", "이미지 라이브러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const type = asset.mimeType ?? "image/jpeg";
    const name =
      uri.split("/").pop() ?? `photo.${type.includes("png") ? "png" : "jpg"}`;

    setImageFile({ uri, name, type });
    setImagePreviewUrl(uri);
  };

  const canSubmit = useMemo(() => {
    if (!form.date || !form.address || !form.locationAlias || !form.memo)
      return false;
    if (!isEdit && !form.imageFile) return false;
    return true;
  }, [form, isEdit]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert("입력 확인", "필수 입력 항목이 누락되었습니다.");
      return;
    }

    try {
      if (!isEdit) {
        const collectionRes = await createCollectionApi({
          birdId: form.birdId,
          discoveredDate: form.date,
          latitude: form.latitude ?? 0,
          longitude: form.longitude ?? 0,
          locationAlias: form.locationAlias,
          address: form.address,
          note: form.memo,
          accessLevel: form.accessLevel,
        });

        const newId = collectionRes.collectionId;

        const contentType = form.imageFile!.type;
        const { presignedUrl, objectKey } = await getPresignedUrlApi(
          newId,
          contentType,
        );

        await uploadToPresignedUrl(
          presignedUrl,
          form.imageFile!.uri,
          contentType,
        );
        await registerImageMetaApi(newId, objectKey, contentType);

        Alert.alert("완료", "등록이 완료되었습니다.");
        resetForm();
        router.replace("/(tabs)/saerok");
        return;
      }

      if (!idNum) return;

      await patchCollectionApi(idNum, {
        isBirdIdUpdated: true,
        birdId: form.birdId,
        discoveredDate: form.date,
        latitude: form.latitude ?? 0,
        longitude: form.longitude ?? 0,
        locationAlias: form.locationAlias,
        address: form.address,
        note: form.memo,
        accessLevel: form.accessLevel,
      });

      if (form.imageFile) {
        if (form.imageId) {
          await deleteCollectionImageApi(idNum, form.imageId);
        }

        const contentType = form.imageFile.type;
        const { presignedUrl, objectKey } = await getPresignedUrlApi(
          idNum,
          contentType,
        );

        await uploadToPresignedUrl(
          presignedUrl,
          form.imageFile.uri,
          contentType,
        );
        const meta = await registerImageMetaApi(idNum, objectKey, contentType);
        setImageId(meta.imageId);
      }

      Alert.alert("완료", "수정이 완료되었습니다.");
      resetForm();
      router.replace("/(tabs)/saerok");
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "수정 중 오류가 발생했습니다.");
    }
  };

  if (loadingEdit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: rs(16),
            paddingTop: rs(12),
            paddingBottom: rs(160),
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {isEdit ? "새록 편집하기" : "새록 작성하기"}
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() => router.push("/saerok/search-bird")}
          >
            <Text style={styles.selectorLabel}>새</Text>
            <Text style={styles.selectorValue}>
              {form.birdName ? form.birdName : "새를 선택해주세요"}
            </Text>
            <Text style={styles.chev}>{">"}</Text>
          </Pressable>

          <Pressable
            style={styles.selector}
            onPress={() => router.push("/saerok/search-place")}
          >
            <Text style={styles.selectorLabel}>장소</Text>
            <Text style={styles.selectorValue}>
              {form.locationAlias
                ? `${form.locationAlias} (${form.address})`
                : "장소를 선택해주세요"}
            </Text>
            <Text style={styles.chev}>{">"}</Text>
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.label}>날짜</Text>
            <Pressable
              style={[styles.input, { justifyContent: "center" }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: "#111827" }}>{form.date}</Text>
            </Pressable>
          </View>

          <View style={styles.rowCol}>
            <Text style={styles.label}>한줄평</Text>
            <TextInput
              value={form.memo}
              onChangeText={setMemo}
              placeholder="50자 이내로 한줄평을 입력해주세요"
              placeholderTextColor="#9CA3AF"
              style={[
                styles.input,
                {
                  height: rs(96),
                  paddingTop: rs(12),
                  textAlignVertical: "top",
                },
              ]}
              maxLength={50}
              multiline
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>공개</Text>
            <Pressable
              onPress={() =>
                setAccessLevel(
                  form.accessLevel === "PUBLIC" ? "PRIVATE" : "PUBLIC",
                )
              }
              style={styles.toggle}
            >
              <Text style={{ color: "#111827", fontWeight: "700" }}>
                {form.accessLevel === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: rs(14) }}>
            <Pressable style={styles.imageBtn} onPress={pickImage}>
              <Text style={{ color: "#111827", fontWeight: "700" }}>
                {form.imageFile
                  ? "이미지 변경"
                  : isEdit
                    ? "이미지 변경"
                    : "이미지 선택"}
              </Text>
            </Pressable>

            {form.imagePreviewUrl ? (
              <Image
                source={{ uri: form.imagePreviewUrl }}
                style={styles.preview}
              />
            ) : null}
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={form.date ? new Date(form.date) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type !== "set" || !selectedDate) return;

              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const dd = String(selectedDate.getDate()).padStart(2, "0");
              setDate(`${yyyy}-${mm}-${dd}`);
            }}
          />
        )}

        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleSubmit}
            style={[styles.submit, { opacity: canSubmit ? 1 : 0.4 }]}
            disabled={!canSubmit}
          >
            <Text style={styles.submitText}>{isEdit ? "수정" : "등록"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: rfs(20),
    fontWeight: "800",
    color: "#111827",
    marginBottom: rs(14),
  },
  selector: {
    height: rs(56),
    borderWidth: rs(1),
    borderColor: "#E5E7EB",
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    marginBottom: rs(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },
  selectorLabel: { width: rs(52), color: "#6B7280", fontWeight: "700" },
  selectorValue: { flex: 1, color: "#111827" },
  chev: { color: "#9CA3AF", fontSize: rfs(22) },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
    marginTop: rs(10),
  },
  rowCol: { marginTop: rs(10) },
  label: { width: rs(52), color: "#6B7280", fontWeight: "700" },
  input: {
    flex: 1,
    height: rs(40),
    borderWidth: rs(1),
    borderColor: "#E5E7EB",
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    color: "#111827",
  },
  toggle: {
    flex: 1,
    height: rs(40),
    borderWidth: rs(1),
    borderColor: "#E5E7EB",
    borderRadius: rs(10),
    alignItems: "center",
    justifyContent: "center",
  },
  imageBtn: {
    height: rs(44),
    borderRadius: rs(10),
    borderWidth: rs(1),
    borderColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    marginTop: rs(10),
    width: "100%",
    height: rs(220),
    borderRadius: rs(12),
    backgroundColor: "#F3F4F6",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: rs(16),
    paddingTop: rs(10),
    paddingBottom: rs(16),
    backgroundColor: "#fff",
    borderTopWidth: rs(1),
    borderTopColor: "#E5E7EB",
  },
  submit: {
    height: rs(52),
    borderRadius: rs(12),
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontWeight: "800", fontSize: rfs(16) },
});
