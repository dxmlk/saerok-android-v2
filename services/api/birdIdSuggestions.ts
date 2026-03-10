import axiosPrivate from "../axiosPrivate";
import axiosPublic from "../axiosPublic";

export type BirdIdSuggestionItem = {
  birdId: number;
  birdKoreanName: string;
  birdScientificName: string;
  birdImageUrl: string | null;
  agreeCount: number;
  disagreeCount: number;
  isAgreedByMe: boolean;
  isDisagreedByMe: boolean;
};

export type BirdIdSuggestionListResponse = {
  items: BirdIdSuggestionItem[];
};

export type CreateBirdIdSuggestionResponse = {
  suggestionId: number;
};

export type BirdIdSuggestionVoteResponse = {
  agreeCount: number;
  disagreeCount: number;
  isAgreedByMe: boolean;
  isDisagreedByMe: boolean;
};

export type AdoptBirdIdSuggestionResponse = {
  collectionId: number;
  birdId: number;
  birdKoreanName: string;
};

export type PendingBirdIdCollectionItem = {
  collectionId: number;
  imageUrl: string | null;
  note: string;
  nickname: string;
  profileImageUrl: string | null;
  thumbnailProfileImageUrl: string | null;
  birdIdSuggestionRequestedAt: string;
};

export type PendingBirdIdCollectionsResponse = {
  items: PendingBirdIdCollectionItem[];
};

export const getBirdIdSuggestionsApi = async (
  collectionId: number,
  opts?: { authenticated?: boolean },
): Promise<BirdIdSuggestionListResponse> => {
  const client = opts?.authenticated ? axiosPrivate : axiosPublic;
  const res = await client.get<BirdIdSuggestionListResponse>(
    `/collections/${collectionId}/bird-id-suggestions`,
  );
  return res.data;
};

export const createBirdIdSuggestionApi = async (
  collectionId: number,
  birdId: number,
): Promise<CreateBirdIdSuggestionResponse> => {
  const res = await axiosPrivate.post<CreateBirdIdSuggestionResponse>(
    `/collections/${collectionId}/bird-id-suggestions`,
    { birdId },
  );
  return res.data;
};

export const toggleBirdIdSuggestionAgreeApi = async (
  collectionId: number,
  birdId: number,
): Promise<BirdIdSuggestionVoteResponse> => {
  const res = await axiosPrivate.post<BirdIdSuggestionVoteResponse>(
    `/collections/${collectionId}/bird-id-suggestions/${birdId}/agree`,
  );
  return res.data;
};

export const toggleBirdIdSuggestionDisagreeApi = async (
  collectionId: number,
  birdId: number,
): Promise<BirdIdSuggestionVoteResponse> => {
  const res = await axiosPrivate.post<BirdIdSuggestionVoteResponse>(
    `/collections/${collectionId}/bird-id-suggestions/${birdId}/disagree`,
  );
  return res.data;
};

export const adoptBirdIdSuggestionApi = async (
  collectionId: number,
  birdId: number,
): Promise<AdoptBirdIdSuggestionResponse> => {
  const res = await axiosPrivate.post<AdoptBirdIdSuggestionResponse>(
    `/collections/${collectionId}/bird-id-suggestions/${birdId}/adopt`,
  );
  return res.data;
};

export const getPendingBirdIdCollectionsApi = async (): Promise<PendingBirdIdCollectionsResponse> => {
  const res = await axiosPublic.get<PendingBirdIdCollectionsResponse>(
    "/collections/pending-bird-id",
  );
  return res.data;
};

export const deleteAllBirdIdSuggestionsApi = async (
  collectionId: number,
): Promise<void> => {
  await axiosPrivate.delete(`/collections/${collectionId}/bird-id-suggestions/all`);
};
