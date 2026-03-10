import axiosPrivate from "../axiosPrivate";
import axiosPublic from "../axiosPublic";

export type ProfileCollectionItem = {
  collectionId: number;
  birdId: number | null;
  birdKoreanName: string | null;
  birdScientificName: string | null;
  imageUrl: string | null;
  thumbnailImageUrl: string | null;
  note: string;
  discoveredDate: string;
  uploadedDate: string;
};

export type UserProfileResponse = {
  nickname: string;
  joinedDate: string;
  profileImageUrl: string | null;
  thumbnailProfileImageUrl: string | null;
  collectionCount: number;
  collections: ProfileCollectionItem[];
};

export const getUserProfileApi = async (
  userId: number,
  opts?: { authenticated?: boolean },
): Promise<UserProfileResponse> => {
  const client = opts?.authenticated ? axiosPrivate : axiosPublic;
  const res = await client.get<UserProfileResponse>(`/profile/${userId}`);
  return res.data;
};
