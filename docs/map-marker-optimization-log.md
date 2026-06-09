# Map Marker Optimization Log

## Goal

Android 지도 화면에서 발생하던 아래 문제를 줄이거나 없애는 것이 목표였다.

- 지도 이동/확대/축소 시 심한 버벅임
- 버블 마커가 깜빡이거나 위치가 튀는 현상
- 지도 이동 중 앱 크래시

핵심 제약:

- 버블 디자인은 유지해야 함
- 클러스터 디자인도 유지해야 함
- 웹/iOS에서 보이는 구조를 가능한 참고하되, RN Android 환경에 맞춰 안정화가 필요함

---

## Baseline Problem Summary

초기 문제 상황은 대략 이랬다.

- 클러스터는 RN child overlay + SVG + filter 기반
- 단일 마커는 RN `View/Image`
- 버블도 RN child overlay 안에 `bubble + tail + text`를 같이 렌더
- 줌/센터/화면 범위에 따라 버블 표시 여부가 계속 바뀜
- 지도 이동 후 상태가 다시 계산되면서 오버레이 수와 구조가 자주 바뀜

이 구조는 웹이나 iOS와 겉보기는 비슷하지만, 실제 렌더링 방식은 완전히 달랐다.

- iOS: `UIImage`/`iconImage` 기반
- 웹: DOM overlay 기반
- RN Android: 네이티브 지도 위에 React child overlay를 많이 얹는 구조

즉 Android RN이 가장 불안정할 가능성이 높다고 봤다.

---

## Investigation Timeline

## 1. 말풍선/클러스터를 React Native child overlay로 직접 렌더링

### 문제 상황

- 지도 이동 시 버블이 튀거나 잠깐 크게 보였다가 돌아옴
- 말풍선 shadow가 잘 보이지 않음
- 줌 레벨이 높아져 버블이 많이 뜨면 심하게 버벅임
- 심할 때 앱 크래시

### 원인 예측

- `NaverMapMarkerOverlay` 안에서 `View + Text + Svg + Filter`를 실시간으로 많이 렌더
- 같은 마커가 상태에 따라 크기/anchor가 바뀜
- 말풍선 개수가 많아질수록 오버레이 수와 자식 트리가 급격히 증가

### 핵심 코드 구조

이 시기에는 단일 마커 하나가 아래 두 역할을 같이 수행했다.

- 이미지 마커
- 말풍선 버블

즉 오버레이 하나 안에 모든 UI를 넣는 방식이었다.

### 결과

- 스타일은 맞추기 쉬웠음
- 하지만 안드로이드에서 가장 불안정했고, 버벅임과 크래시 가능성이 큼

---

## 2. 말풍선 shadow를 SVG filter 방식으로 시도

### 문제 상황

- 말풍선 shadow가 일반 RN 뷰에선 보이는데 지도에서는 거의 안 보임

### 원인 예측

- 지도 오버레이 내부에서는 RN shadow/elevation이 일반 화면과 다르게 보일 수 있음
- SVG filter는 웹 SVG 방식이라 RN에서 안정적으로 동작하지 않을 수 있음

### 시도

- 버블 배경에 SVG `filter` 기반 shadow를 적용
- 디버그 프리뷰를 지도 위 일반 RN absolute 레이어로 띄워 shadow 표현 확인

### 결과

- 일반 RN absolute preview에서는 shadow가 잘 보였음
- 하지만 지도 오버레이 안에서는 동일한 visual guarantee가 없었음
- SVG filter를 많이 쓰는 구조는 크래시 가능성도 더 높다고 판단

### 결론

- shadow 구현 자체보다 “지도 오버레이 내부 child 구조”가 더 큰 문제일 가능성이 높음

---

## 3. 버블을 끄고 클러스터만 확인

### 문제 상황

- 버블이 원인인지, 클러스터가 원인인지 구분 필요

### 시도

- `ENABLE_BUBBLE_MARKERS = false` 로 버블 렌더 비활성화
- SVG/버블 관련 코드는 파일에 남기고, 코드에서만 사용 중지

### 결과

- 그래도 크래시가 남음
- 따라서 버블만의 문제는 아니고, 클러스터나 기본 마커도 원인 후보임

### 핵심 변경

[`components/map/NaverMap.tsx`](../components/map/NaverMap.tsx)

- `const ENABLE_BUBBLE_MARKERS = false;`

이후 다시 버블을 켜는 실험도 있었음.

---

## 4. 클러스터 zoom/grid 로직 재조정

### 문제 상황

- 화면을 충분히 축소해도 클러스터가 어느 정도까지만 뭉치고 그 이상 더 안 합쳐짐

### 원인 예측

- `clusterStepByZoom()`가 특정 줌 이하에서 상한처럼 동작하고 있었음

### 시도

- 줌이 낮아질수록 cluster step이 계속 커지도록 조정
- 이후 상한은 제거

### 결과

- 축소 시 더 자연스럽게 클러스터가 뭉치도록 개선
- 하지만 성능/크래시 문제의 근본 해결은 아니었음

---

## 5. 클러스터를 PNG 기반 이미지로 전환

### 문제 상황

- 클러스터도 SVG child overlay로 렌더링하고 있어 Android 부담이 큼

### 원인 예측

- iOS는 클러스터도 이미지 기반으로 처리
- RN Android에서 child overlay SVG/filter가 문제일 가능성이 높음

### 시도

사용된 자산:

- `assets/images/map/cluster-1-5.png`
- `assets/images/map/cluster-6-15.png`
- `assets/images/map/cluster-16-30.png`
- `assets/images/map/cluster-31-99.png`
- `assets/images/map/cluster-100-plus.png`

코드에서는 각 개수 구간에 맞는 PNG를 직접 `image` prop으로 넘기도록 변경했다.

### 핵심 변경

[`components/map/NaverMap.tsx`](../components/map/NaverMap.tsx)

- `clusterImageSourceByCount()` 추가
- `NaverMapMarkerOverlay image={clusterImageSourceByCount(entry.count)}`

### 결과

- 클러스터 배경은 이미지 기반으로 바뀜
- SVG child overlay를 클러스터 쪽에서 제거
- 숫자는 native `caption`으로 올렸기 때문에, 기존 RN `Text` 기반과 완전히 똑같은 타이포그래피는 아님
- 그래도 클러스터 배경은 훨씬 iOS 방식에 가까워짐

### 남은 이슈

- 숫자 스타일은 기존과 조금 다를 수 있음
- 하지만 성능/안정성 면에서는 child SVG보다 낫다고 판단

---

## 6. TextureView 경로 비활성화

### 문제 상황

- Android에서 지도 이동 시 매우 불안정

### 원인 예측

- `isUseTextureViewAndroid` 경로가 커스텀 오버레이와 조합될 때 더 불안정할 가능성

### 시도

[`components/map/NaverMap.tsx`](../components/map/NaverMap.tsx)

- `isUseTextureViewAndroid={false}`

### 결과

- “무조건 바로 꺼지는” 빈도는 줄어든 시점이 있었음
- 그러나 근본적으로 크래시를 제거하진 못함

---

## 7. 버블 표시 범위를 viewport 안 일부로 제한

### 문제 상황

- 조회된 새록이 많으면 버블이 너무 많이 떠서 렌더 비용이 큼

### 원인 예측

- 화면 안의 모든 single marker에 버블을 띄우는 것은 Android에서 너무 무거움

### 시도

가시 범위를 별도 직사각형으로 줄였다.

- 가로 비율: `BUBBLE_VISIBLE_WIDTH_RATIO`
- 세로 비율: `BUBBLE_VISIBLE_HEIGHT_RATIO`

이후 이 값도 여러 번 조정했다.

### 결과

- 버블 개수는 줄었음
- 하지만 여전히 이동/재배치 시 크래시가 남음

### 해석

- 단순히 “몇 개를 보이게 하느냐”만의 문제가 아닐 가능성
- 버블 자체의 오버레이 구조나 카메라 이벤트 연동이 여전히 부담

---

## 8. 버블과 이미지 마커를 분리

### 문제 상황

- 하나의 오버레이 안에서 이미지 마커와 버블을 함께 렌더하면, 상태 전환 시 오버레이 크기/anchor가 크게 바뀜
- 이게 튐/깜빡임/재배치 비용을 키운다고 판단

### 시도

구조를 아래처럼 분리하려고 함.

- 단일 마커 오버레이
- 버블 오버레이

즉 웹의 marker + custom overlay, iOS의 marker + infoWindow를 참고한 구조

### 결과

- 구조적으로는 더 납득 가능한 방향
- 하지만 Android RN에서는 여전히 크래시가 발생
- 버블 child overlay 자체가 여전히 무거울 가능성이 남음

---

## 9. 버블 표시 타이밍을 idle 이후로 제한

### 문제 상황

- 지도를 움직이는 중에 버블이 떴다 안 떴다 함
- 이동 중에도 버블 계산/재렌더가 들어가서 부담

### 시도

사용자 이동이 끝난 뒤 일정 시간 후에만 버블을 다시 보이게 함.

관련 상수:

- `CAMERA_IDLE_COMMIT_MS = 500`

이동 중에는 버블을 숨기고, 멈춘 뒤 0.5초 후 다시 표시되도록 변경했다.

### 결과

- 사용자 체감상 “이동 중 버블이 안 뜨고, 멈춘 뒤 다시 뜨는 것”은 맞게 동작
- 하지만 크래시는 계속 발생

### 해석

- 버블 타이밍 문제를 줄여도, 버블 자체의 구조가 무거운 건 여전함

---

## 10. `onCameraChanged`의 setState 남발 완화

### 문제 상황

- 이동 중 매 프레임마다 `setIsCameraMoving(true)`가 반복될 수 있음

### 원인 예측

- React state 업데이트가 너무 자주 발생해서 지도와 렌더 파이프라인이 더 무거워질 수 있음

### 시도

ref를 두고, 이미 이동 중이면 다시 state를 올리지 않도록 변경

관련 상태:

- `isCameraMoving`
- `isCameraMovingRef`

### 결과

- state churn은 줄였음
- 하지만 단독으로 크래시를 막진 못함

---

## 11. 버블 개수 강제 제한

### 문제 상황

- 보이는 버블 수가 많을수록 부담이 큼

### 시도

처음엔 8개, 이후 4개까지 줄였다.

관련 상수:

- `MAX_VISIBLE_BUBBLES = 8`
- 이후 `MAX_VISIBLE_BUBBLES = 4`

또 중심에 가까운 마커부터 우선하도록 정렬 후 slice 적용

### 결과

- 버블 수는 줄었음
- 그러나 여전히 크래시 발생

### 해석

- “버블이 너무 많아서만” 발생하는 문제는 아닐 수 있음

---

## 12. 단일 마커를 네이티브 이미지 기반으로 전환

### 문제 상황

- 버블뿐 아니라 단일 마커도 RN child overlay로 계속 렌더링 중이었음

### 원인 예측

- 단일 마커도 많이 존재하므로, 이것 역시 Android에서 큰 부담일 수 있음

### 시도

단일 마커를 다음 방식으로 바꿈.

- 이전: `View + Image` child overlay
- 시도: `image={{ httpUri: markerImageUri }}` 기반 네이티브 마커

관련 플래그:

- `USE_NATIVE_SINGLE_MARKER_IMAGE = true`

### 결과

- 스타일이 기존 원형 마커와 달라짐
- 사용자는 “마커 스타일 원래대로”를 요청
- 그리고 이 변경 후에도 크래시가 계속 발생

### 결론

- 단일 마커를 네이티브 이미지로 바꾸는 것만으로는 크래시 해결이 되지 않았음
- 현재는 이 스타일 변경을 다시 되돌림

---

## Current State After Reverting Marker Style

현재 마지막 상태는 아래와 같다.

- 마커 스타일은 다시 원래 방식으로 되돌림
  - `USE_NATIVE_SINGLE_MARKER_IMAGE = false`
- 클러스터는 PNG 이미지 기반 유지
- 버블은 여전히 활성화되어 있으나
  - 이동 중에는 숨김
  - idle 후 500ms 뒤 다시 표시
  - 표시 개수는 최대 4개

즉 시각적으로는 원래에 더 가깝고, 구조적으로는 일부 최적화가 남아 있는 상태다.

---

## Main Hypotheses Now

현재 시점에서 가장 가능성 높은 가설은 아래 순서다.

1. `NaverMapMarkerOverlay` child overlay에 복잡한 버블 `View`를 여러 개 얹는 구조 자체가 Android에서 불안정하다.
2. 클러스터는 PNG 기반으로 옮겨서 조금 나아졌지만, 버블은 여전히 child overlay라 문제를 남긴다.
3. 단일 마커까지 네이티브 이미지로 바꿔도 크래시가 남은 것을 보면, 단일 마커보다 버블 쪽이 더 핵심일 수 있다.
4. 카메라 이벤트/버블 가시 범위/버블 수 제한은 “증상 완화”에는 도움이 되지만, 구조적 한계를 넘진 못한다.

---

## Recommended Next Steps

다음에 이어서 볼 때 가장 유력한 순서는 이렇다.

1. 버블을 완전히 끈 상태에서 안정성 확인
   - 크래시가 사라지면 범인은 버블로 확정 가능

2. 버블도 이미지 기반으로 전환
   - iOS의 `NoteBalloonRenderer.make(...)`와 유사한 방향
   - 즉 지도에는 “완성된 그림”을 넘기고, React child overlay를 줄이는 방식

3. 필요하면 숫자/텍스트/버블 자산 생성 전략 정리
   - 1줄/2줄 버블 템플릿
   - bird name / note 길이에 따라 텍스트만 제한

4. 그 이후에 다시 개별 미세조정
   - 버블 표시 개수
   - 버블 표시 범위
   - idle delay

---

## Important Code Pointers

핵심 파일:

- [`components/map/NaverMap.tsx`](../components/map/NaverMap.tsx)

현재 중요 상수:

- `CLUSTER_TO_SINGLE_ZOOM`
- `SINGLE_TO_BUBBLE_ZOOM`
- `CAMERA_IDLE_COMMIT_MS`
- `ENABLE_BUBBLE_MARKERS`
- `MAX_VISIBLE_BUBBLES`
- `USE_NATIVE_SINGLE_MARKER_IMAGE`

현재 중요한 상태/계산:

- `zoom`
- `viewCenter`
- `isCameraMoving`
- `bubbleVisibleIdSet`
- `visibleBubbleItems`

현재 중요한 이벤트:

- `onCameraChanged`
- `onCameraIdle`

---

## Short Conclusion

지금까지의 실험 결과를 한 줄로 요약하면:

클러스터는 PNG 기반으로 옮기면서 일부 안정화가 가능했지만, **버블 child overlay 구조는 여전히 Android에서 가장 위험한 병목/크래시 원인 후보**다.

즉 다음 최적화의 핵심은:

- “더 적게 보이게 한다”보다
- “버블을 어떤 방식으로 그리느냐를 바꾼다”

에 가깝다.
