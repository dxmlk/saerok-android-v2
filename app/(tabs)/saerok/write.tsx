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

export default function SaerokWriteScreen() {
  const router = useRouter();
  const { collectionId } = useLocalSearchParams<{ collectionId?: string }>();
  const isEdit = !!collectionId;
  const idNum = collectionId ? Number(collectionId) : null;

  const initializedRef = useRef(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

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

  // 1) 진입 초기화
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 기본값 날짜
    if (!form.date) {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [form.date, setDate]);

  // 2) 수정 모드면 edit detail 로딩 → form 채우기
  useEffect(() => {
    if (!isEdit || !idNum) return;

    (async () => {
      setLoadingEdit(true);
      try {
        const data = await fetchEditCollectionDetail(idNum);

        setBirdId(data.birdId);
        setBirdName(data.birdId ? null : ""); // birdName은 search-bird에서 다시 채우는 구조 권장
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
  }, [isEdit, idNum]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
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
    // 등록은 이미지 필수, 수정은 이미지 없어도 가능(기존 이미지 유지)
    if (!form.date || !form.address || !form.locationAlias || !form.memo)
      return false;
    if (!isEdit && !form.imageFile) return false;
    return true;
  }, [form, isEdit]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert("확인", "필수 항목을 확인해주세요.");
      return;
    }

    try {
      if (!isEdit) {
        // ====== 등록 ======
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
          contentType
        );

        await uploadToPresignedUrl(
          presignedUrl,
          form.imageFile!.uri,
          contentType
        );
        await registerImageMetaApi(newId, objectKey, contentType);

        Alert.alert("완료", "등록이 완료되었습니다!");
        resetForm();
        router.replace("/(tabs)/saerok");
        return;
      }

      // ====== 수정 ======
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

      // 이미지 새로 선택한 경우만 업로드
      if (form.imageFile) {
        if (form.imageId) {
          await deleteCollectionImageApi(idNum, form.imageId);
        }

        const contentType = form.imageFile.type;
        const { presignedUrl, objectKey } = await getPresignedUrlApi(
          idNum,
          contentType
        );

        await uploadToPresignedUrl(
          presignedUrl,
          form.imageFile.uri,
          contentType
        );
        const meta = await registerImageMetaApi(idNum, objectKey, contentType);

        // 최신 imageId 반영
        setImageId(meta.imageId);
      }

      Alert.alert("완료", "수정이 완료되었습니다!");
      resetForm();
      router.replace("/(tabs)/saerok");
    } catch (e: any) {
      Alert.alert("오류", e?.message ?? "처리 중 오류가 발생했습니다.");
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
      <View style={styles.container}>
        <Text style={styles.title}>
          {isEdit ? "새록 편집하기" : "새록 작성하기"}
        </Text>

        <Pressable
          style={styles.selector}
          onPress={() => router.push("/(tabs)/saerok/search-bird")}
        >
          <Text style={styles.selectorLabel}>새</Text>
          <Text style={styles.selectorValue}>
            {form.birdName ? form.birdName : "새를 선택하세요"}
          </Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>

        <Pressable
          style={styles.selector}
          onPress={() => router.push("/(tabs)/saerok/search-place")}
        >
          <Text style={styles.selectorLabel}>장소</Text>
          <Text style={styles.selectorValue}>
            {form.locationAlias
              ? `${form.locationAlias} (${form.address})`
              : "장소를 선택하세요"}
          </Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.label}>날짜</Text>
          <TextInput value={form.date} style={styles.input} editable={false} />
        </View>

        <View style={styles.rowCol}>
          <Text style={styles.label}>한줄평</Text>
          <TextInput
            value={form.memo}
            onChangeText={setMemo}
            placeholder="50자 이내로 입력해주세요"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, { height: 44 }]}
            maxLength={50}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>공개</Text>
          <Pressable
            onPress={() =>
              setAccessLevel(
                form.accessLevel === "PUBLIC" ? "PRIVATE" : "PUBLIC"
              )
            }
            style={styles.toggle}
          >
            <Text style={{ color: "#111827", fontWeight: "700" }}>
              {form.accessLevel === "PUBLIC" ? "PUBLIC" : "PRIVATE"}
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 14 }}>
          <Pressable style={styles.imageBtn} onPress={pickImage}>
            <Text style={{ color: "#111827", fontWeight: "700" }}>
              {form.imageFile
                ? "이미지 변경"
                : isEdit
                ? "이미지 변경(선택)"
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

        <Pressable
          onPress={handleSubmit}
          style={[styles.submit, { opacity: canSubmit ? 1 : 0.4 }]}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>{isEdit ? "수정" : "등록"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },

  selector: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectorLabel: { width: 52, color: "#6B7280", fontWeight: "700" },
  selectorValue: { flex: 1, color: "#111827" },
  chev: { color: "#9CA3AF", fontSize: 22 },

  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  rowCol: { marginTop: 10 },
  label: { width: 52, color: "#6B7280", fontWeight: "700" },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#111827",
  },

  toggle: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  imageBtn: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    marginTop: 10,
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  submit: {
    marginTop: "auto",
    marginBottom: 16,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
