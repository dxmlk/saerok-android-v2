import * as Location from "expo-location";

export function calcRadiusMetersByScreen(
  latitude: number,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const metersPerPixel =
    (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  const visibleDiameter = Math.max(1, Math.min(viewportWidth, viewportHeight));
  const halfVisibleMeters = (visibleDiameter * metersPerPixel) / 2;
  return Math.max(100, Math.round(halfVisibleMeters));
}

export function getReadableAddress(p?: Location.LocationGeocodedAddress) {
  if (!p) return "";
  const city = p.city || p.subregion || p.region || "";
  const district = p.district || "";
  const street = p.street || "";
  const name = p.name || "";
  return [city, district, street || name].filter(Boolean).join(" ");
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
