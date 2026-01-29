import axiosPrivate from "../axiosPrivate";

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
  koreanName: string | null;
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

export const patchCollectionApi = async (
  collectionId: number,
  data: PatchCollectionRequest,
) => {
  try {
    const res = await axiosPrivate.patch(
      `/collections/${collectionId}/edit`,
      data,
    );
    return res.data;
  } catch (e) {
    console.log("[patchCollectionApi] ERROR", e);
    throw e;
  }
};

export const deleteCollectionApi = async (collectionId: number) => {
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
) => {
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
        params: {
          latitude,
          longitude,
          radiusMeters,
          isMineOnly,
        },
      },
    );

    console.log("[fetchNearbyCollections] SUCCESS", res.data.items.length);
    return res.data.items;
  } catch (e) {
    console.log("[fetchNearbyCollections] ERROR", e);
    throw e;
  }
};
