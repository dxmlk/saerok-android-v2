import axiosPrivate from "../axiosPrivate";
import axiosPublic from "../axiosPublic";

export type User = {
  nickname: string | null;
  email: string | null;
  joinedDate?: string | null;
};

export interface UserInfoResponse {
  nickname: string;
  email: string;
  joinedDate: string;
  profileImageUrl: string | null;
  thumbnailImageUrl: string | null;
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
 * PATCH /user/me
 * nickname / profile image 모두 optional
 */
export interface UpdateUserResponse {
  nickname: string;
  email: string;
  profileImageUrl?: string | null;
  thumbnailProfileImageUrl?: string | null;
  thumbnailImageUrl?: string | null; // 서버 응답 키가 섞여있으면 대비
}

export const updateUserInfo = async (payload: {
  nickname?: string;
  profileImageObjectKey?: string;
  profileImageContentType?: string;
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
      {
        params: payload,
      },
    );
    return res.data;
  } catch (e) {
    console.log("[checkNicknameAvailable] ERROR", e);
    throw e;
  }
};

/**
 * POST /user/me/profile-image/presign
 */
export interface PresignProfileImageResponse {
  presignedUrl: string;
  objectKey: string;
}

export const presignProfileImage = async (payload: {
  contentType: string;
}): Promise<PresignProfileImageResponse> => {
  try {
    const res = await axiosPrivate.post<PresignProfileImageResponse>(
      "/user/me/profile-image/presign",
      payload,
    );
    return res.data;
  } catch (e) {
    console.log("[presignProfileImage] ERROR", e);
    throw e;
  }
};

/**
 * DELETE /user/me/profile-image
 */
export const deleteProfileImage = async (): Promise<void> => {
  try {
    await axiosPrivate.delete("/user/me/profile-image");
  } catch (e) {
    console.log("[deleteProfileImage] ERROR", e);
    throw e;
  }
};
