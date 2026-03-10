export type ReverseGeocodeResult = {
  roadAddress?: string;
  jibunAddress?: string;
};

export async function reverseGeocodeNaver(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  const clientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing NAVER map credentials");
  }

  const url =
    "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc" +
    `?coords=${lng},${lat}` +
    "&orders=roadaddr,addr" +
    "&output=json";

  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": clientId,
      "X-NCP-APIGW-API-KEY": clientSecret,
    },
  });

  if (!res.ok) {
    throw new Error(`Naver reverse geocode failed: ${res.status}`);
  }

  const json: any = await res.json();
  const first = json?.results?.[0];

  const road = first?.land
    ? [
        first?.region?.area1?.name,
        first?.region?.area2?.name,
        first?.region?.area3?.name,
        first?.region?.area4?.name,
        first?.land?.name,
        first?.land?.number1,
        first?.land?.number2 ? `-${first.land.number2}` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  const jibun = first?.region
    ? [
        first?.region?.area1?.name,
        first?.region?.area2?.name,
        first?.region?.area3?.name,
        first?.region?.area4?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";

  return {
    roadAddress: road || "",
    jibunAddress: jibun || "",
  };
}

