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

export type FreeBoardPostSummary = {
  postId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  thumbnailProfileImageUrl: string | null;
  content: string;
  commentCount: number;
  isMine: boolean;
  createdAt: string;
};

export type FreeBoardPostListResponse = {
  items: FreeBoardPostSummary[];
  hasNext: boolean;
};

export type FreeBoardPostDetail = FreeBoardPostSummary & {
  updatedAt: string;
};

export type FreeBoardComment = {
  commentId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  thumbnailProfileImageUrl: string | null;
  content: string;
  status: "ACTIVE" | "DELETED";
  parentId: number | null;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
  replies: FreeBoardComment[];
};

export type FreeBoardCommentListResponse = {
  items: FreeBoardComment[];
  isMyPost: boolean;
  hasNext: boolean;
};

export type FreeBoardCommentCountResponse = {
  count: number;
};

export type CreateFreeBoardPostPayload = {
  content: string;
};

export type CreateFreeBoardPostResponse = {
  postId: number;
};

export type UpdateFreeBoardPostPayload = {
  content: string;
};

export type UpdateFreeBoardPostResponse = {
  postId: number;
  content: string;
};

export type CreateFreeBoardCommentPayload = {
  content: string;
  parentId?: number;
};

export type CreateFreeBoardCommentResponse = {
  commentId: number;
};

export type UpdateFreeBoardCommentPayload = {
  content: string;
};

export type UpdateFreeBoardCommentResponse = {
  commentId: number;
  content: string;
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

export const fetchFreeBoardPostsApi = async (
  paging?: CommunityPagingParams,
  opts?: ClientMode,
): Promise<FreeBoardPostListResponse> => {
  try {
    const res = await getClient(opts).get<FreeBoardPostListResponse>(
      "/community/freeboard/posts",
      { params: withPaging(paging) },
    );
    return res.data;
  } catch (e) {
    console.log("[fetchFreeBoardPostsApi] ERROR", e);
    throw e;
  }
};

export const createFreeBoardPostApi = async (
  payload: CreateFreeBoardPostPayload,
): Promise<CreateFreeBoardPostResponse> => {
  try {
    const res = await axiosPrivate.post<CreateFreeBoardPostResponse>(
      "/community/freeboard/posts",
      payload,
    );
    return res.data;
  } catch (e) {
    console.log("[createFreeBoardPostApi] ERROR", e);
    throw e;
  }
};

export const fetchFreeBoardPostDetailApi = async (
  postId: number,
  opts?: ClientMode,
): Promise<FreeBoardPostDetail> => {
  try {
    const res = await getClient(opts).get<FreeBoardPostDetail>(
      `/community/freeboard/posts/${postId}`,
    );
    return res.data;
  } catch (e) {
    console.log("[fetchFreeBoardPostDetailApi] ERROR", e);
    throw e;
  }
};

export const updateFreeBoardPostApi = async (
  postId: number,
  payload: UpdateFreeBoardPostPayload,
): Promise<UpdateFreeBoardPostResponse> => {
  try {
    const res = await axiosPrivate.patch<UpdateFreeBoardPostResponse>(
      `/community/freeboard/posts/${postId}`,
      payload,
    );
    return res.data;
  } catch (e) {
    console.log("[updateFreeBoardPostApi] ERROR", e);
    throw e;
  }
};

export const deleteFreeBoardPostApi = async (postId: number): Promise<void> => {
  try {
    await axiosPrivate.delete(`/community/freeboard/posts/${postId}`);
  } catch (e) {
    console.log("[deleteFreeBoardPostApi] ERROR", e);
    throw e;
  }
};

export const fetchFreeBoardCommentsApi = async (
  postId: number,
  paging?: CommunityPagingParams,
  opts?: ClientMode,
): Promise<FreeBoardCommentListResponse> => {
  try {
    const res = await getClient(opts).get<FreeBoardCommentListResponse>(
      `/community/freeboard/posts/${postId}/comments`,
      { params: withPaging(paging) },
    );
    return res.data;
  } catch (e) {
    console.log("[fetchFreeBoardCommentsApi] ERROR", e);
    throw e;
  }
};

export const createFreeBoardCommentApi = async (
  postId: number,
  payload: CreateFreeBoardCommentPayload,
): Promise<CreateFreeBoardCommentResponse> => {
  try {
    const res = await axiosPrivate.post<CreateFreeBoardCommentResponse>(
      `/community/freeboard/posts/${postId}/comments`,
      payload,
    );
    return res.data;
  } catch (e) {
    console.log("[createFreeBoardCommentApi] ERROR", e);
    throw e;
  }
};

export const updateFreeBoardCommentApi = async (
  postId: number,
  commentId: number,
  payload: UpdateFreeBoardCommentPayload,
): Promise<UpdateFreeBoardCommentResponse> => {
  try {
    const res = await axiosPrivate.patch<UpdateFreeBoardCommentResponse>(
      `/community/freeboard/posts/${postId}/comments/${commentId}`,
      payload,
    );
    return res.data;
  } catch (e) {
    console.log("[updateFreeBoardCommentApi] ERROR", e);
    throw e;
  }
};

export const deleteFreeBoardCommentApi = async (
  postId: number,
  commentId: number,
): Promise<void> => {
  try {
    await axiosPrivate.delete(
      `/community/freeboard/posts/${postId}/comments/${commentId}`,
    );
  } catch (e) {
    console.log("[deleteFreeBoardCommentApi] ERROR", e);
    throw e;
  }
};

export const fetchFreeBoardCommentCountApi = async (
  postId: number,
): Promise<FreeBoardCommentCountResponse> => {
  try {
    const res = await axiosPublic.get<FreeBoardCommentCountResponse>(
      `/community/freeboard/posts/${postId}/comments/count`,
    );
    return res.data;
  } catch (e) {
    console.log("[fetchFreeBoardCommentCountApi] ERROR", e);
    throw e;
  }
};
