import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image as RNImage,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ScrollView } from "react-native";

import { uploadToPresignedUrl } from "@/lib/uploadPresigned";
import {
  createCollectionApi,
  deleteCollectionApi,
  deleteCollectionImageApi,
  fetchCollectionDetail,
  fetchEditCollectionDetail,
  getPresignedUrlApi,
  patchCollectionApi,
  registerImageMetaApi,
} from "@/services/api/collections";
import { useSaerokForm } from "@/states/useSaerokForm";
import { font, rfs, rs } from "@/theme";
import CloseLineIcon from "@/assets/icon/common/CloseLineIcon";
import AddImageIcon from "@/assets/icon/button/AddImageIcon";
import CheckIcon from "@/assets/icon/common/CheckIcon";
import MapIcon from "@/assets/icon/nav/MapIcon";
import InfoChevronIcon from "@/assets/icon/saerok/InfoChevronIcon";
import AppAlertModal from "@/components/common/AppAlertModal";
import AppConfirmModal from "@/components/common/AppConfirmModal";
import TouchableOpacity from "@/components/common/TouchableOpacity";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const CALENDAR_COL_WIDTH_PCT = 100 / 7;
const CALENDAR_COL_WIDTH = `${CALENDAR_COL_WIDTH_PCT}%`;
const CALENDAR_TABLE_WIDTH = `${CALENDAR_COL_WIDTH_PCT * 7}%`;

function formatYmd(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarCells(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDow = first.getDay();
  const totalDays = last.getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function SaerokWriteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collectionId, birdId, birdName } = useLocalSearchParams<{
    collectionId?: string;
    birdId?: string;
    birdName?: string;
  }>();
  const isEdit = !!collectionId;
  const idNum = collectionId ? Number(collectionId) : null;

  const initializedRef = useRef(false);
  const submitLockRef = useRef(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarCursor, setCalendarCursor] = useState<Date>(() => new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthPickerYear, setMonthPickerYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [unknownBird, setUnknownBird] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    mainText: string;
    subText: string;
    onConfirm?: (() => void) | null;
  }>({
    visible: false,
    mainText: "",
    subText: "",
    onConfirm: null,
  });
  const scrollRef = useRef<ScrollView>(null);
  const memoInputRef = useRef<TextInput>(null);

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

  const openAlertModal = (params: {
    mainText: string;
    subText: string;
    onConfirm?: (() => void) | null;
  }) => {
    setAlertModal({
      visible: true,
      mainText: params.mainText,
      subText: params.subText,
      onConfirm: params.onConfirm ?? null,
    });
  };

  const closeAlertModal = () =>
    setAlertModal((prev) => ({ ...prev, visible: false, onConfirm: null }));

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (!isEdit) {
      resetForm();
      setUnknownBird(false);
      if (typeof birdName === "string" && birdName.length > 0) {
        setBirdName(birdName);
      }
      if (typeof birdId === "string" && birdId.length > 0) {
        const n = Number(birdId);
        if (Number.isFinite(n)) setBirdId(n);
      }
    }
  }, [isEdit, resetForm, birdId, birdName, setBirdId, setBirdName]);

  useEffect(() => {
    if (!isEdit || !idNum) return;

    (async () => {
      setLoadingEdit(true);
      try {
        const [data, detail] = await Promise.all([
          fetchEditCollectionDetail(idNum),
          fetchCollectionDetail(idNum).catch(() => null),
        ]);

        setBirdId(data.birdId);
        if (typeof birdName === "string" && birdName.length > 0) {
          setBirdName(birdName);
        } else {
          setBirdName(detail?.bird?.koreanName ?? "");
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
        openAlertModal({
          mainText: "오류",
          subText: e?.message ?? "수정 데이터를 불러오지 못했습니다.",
          onConfirm: () => router.back(),
        });
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [isEdit, idNum, router]);

  useEffect(() => {
    if (!showDatePicker) return;
    const today = new Date();
    if (!form.date) {
      setDate(formatYmd(today));
    }
    const base = form.date ? new Date(form.date) : today;
    if (!Number.isNaN(base.getTime())) {
      setCalendarCursor(new Date(base.getFullYear(), base.getMonth(), 1));
      setMonthPickerYear(base.getFullYear());
      setShowMonthPicker(false);
    }
  }, [showDatePicker, form.date, setDate]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      openAlertModal({
        mainText: "권한 없음",
        subText: "이미지 라이브러리 접근 권한이 필요합니다.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.9,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.uri) return;
    const uri = asset.uri;
    const type = asset.mimeType ?? "image/jpeg";
    const previewUrl = asset.base64
      ? `data:${type};base64,${asset.base64}`
      : uri;
    const name =
      uri.split("/").pop() ?? `photo.${type.includes("png") ? "png" : "jpg"}`;

    setImageFile({ uri, name, type });
    setImagePreviewUrl(previewUrl);
    setImagePreviewError(false);
  };

  const handleToggleUnknownBird = () => {
    const next = !unknownBird;
    setUnknownBird(next);

    if (next) {
      setBirdId(null);
    }
    setBirdName("");
  };

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!form.date || !form.address || !form.locationAlias || !form.memo)
      return false;
    if (!isEdit && !form.imageFile) return false;
    return true;
  }, [form, isEdit, submitting]);

  const calendarCells = useMemo(
    () => buildCalendarCells(calendarCursor),
    [calendarCursor],
  );
  const previewUri = form.imagePreviewUrl ?? form.imageFile?.uri;
  const deleteBirdName = form.birdName?.trim() || "이름 없는 새";
  const submitApiOptions = useMemo(() => ({ skipApiLoading: true }), []);

  useEffect(() => {
    setImagePreviewError(false);
  }, [previewUri]);

  const handleSubmit = async () => {
    if (!canSubmit || submitLockRef.current) {
      return;
    }

    try {
      submitLockRef.current = true;
      setSubmitting(true);
      if (!isEdit) {
        const collectionRes = await createCollectionApi(
          {
            birdId: form.birdId,
            discoveredDate: form.date,
            latitude: form.latitude ?? 0,
            longitude: form.longitude ?? 0,
            locationAlias: form.locationAlias,
            address: form.address,
            note: form.memo,
            accessLevel: form.accessLevel,
          },
          submitApiOptions,
        );

        const newId = collectionRes.collectionId;

        const contentType = form.imageFile!.type;
        const { presignedUrl, objectKey } = await getPresignedUrlApi(
          newId,
          contentType,
          submitApiOptions,
        );

        await uploadToPresignedUrl(
          presignedUrl,
          form.imageFile!.uri,
          contentType,
        );
        await registerImageMetaApi(
          newId,
          objectKey,
          contentType,
          submitApiOptions,
        );

        resetForm();
        router.replace("/(tabs)/saerok");
        return;
      }

      if (!idNum) return;

      await patchCollectionApi(
        idNum,
        {
          isBirdIdUpdated: true,
          birdId: form.birdId,
          discoveredDate: form.date,
          latitude: form.latitude ?? 0,
          longitude: form.longitude ?? 0,
          locationAlias: form.locationAlias,
          address: form.address,
          note: form.memo,
          accessLevel: form.accessLevel,
        },
        submitApiOptions,
      );

      if (form.imageFile) {
        if (form.imageId) {
          await deleteCollectionImageApi(idNum, form.imageId, submitApiOptions);
        }

        const contentType = form.imageFile.type;
        const { presignedUrl, objectKey } = await getPresignedUrlApi(
          idNum,
          contentType,
          submitApiOptions,
        );

        await uploadToPresignedUrl(
          presignedUrl,
          form.imageFile.uri,
          contentType,
        );
        const meta = await registerImageMetaApi(
          idNum,
          objectKey,
          contentType,
          submitApiOptions,
        );
        setImageId(meta.imageId);
      }

      resetForm();
      router.replace("/(tabs)/saerok");
    } catch (e: any) {
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!idNum) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!idNum) return;

    setShowDeleteConfirm(false);

    try {
      await deleteCollectionApi(idNum);
      resetForm();
      router.replace("/(tabs)/saerok");
    } catch (e: any) {
      openAlertModal({
        mainText: "오류",
        subText: e?.message ?? "삭제에 실패했어요.",
      });
    }
  };

  if (loadingEdit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#4190FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        {isEdit ? (
          <View style={styles.headerEdit}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerTextBtn}
              accessibilityRole="button"
            >
              <Text style={styles.headerText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.headerTextBtn}
              accessibilityRole="button"
            >
              <Text style={[styles.headerText, styles.headerDeleteText]}>삭제</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>새록 작성하기</Text>
            <Pressable
              onPress={() => router.back()}
              style={styles.headerClose}
              accessibilityRole="button"
            >
              <CloseLineIcon width={rs(24)} height={rs(24)} color="#0D0D0D" />
            </Pressable>
          </View>
        )}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={insets.top + rs(24)}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              paddingHorizontal: rs(24),
              paddingTop: rs(20),
              paddingBottom: rs(30),
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.imageRow}>
              <View style={[styles.imageBox, previewUri && styles.imageBoxFilled]}>
                {previewUri ? (
                  <RNImage
                    source={{ uri: form.imageFile?.uri ?? previewUri }}
                    style={styles.imageThumb}
                    resizeMode="cover"
                    onError={() => setImagePreviewError(true)}
                  />
                ) : null}
                <TouchableOpacity
                  onPress={pickImage}
                  style={[
                    styles.imagePress,
                    !previewUri && styles.imageAdd,
                    previewUri && styles.imageOverlayPress,
                  ]}
                  accessibilityRole="button"
                >
                  {!previewUri ? (
                    <AddImageIcon width={rs(14)} height={rs(14)} />
                  ) : null}
                </TouchableOpacity>
              </View>
              <Text style={styles.imageCount}>
                {previewUri ? "(1/1)" : "(0/1)"}
              </Text>
            </View>
            <View style={styles.sectionLg}>
              <Text style={styles.sectionLabel}>새 이름</Text>
              <TouchableOpacity
                style={[
                  styles.searchBar,
                  !!form.birdName && styles.searchBarFilled,
                  unknownBird && styles.searchBarDisabled,
                ]}
                disabled={unknownBird}
                onPress={() => {
                  router.push("/saerok/search-bird");
                }}
              >
                <Text
                  style={[
                    styles.searchText,
                    !form.birdName && styles.searchPlaceholder,
                  ]}
                >
                  {form.birdName
                    ? form.birdName
                    : unknownBird
                    ? "이름 모를 새"
                    : "새 이름을 입력해주세요"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unknownRow}
                onPress={handleToggleUnknownBird}
              >
                <View
                  style={[
                    styles.unknownBox,
                    unknownBird && styles.unknownBoxActive,
                  ]}
                >
                  <CheckIcon width={rs(12)} height={rs(12)} color="#FFFFFF" />
                </View>
                <Text style={styles.unknownText}>모르겠어요</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionSm}>
              <Text style={styles.sectionLabel}>발견 일시</Text>
              <TouchableOpacity
                style={[
                  styles.searchBar,
                  !!form.date && styles.searchBarFilled,
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    styles.searchText,
                    !form.date && styles.searchPlaceholder,
                  ]}
                >
                  {form.date ? form.date : "날짜를 선택해주세요"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionMd}>
              <Text style={styles.sectionLabel}>발견 장소</Text>
              <TouchableOpacity
                style={[
                  styles.searchBar,
                  !!form.address && styles.searchBarFilled,
                ]}
                onPress={() => router.push("/saerok/search-place")}
              >
                <Text
                  style={[
                    styles.searchText,
                    !form.address && styles.searchPlaceholder,
                  ]}
                >
                  {form.address ? form.address : "장소를 선택해주세요"}
                </Text>
              </TouchableOpacity>
              {form.locationAlias ? (
                <View style={styles.placeRow}>
                  <MapIcon
                    width={rs(24)}
                    height={rs(24)}
                    stroke="none"
                    fill="#F7BE65"
                  />
                  <Text style={styles.placeText}>{form.locationAlias}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.memoWrap}>
              <Text style={styles.memoLabel}>한 줄 평</Text>
              <TouchableOpacity
                style={[
                  styles.memoBox,
                  {
                    borderColor:
                      focusedField === "review" || !!form.memo
                        ? "#91BFFF"
                        : "#E5E7EB",
                  },
                ]}
                onPress={() => memoInputRef.current?.focus()}
              >
                <TextInput
                  ref={memoInputRef}
                  value={form.memo}
                  onChangeText={(text) => {
                    if (text.length <= 50) setMemo(text);
                  }}
                  placeholder="한 줄 평을 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  style={styles.memoInput}
                  multiline
                  onFocus={() => {
                    setFocusedField("review");
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 80);
                  }}
                  onBlur={() => setFocusedField(null)}
                />
              </TouchableOpacity>
              <Text style={styles.memoCount}>{`(${form.memo.length}/50)`}</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setAccessLevel(
                  form.accessLevel === "PUBLIC" ? "PRIVATE" : "PUBLIC",
                )
              }
              style={styles.accessRow}
            >
              <View
                style={[
                  styles.accessBox,
                  form.accessLevel === "PRIVATE" && styles.accessBoxActive,
                ]}
              >
                <CheckIcon width={rs(16)} height={rs(16)} color="#FFFFFF" />
              </View>
              <Text style={styles.accessText}>새록 비공개하기</Text>
            </TouchableOpacity>

            <View style={styles.bottomBar}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.submit,
                  { width: "100%", backgroundColor: canSubmit ? "#91bfff" : "#DAE0DE" },
                ]}
                disabled={!canSubmit}
              >
                <Text style={[styles.submitText, { color: canSubmit ? "#fff" : "#FEFEFE" }]}> 
                  {isEdit ? "수정하기" : "등록하기"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <AppAlertModal
          visible={alertModal.visible}
          mainText={alertModal.mainText}
          subText={alertModal.subText}
          onClose={closeAlertModal}
          onConfirm={alertModal.onConfirm}
        />

        <AppConfirmModal
          visible={showDeleteConfirm}
          mainText="삭제하시겠어요?"
          subText={`‘${deleteBirdName}’ 새록이 삭제돼요.`}
          leftText="삭제하기"
          rightText="취소하기"
          leftDanger
          onClose={() => setShowDeleteConfirm(false)}
          onLeft={confirmDelete}
        />

        <Modal
          transparent
          visible={showDatePicker}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.calendarDim}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable style={styles.calendarCard} onPress={() => {}}>
              <View style={styles.calendarHeader}>
                <View style={styles.calendarMonthRow}>
                  <Text style={styles.calendarMonthText}>
                    {calendarCursor.toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <Pressable
                    hitSlop={10}
                    onPress={() => {
                      setMonthPickerYear(calendarCursor.getFullYear());
                      setShowMonthPicker((v) => !v);
                    }}
                  >
                    <InfoChevronIcon
                      width={rs(16)}
                      height={rs(16)}
                      color="#91BFFF"
                    />
                  </Pressable>
                </View>
                <View style={styles.calendarHeaderRight}>
                  <Pressable
                    hitSlop={10}
                    onPress={() =>
                      setCalendarCursor(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                      )
                    }
                    style={styles.calendarArrowRight}
                  >
                    <InfoChevronIcon
                      width={rs(18)}
                      height={rs(18)}
                      color="#91BFFF"
                    />
                  </Pressable>
                  <Pressable
                    hitSlop={10}
                    onPress={() =>
                      setCalendarCursor(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                      )
                    }
                  >
                    <InfoChevronIcon
                      width={rs(18)}
                      height={rs(18)}
                      color="#91BFFF"
                    />
                  </Pressable>
                </View>
              </View>

              {showMonthPicker ? (
                <View style={styles.monthPickerPanel}>
                  <View style={styles.monthPickerYearRow}>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setMonthPickerYear((y) => y - 1)}
                      style={styles.calendarArrowRight}
                    >
                      <InfoChevronIcon
                        width={rs(18)}
                        height={rs(18)}
                        color="#91BFFF"
                      />
                    </Pressable>
                    <Text style={styles.monthPickerYearText}>
                      {monthPickerYear}
                    </Text>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setMonthPickerYear((y) => y + 1)}
                    >
                      <InfoChevronIcon
                        width={rs(18)}
                        height={rs(18)}
                        color="#91BFFF"
                      />
                    </Pressable>
                  </View>
                  <View style={styles.monthPickerGrid}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <Pressable
                        key={i}
                        style={[
                          styles.monthPickerCell,
                          calendarCursor.getFullYear() === monthPickerYear &&
                            calendarCursor.getMonth() === i &&
                            styles.monthPickerCellActive,
                        ]}
                        onPress={() => {
                          setCalendarCursor(new Date(monthPickerYear, i, 1));
                          setShowMonthPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.monthPickerCellText,
                            calendarCursor.getFullYear() === monthPickerYear &&
                              calendarCursor.getMonth() === i &&
                              styles.monthPickerCellTextActive,
                          ]}
                        >
                          {i + 1}??
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.calendarWeekRow}>
                {WEEKDAYS.map((w) => (
                  <Text key={w} style={styles.calendarWeekText}>
                    {w}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarCells.map((d, idx) => {
                  const today = new Date();
                  const todayDate = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                  );
                  const isFuture = !!d && d.getTime() > todayDate.getTime();
                  const isToday = !!d && isSameDay(d, todayDate);
                  const selected =
                    d &&
                    form.date &&
                    isSameDay(d, new Date(`${form.date}T00:00:00`));
                  return (
                    <Pressable
                      key={`${idx}-${d ? d.getDate() : "x"}`}
                      style={styles.calendarCell}
                      disabled={!d || isFuture}
                      onPress={() => {
                        if (!d) return;
                        setDate(formatYmd(d));
                        setShowMonthPicker(false);
                        setShowDatePicker(false);
                      }}
                    >
                      {d ? (
                        <View
                          style={[
                            styles.calendarDayCircle,
                            isToday && styles.calendarDayCircleToday,
                            selected && styles.calendarDayCircleSelected,
                            isFuture && styles.calendarDayCircleDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              isToday && styles.calendarDayTextToday,
                              selected && styles.calendarDayTextSelected,
                              isFuture && styles.calendarDayTextDisabled,
                            ]}
                          >
                            {d.getDate()}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.calendarEmptyCell} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: rs(74.5),
    paddingLeft: rs(29),
    paddingRight: rs(19),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerEdit: {
    height: rs(74.5),
    paddingLeft: rs(19),
    paddingRight: rs(19),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#0D0D0D",
    fontFamily: font.haru,
    fontSize: rfs(22),
    fontWeight: "400",
    lineHeight: rfs(33),
  },
  headerTextBtn: {
    minWidth: rs(44),
    height: rs(36),
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "#0D0D0D",
    fontSize: rfs(16),
    fontWeight: "400",
  },
  headerDeleteText: {
    color: "#D90000",
    fontWeight: "500",
  },
  headerClose: {
    width: rs(36),
    height: rs(36),
    alignItems: "center",
    justifyContent: "center",
  },
  headerCloseText: {
    color: "#0D0D0D",
    fontSize: rfs(22),
    lineHeight: rfs(33),
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: rs(7),
    marginBottom: rs(32),
  },
  imageBox: {
    width: rs(78),
    height: rs(78),
    borderRadius: rs(10),
    position: "relative",
    overflow: "hidden",
  },
  imageBoxFilled: {
    backgroundColor: "#D9D9D9",
  },
  imageAdd: {
    width: rs(78),
    height: rs(78),
    borderRadius: rs(10),
    borderWidth: rs(1),
    borderColor: "#979797",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  imagePress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: rs(78),
    height: rs(78),
    borderRadius: rs(10),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlayPress: {
    backgroundColor: "transparent",
  },
  imageThumb: {
    width: rs(78),
    height: rs(78),
    borderRadius: rs(10),
    overflow: "hidden",
  },
  imageCount: {
    color: "#979797",
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  sectionLg: { marginTop: rs(0) },
  sectionSm: { marginTop: rs(12) },
  sectionMd: { marginTop: rs(20) },
  sectionLabel: {
    marginLeft: rs(13),
    marginBottom: rs(7),
    color: "#0D0D0D",
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  searchBar: {
    height: rs(50),
    borderWidth: rs(2),
    borderColor: "#DAE0DE",
    borderRadius: rs(17),
    paddingHorizontal: rs(20),
    justifyContent: "center",
  },
  searchBarFilled: {
    borderColor: "#91BFFF",
  },
  searchBarDisabled: {
    opacity: 0.5,
  },
  searchText: {
    color: "#111827",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  searchPlaceholder: { color: "#9CA3AF" },
  unknownRow: {
    marginTop: rs(9),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: rs(6),
  },
  unknownBox: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(4),
    borderWidth: rs(1.5),
    borderColor: "#DAE0DE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  unknownBoxActive: {
    backgroundColor: "#91BFFF",
    borderWidth: 0,
  },
  unknownText: {
    color: "#6D6D6D",
    fontSize: rfs(13),
    fontWeight: "500",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: rs(3),
    marginTop: rs(6),
  },
  placeText: {
    color: "#111827",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
    marginTop: rs(10),
  },
  memoWrap: {
    marginTop: rs(9),
  },
  memoLabel: {
    marginLeft: rs(13),
    marginBottom: rs(7),
    color: "#0D0D0D",
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  memoBox: {
    height: rs(86),
    width: "100%",
    borderRadius: rs(17),
    borderWidth: rs(2),
    justifyContent: "center",
    overflow: "hidden",
  },
  memoInput: {
    width: "100%",
    height: "100%",
    paddingLeft: rs(20),
    paddingRight: rs(26),
    paddingVertical: rs(12),
    color: "#111827",
    textAlignVertical: "center",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  memoCount: {
    marginTop: rs(10),
    textAlign: "right",
    color: "#979797",
    fontSize: rfs(13),
    fontWeight: "400",
    lineHeight: rfs(16),
  },
  accessRow: {
    marginTop: rs(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: rs(8),
  },
  accessBox: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(5),
    borderWidth: rs(1.5),
    borderColor: "#DAE0DE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  accessBoxActive: {
    backgroundColor: "#91BFFF",
    borderWidth: 0,
  },
  accessText: {
    color: "#6D6D6D",
    fontSize: rfs(15),
    fontWeight: "400",
    lineHeight: rfs(18),
  },
  alertBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24),
  },
  alertCard: {
    width: "100%",
    maxWidth: rs(327),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(24),
    alignItems: "center",
    paddingTop: rs(28),
    paddingBottom: rs(24),
    paddingHorizontal: rs(20),
  },
  alertTextBlock: {
    marginTop: rs(14),
    alignItems: "center",
  },
  alertMainText: {
    color: "#0D0D0D",
    fontSize: rfs(18),
    lineHeight: rfs(22),
    fontFamily: font.medium,
  },
  alertSubText: {
    marginTop: rs(7),
    color: "#979797",
    fontSize: rfs(14),
    lineHeight: rfs(18),
    fontFamily: font.regular,
  },
  alertBtnRow: {
    width: "100%",
    flexDirection: "row",
    gap: rs(10),
    marginTop: rs(24),
  },
  alertLeftBtn: {
    flex: 1,
    height: rs(52),
    borderRadius: rs(16),
    backgroundColor: "#91BFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  alertLeftBtnText: {
    color: "#FFFFFF",
    fontSize: rfs(16),
    lineHeight: rfs(20),
    fontFamily: font.medium,
  },
  alertRightBtn: {
    flex: 1,
    height: rs(52),
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#FF5C5C",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  alertRightBtnText: {
    color: "#FF5C5C",
    fontSize: rfs(16),
    lineHeight: rfs(20),
    fontFamily: font.medium,
  },
  bottomBar: {
    marginTop: rs(25),
  },
  submit: {
    height: rs(53),
    borderRadius: rs(20),
    backgroundColor: "#91bfff",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: rfs(18),
    lineHeight: rfs(21),
  },
  calendarDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(16),
  },
  calendarCard: {
    width: "100%",
    maxWidth: rs(340),
    backgroundColor: "#F2F2F2",
    borderRadius: rs(13),
    paddingHorizontal: rs(16),
    paddingTop: rs(16),
    paddingBottom: rs(11),
  },
  calendarHeader: {
    width: CALENDAR_TABLE_WIDTH,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(2),
    paddingVertical: rs(11),
  },
  calendarMonthRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarMonthText: {
    color: "#0D0D0D",
    fontSize: rfs(17),
    fontWeight: "700",
    lineHeight: rfs(22),
    marginRight: rfs(6),
  },
  calendarHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(31),
  },
  calendarArrowRight: {
    transform: [{ rotate: "180deg" }],
  },
  calendarWeekRow: {
    width: CALENDAR_TABLE_WIDTH,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rs(5),
  },
  monthPickerPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: rs(12),
    marginBottom: rs(12),
  },
  monthPickerYearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(10),
  },
  monthPickerYearText: {
    color: "#0D0D0D",
    fontFamily: font.semibold,
    fontSize: rfs(15),
    fontWeight: "600",
  },
  monthPickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(8),
  },
  monthPickerCell: {
    width: "31%",
    height: rs(34),
    borderRadius: rs(8),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  monthPickerCellActive: {
    backgroundColor: "#91BFFF",
  },
  monthPickerCellText: {
    color: "#0D0D0D",
    fontSize: rfs(13),
    fontFamily: font.regular,
  },
  monthPickerCellTextActive: {
    color: "#FFFFFF",
    fontFamily: font.semibold,
  },
  calendarWeekText: {
    width: CALENDAR_COL_WIDTH,
    textAlign: "center",
    color: "#979797",
    fontSize: rfs(13),
    fontWeight: "600",
    lineHeight: rfs(18),
  },
  calendarGrid: {
    width: CALENDAR_TABLE_WIDTH,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: CALENDAR_COL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(6),
  },
  calendarEmptyCell: {
    width: rs(40),
    height: rs(40),
  },
  calendarDayCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(100),
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayCircleToday: {
    borderWidth: rs(1),
    borderColor: "#91BFFF",
  },
  calendarDayCircleSelected: {
    backgroundColor: "#91BFFF",
    borderWidth: 0,
  },
  calendarDayCircleDisabled: {
    opacity: 0.35,
  },
  calendarDayText: {
    color: "#0D0D0D",
    fontSize: rfs(20),
    fontWeight: "400",
    lineHeight: rfs(25),
  },
  calendarDayTextSelected: {
    color: "#FFFFFF",
  },
  calendarDayTextToday: {
    color: "#91BFFF",
  },
  calendarDayTextDisabled: {
    color: "#BDBDBD",
  },
});
