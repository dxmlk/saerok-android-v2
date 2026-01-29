import axiosPrivate from "../axiosPrivate";
import axiosPublic from "../axiosPublic";
import qs from "qs";

export const fetchDexItemsApi = (params: any) => {
  return axiosPublic.get("/birds/", {
    params,
    paramsSerializer: (p: any) => qs.stringify(p, { arrayFormat: "repeat" }),
  });
};

export const fetchDexDetailApi = (birdId: number) => {
  return axiosPublic.get(`/birds/${birdId}`);
};

export const autocompleteApi = (q: string) => {
  return axiosPublic.get("/birds/autocomplete", { params: { q } });
};

export const fetchBookmarksApi = () => {
  return axiosPrivate.get("/birds/bookmarks/");
};

export const fetchBookmarkStatusApi = (birdId: number) => {
  return axiosPrivate.get(`/birds/bookmarks/${birdId}/status`);
};

export const fetchBookmarkListApi = () => {
  return axiosPrivate.get("/birds/bookmarks/items");
};

export const toggleBookmarkApi = (birdId: number) => {
  return axiosPrivate.post(`/birds/bookmarks/${birdId}/toggle`);
};

export interface BirdInfo {
  birdId: number;
  koreanName: string;
  scientificName: string;
}

export const getBirdInfoByNameApi = async (
  koreanName: string,
): Promise<BirdInfo | null> => {
  try {
    const res = await axiosPublic.get("/birds/", {
      params: { q: koreanName, page: 1, size: 20 },
      paramsSerializer: (p: any) => qs.stringify(p, { arrayFormat: "repeat" }),
    });

    const birds: any[] = res.data.birds || [];
    if (birds.length === 0) return null;

    const match = birds.find((b) => b.koreanName === koreanName) ?? birds[0];
    return {
      birdId: match.id,
      koreanName: match.koreanName,
      scientificName: match.scientificName,
    };
  } catch {
    return null;
  }
};
