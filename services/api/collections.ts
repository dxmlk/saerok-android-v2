import axiosPrivate from "../axiosPrivate";
import axiosPublic from "../axiosPublic";

export interface CreateCollectionRequest {
  birdId: number | null;
  discoveredDate: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  locationAlias: string;
  address: string;
  note: string;
  accessLevel?: "PUBLIC" | "PRIVATE";
}

export interface CreateCollectionResponse {
  collectionId: number;
}

export const createCollectionApi = async (data: CreateCollectionRequest) => {
  try {
    const res = await axiosPrivate.post<CreateCollectionResponse>(
      "/collections/",
      data,
    );
    return res.data;
  } catch (e) {
    console.log("[createCollectionApi] ERROR", e);
    throw e;
  }
};

export const getPresignedUrlApi = async (
  collectionId: number,
  contentType: string,
): Promise<{ presignedUrl: string; objectKey: string }> => {
  try {
    const res = await axiosPrivate.post(
      `/collections/${collectionId}/images/presign`,
      { contentType },
    );
    return res.data;
  } catch (e) {
    console.log("[getPresignedUrlApi] ERROR", e);
    throw e;
  }
};

export const registerImageMetaApi = async (
  collectionId: number,
  objectKey: string,
  contentType: string,
): Promise<{ imageId: number; url: string }> => {
  try {
    const res = await axiosPrivate.post(`/collections/${collectionId}/images`, {
      objectKey,
      contentType,
    });
    return res.data;
  } catch (e) {
    console.log("[registerImageMetaApi] ERROR", e);
    throw e;
  }
};

export interface CollectionItem {
  collectionId: number;
  imageUrl: string | null;
  thumbnailImageUrl: string | null;
  koreanName: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string; // ISO datetime
  discoveredDate: string; // YYYY-MM-DD
}

export const fetchMyCollections = async (): Promise<CollectionItem[]> => {
  try {
    const res = await axiosPrivate.get<{ items: CollectionItem[] }>(
      "/collections/me",
    );
    return res.data.items;
  } catch (e) {
    console.log("[fetchMyCollections] ERROR", e);
    throw e;
  }
};

export interface CollectionDetail {
  collectionId: number;
  imageUrl: string | null;
  discoveredDate: string;
  latitude: number;
  longitude: number;
  locationAlias: string;
  address: string;
  note: string;
  accessLevel: "PUBLIC" | "PRIVATE";
  bird: {
    birdId: number | null;
    koreanName: string | null;
    scientificName: string | null;
  };
  user: {
    userId: number;
    nickname: string;
  };
}

export const fetchCollectionDetail = async (
  collectionId: number,
): Promise<CollectionDetail> => {
  try {
    const res = await axiosPrivate.get<CollectionDetail>(
      `/collections/${collectionId}`,
    );
    return res.data;
  } catch (e) {
    console.log("[fetchCollectionDetail] ERROR", e);
    throw e;
  }
};

export interface EditCollectionDetail {
  birdId: number | null;
  discoveredDate: string;
  longitude: number;
  latitude: number;
  locationAlias: string;
  address: string;
  note: string;
  accessLevel: "PUBLIC" | "PRIVATE";
  imageId: number | null;
  imageUrl: string | null;
}

export const fetchEditCollectionDetail = async (
  collectionId: number,
): Promise<EditCollectionDetail> => {
  try {
    const res = await axiosPrivate.get<EditCollectionDetail>(
      `/collections/${collectionId}/edit`,
    );
    return res.data;
  } catch (e) {
    console.log("[fetchEditCollectionDetail] ERROR", e);
    throw e;
  }
};

export interface PatchCollectionRequest {
  isBirdIdUpdated?: boolean;
  birdId?: number | null;
  discoveredDate?: string;
  longitude?: number;
  latitude?: number;
  locationAlias?: string;
  address?: string;
  note?: string;
  accessLevel?: "PUBLIC" | "PRIVATE";
}

export interface PatchCollectionResponse {
  collectionId: number;
  birdId: number | null;
  discoveredDate: string;
  longitude: number;
  latitude: number;
  address: string;
  locationAlias: string;
  note: string;
  imageUrl: string | null;
  accessLevel: "PUBLIC" | "PRIVATE";
}

export const patchCollectionApi = async (
  collectionId: number,
  data: PatchCollectionRequest,
): Promise<PatchCollectionResponse> => {
  try {
    const res = await axiosPrivate.patch<PatchCollectionResponse>(
      `/collections/${collectionId}/edit`,
      data,
    );
    return res.data;
  } catch (e) {
    console.log("[patchCollectionApi] ERROR", e);
    throw e;
  }
};

export const deleteCollectionApi = async (
  collectionId: number,
): Promise<void> => {
  try {
    await axiosPrivate.delete(`/collections/${collectionId}`);
  } catch (e) {
    console.log("[deleteCollectionApi] ERROR", e);
    throw e;
  }
};

export const deleteCollectionImageApi = async (
  collectionId: number,
  imageId: number,
): Promise<void> => {
  try {
    await axiosPrivate.delete(`/collections/${collectionId}/images/${imageId}`);
  } catch (e) {
    console.log("[deleteCollectionImageApi] ERROR", e);
    throw e;
  }
};

export interface NearbyCollectionItem {
  collectionId: number;
  imageUrl: string | null;
  koreanName: string | null;
  note: string;
  latitude: number;
  longitude: number;
  locationAlias: string;
  address: string;
}

export interface FetchNearbyCollectionsParams {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isMineOnly?: boolean;
}

export const fetchNearbyCollections = async ({
  latitude,
  longitude,
  radiusMeters,
  isMineOnly = false,
}: FetchNearbyCollectionsParams): Promise<NearbyCollectionItem[]> => {
  try {
    const res = await axiosPrivate.get<{ items: NearbyCollectionItem[] }>(
      "/collections/nearby",
      {
        params: { latitude, longitude, radiusMeters, isMineOnly },
      },
    );
    return res.data.items;
  } catch (e) {
    console.log("[fetchNearbyCollections] ERROR", e);
    throw e;
  }
};

export const toggleCollectionLikeApi = async (
  collectionId: number,
): Promise<boolean> => {
  try {
    const res = await axiosPrivate.post(`/collections/${collectionId}/like`);
    return !!res.data.isLiked;
  } catch (e) {
    console.log("[toggleCollectionLikeApi] ERROR", e);
    throw e;
  }
};

export const fetchCollectionLikeListApi = async (
  collectionId: number,
): Promise<any[]> => {
  try {
    const res = await axiosPublic.get(
      `/collections/${collectionId}/like/users`,
    );
    return res.data.items;
  } catch (e) {
    console.log("[fetchCollectionLikeListApi] ERROR", e);
    throw e;
  }
};

export const getCollectionLikeStatusApi = async (
  collectionId: number,
): Promise<boolean> => {
  try {
    const res = await axiosPrivate.get(
      `/collections/${collectionId}/like/status`,
    );
    return !!res.data.isLiked;
  } catch (e) {
    console.log("[getCollectionLikeStatusApi] ERROR", e);
    throw e;
  }
};

export const fetchMyCollectionListApi = async (): Promise<number[]> => {
  try {
    const res = await axiosPrivate.get("/collections/liked");
    return res.data.items;
  } catch (e) {
    console.log("[fetchMyCollectionListApi] ERROR", e);
    throw e;
  }
};

export const toggleCollectionCommentLikeApi = async (
  commentId: number,
): Promise<boolean> => {
  try {
    const res = await axiosPrivate.post(
      `/collections/comments/${commentId}/like`,
    );
    return !!res.data.isLiked;
  } catch (e) {
    console.log("[toggleCollectionCommentLikeApi] ERROR", e);
    throw e;
  }
};

export const getCollectionCommentLikeStatusApi = async (
  commentId: number,
): Promise<boolean> => {
  try {
    const res = await axiosPrivate.get(
      `/collections/comments/${commentId}/like/status`,
    );
    return !!res.data.isLiked;
  } catch (e) {
    console.log("[getCollectionCommentLikeStatusApi] ERROR", e);
    throw e;
  }
};

export interface CollectionCommentItem {
  commentId: number;
  userId: number;
  nickname: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchCollectionCommentListApi = async (
  collectionId: number,
): Promise<CollectionCommentItem[]> => {
  try {
    const res = await axiosPrivate.get(`/collections/${collectionId}/comments`);
    return res.data.items;
  } catch (e) {
    console.log("[fetchCollectionCommentListApi] ERROR", e);
    throw e;
  }
};

export const createCollectionCommentApi = async (
  collectionId: number,
  content: string,
): Promise<number> => {
  try {
    const res = await axiosPrivate.post(
      `/collections/${collectionId}/comments`,
      { content },
    );
    return res.data.commentId;
  } catch (e) {
    console.log("[createCollectionCommentApi] ERROR", e);
    throw e;
  }
};

export const deleteCollectionCommentApi = async (
  collectionId: number,
  commentId: number,
): Promise<void> => {
  try {
    await axiosPrivate.delete(
      `/collections/${collectionId}/comments/${commentId}`,
    );
  } catch (e) {
    console.log("[deleteCollectionCommentApi] ERROR", e);
    throw e;
  }
};

export const patchCollectionCommentApi = async (
  collectionId: number,
  commentId: number,
  content: string,
): Promise<string> => {
  try {
    const res = await axiosPrivate.patch(
      `/collections/${collectionId}/comments/${commentId}`,
      { content },
    );
    return res.data.content;
  } catch (e) {
    console.log("[patchCollectionCommentApi] ERROR", e);
    throw e;
  }
};

export const getCollectionCommentCountApi = async (
  collectionId: number,
): Promise<number> => {
  try {
    const res = await axiosPublic.get(
      `/collections/${collectionId}/comments/count`,
    );
    return Number(res.data.count ?? 0);
  } catch (e) {
    console.log("[getCollectionCommentCountApi] ERROR", e);
    throw e;
  }
};
