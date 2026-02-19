import axiosPublic from "../axiosPublic";
import { getRefreshToken } from "@/lib/tokenStore";

export type KakaoLoginResponse = {
  accessToken: string;
  signupStatus: "PROFILE_REQUIRED" | "COMPLETED";
};

export type RefreshResponse = {
  accessToken: string;
  signupStatus: "PROFILE_REQUIRED" | "COMPLETED";
};

export const loginKakaoApi = async (
  kakaoAccessToken: string,
): Promise<KakaoLoginResponse> => {
  const res = await axiosPublic.post<KakaoLoginResponse>("/auth/kakao/login", {
    accessToken: kakaoAccessToken,
  });
  return res.data;
};

export const refreshAccessTokenApi = async (): Promise<RefreshResponse> => {
  const res = await axiosPublic.post<RefreshResponse>("/auth/refresh", {});
  return res.data;
};
