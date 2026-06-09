import axiosPublic from "../axiosPublic";
import { getOrCreateNotificationDeviceId } from "@/services/notifications/deviceId";

export type AdSlotName = string;

export type AdEventRequest = {
  adId: number;
  slotName: AdSlotName;
  deviceId: string;
};

export type AdEventResponse = {
  status: "ok";
};

export type AdPayload = {
  id: number;
  imageUrl: string;
  targetUrl: string;
};

export type AdSlotResponse = {
  type: "AD" | "FALLBACK";
  ttlSeconds: number;
  ad?: AdPayload | null;
};

export type TrackAdEventParams = {
  adId: number;
  slotName: AdSlotName;
};

export const fetchAdSlotApi = async (slotName: AdSlotName): Promise<AdSlotResponse> => {
  try {
    const res = await axiosPublic.get<AdSlotResponse>(`/ad/slots/${slotName}`);
    return res.data;
  } catch (e) {
    console.log("[fetchAdSlotApi] ERROR", e);
    throw e;
  }
};

export const recordAdImpressionApi = async (
  body: AdEventRequest,
): Promise<AdEventResponse> => {
  try {
    const res = await axiosPublic.post<AdEventResponse>(
      "/ad/event/impression",
      body,
      { showOverlay: false } as any,
    );
    return res.data;
  } catch (e) {
    console.log("[recordAdImpressionApi] ERROR", e);
    throw e;
  }
};

export const recordAdClickApi = async (
  body: AdEventRequest,
): Promise<AdEventResponse> => {
  try {
    const res = await axiosPublic.post<AdEventResponse>(
      "/ad/event/click",
      body,
      { showOverlay: false } as any,
    );
    return res.data;
  } catch (e) {
    console.log("[recordAdClickApi] ERROR", e);
    throw e;
  }
};

export const recordAdImpressionWithStoredDeviceApi = async ({
  adId,
  slotName,
}: TrackAdEventParams): Promise<AdEventResponse> => {
  const deviceId = await getOrCreateNotificationDeviceId();
  return recordAdImpressionApi({ adId, slotName, deviceId });
};

export const recordAdClickWithStoredDeviceApi = async ({
  adId,
  slotName,
}: TrackAdEventParams): Promise<AdEventResponse> => {
  const deviceId = await getOrCreateNotificationDeviceId();
  return recordAdClickApi({ adId, slotName, deviceId });
};
