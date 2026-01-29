import axiosPublic from "../axiosPublic";

export type KakaoLoginResponse = {
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
