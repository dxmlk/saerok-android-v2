export type KakaoPlaceDoc = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
};

type KakaoSearchResponse = {
  documents: KakaoPlaceDoc[];
};

export async function searchKakaoPlaces(
  query: string,
  page: number = 1,
  size: number = 15,
): Promise<KakaoPlaceDoc[]> {
  const REST_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY;

  if (!REST_KEY) {
    throw new Error("Missing EXPO_PUBLIC_KAKAO_REST_KEY");
  }

  const url =
    `https://dapi.kakao.com/v2/local/search/keyword.json?` +
    `query=${encodeURIComponent(query)}&page=${page}&size=${size}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      // ✅ 로컬 REST API는 이것만으로 충분하게 가는 게 제일 안전합니다.
      Authorization: `KakaoAK ${REST_KEY}`,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    // 디버깅 로그
    console.log("KAKAO status =", res.status);
    console.log("KAKAO body =", text);
    throw new Error(`Kakao API failed: ${res.status} / ${text}`);
  }

  const data = JSON.parse(text) as KakaoSearchResponse;
  return data.documents ?? [];
}
