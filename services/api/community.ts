import axiosPrivate from "../axiosPrivate";
import axiosPublic from "../axiosPublic";

type ClientMode = { authenticated?: boolean };

const getClient = (opts?: ClientMode) =>
  opts?.authenticated ? axiosPrivate : axiosPublic;

export type CommunityUserSummary = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  thumbnailProfileImageUrl: string | null;
};

export type CommunityCollectionBirdSummary = {
  birdId: number | null;
  koreanName: string | null;
};

export type CommunityCollectionSummary = {
  collectionId: number;
  imageUrl: string | null;
  thumbnailImageUrl: string | null;
  discoveredDate: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  locationAlias: string;
  address: string;
  note: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isPopular: boolean;
  suggestionUserCount: number;
  bird: CommunityCollectionBirdSummary | null;
  user: CommunityUserSummary | null;
};

export type CommunitySearchAllResponse = {
  collectionsCount: number;
  collections: CommunityCollectionSummary[];
  usersCount: number;
  users: CommunityUserSummary[];
};

export type CommunityUsersSearchResponse = {
  items: CommunityUserSummary[];
};

export type CommunityCollectionsSearchResponse = {
  items: CommunityCollectionSummary[];
};

export type CommunityListResponse = {
  items: CommunityCollectionSummary[];
};

export type CommunityMainResponse = {
  recentCollections: CommunityCollectionSummary[];
  popularCollections: CommunityCollectionSummary[];
  pendingCollections?: CommunityCollectionSummary[];
  pendingBirdIdCollections: CommunityCollectionSummary[];
};

export type CommunityPagingParams = {
  page?: number;
  size?: number;
};

const withPaging = (params?: CommunityPagingParams) => {
  if (!params) return {};
  const { page, size } = params;
  if (page == null && size == null) return {};
  return { page, size };
};

export const searchCommunityAllApi = async (
  q: string,
  opts?: ClientMode,
): Promise<CommunitySearchAllResponse> => {
  try {
    const res = await getClient(opts).get<CommunitySearchAllResponse>(
      "/community/search",
      { params: { q } },
    );
    return res.data;
  } catch (e) {
    console.log("[searchCommunityAllApi] ERROR", e);
    throw e;
  }
};

export const searchCommunityUsersApi = async (
  q: string,
  paging?: CommunityPagingParams,
  opts?: ClientMode,
): Promise<CommunityUsersSearchResponse> => {
  try {
    const res = await getClient(opts).get<CommunityUsersSearchResponse>(
      "/community/search/users",
      { params: { q, ...withPaging(paging) } },
    );
    return res.data;
  } catch (e) {
    console.log("[searchCommunityUsersApi] ERROR", e);
    throw e;
  }
};

export const searchCommunityCollectionsApi = async (
  q: string,
  paging?: CommunityPagingParams,
  opts?: ClientMode,
): Promise<CommunityCollectionsSearchResponse> => {
  try {
    const res = await getClient(opts).get<CommunityCollectionsSearchResponse>(
      "/community/search/collections",
      { params: { q, ...withPaging(paging) } },
    );
    return res.data;
  } catch (e) {
    console.log("[searchCommunityCollectionsApi] ERROR", e);
    throw e;
  }
};

export const fetchCommunityRecentApi = async (
  paging?: CommunityPagingParams,
  opts?: ClientMode,
): Promise<CommunityListResponse> => {
  try {
    const res = await getClient(opts).get<CommunityListResponse>(
      "/community/recent",
      { params: withPaging(paging) },
    );
    return res.data;
  } catch (e) {
    console.log("[fetchCommunityRecentApi] ERROR", e);
    throw e;
  }
};

export const fetchCommunityPopularApi = async (
  paging?: CommunityPagingParams,
  opts?: ClientMode,
): Promise<CommunityListResponse> => {
  try {
    const res = await getClient(opts).get<CommunityListResponse>(
      "/community/popular",
      { params: withPaging(paging) },
    );
    return res.data;
  } catch (e) {
    console.log("[fetchCommunityPopularApi] ERROR", e);
    throw e;
  }
};

export const fetchCommunityPendingBirdIdApi = async (
  paging?: CommunityPagingParams,
  opts?: ClientMode,
): Promise<CommunityListResponse> => {
  try {
    const res = await getClient(opts).get<CommunityListResponse>(
      "/community/pending-bird-id",
      { params: withPaging(paging) },
    );
    return res.data;
  } catch (e) {
    console.log("[fetchCommunityPendingBirdIdApi] ERROR", e);
    throw e;
  }
};

export const fetchCommunityMainApi = async (
  opts?: ClientMode,
): Promise<CommunityMainResponse> => {
  try {
    const res = await getClient(opts).get<CommunityMainResponse>(
      "/community/main",
    );
    return res.data;
  } catch (e) {
    console.log("[fetchCommunityMainApi] ERROR", e);
    throw e;
  }
};
