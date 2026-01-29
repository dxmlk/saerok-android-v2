import axiosPrivate from "../axiosPrivate";
import axiosPublic from "../axiosPublic";

export type User = {
  nickname: string | null;
  email: string | null;
  joinedDate?: string | null;
};

/**
 * =========================
 *  내 회원 정보 조회
 *  GET /user/me
 * =========================
 */
export interface UserInfoResponse {
  nickname: string;
  email: string;
  joinedDate: string;
}

export const getUserInfo = async (): Promise<UserInfoResponse> => {
  try {
    const res = await axiosPrivate.get<UserInfoResponse>("/user/me");
    return res.data;
  } catch (e) {
    console.log("[getUserInfo] ERROR", e);
    throw e;
  }
};

/**
 * =========================
 *  내 회원 정보 수정 (닉네임)
 *  PATCH /user/me
 * =========================
 */
export interface UpdateUserResponse {
  nickname: string;
  email: string;
}

export const updateUserInfo = async (payload: {
  nickname: string;
}): Promise<UpdateUserResponse> => {
  try {
    const res = await axiosPrivate.patch<UpdateUserResponse>(
      "/user/me",
      payload,
    );
    return res.data;
  } catch (e) {
    console.log("[updateUserInfo] ERROR", e);
    throw e;
  }
};

/**
 * =========================
 *  닉네임 중복 확인
 *  GET /user/check-nickname
 * =========================
 */
export interface CheckNicknameResponse {
  isAvailable: boolean;
  reason: string;
}

export const checkNicknameAvailable = async (payload: {
  nickname: string;
}): Promise<CheckNicknameResponse> => {
  try {
    const res = await axiosPublic.get<CheckNicknameResponse>(
      "/user/check-nickname",
      { params: payload },
    );
    return res.data;
  } catch (e) {
    console.log("[checkNicknameAvailable] ERROR", e);
    throw e;
  }
};
