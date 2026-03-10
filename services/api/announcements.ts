import axiosPublic from "../axiosPublic";

export type AnnouncementListItem = {
  id: number;
  title: string;
  publishedAt: string;
};

type AnnouncementListResponse = {
  announcements: AnnouncementListItem[];
};

export type AnnouncementDetail = {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
};

export const getAnnouncements = async (): Promise<AnnouncementListItem[]> => {
  try {
    const res =
      await axiosPublic.get<AnnouncementListResponse>("/announcements");
    return res.data.announcements ?? [];
  } catch (e) {
    console.log("[getAnnouncements] ERROR", e);
    throw e;
  }
};

export const getAnnouncementDetail = async (
  id: number,
): Promise<AnnouncementDetail> => {
  try {
    const res = await axiosPublic.get<AnnouncementDetail>(
      `/announcements/${id}`,
    );
    return res.data;
  } catch (e) {
    console.log("[getAnnouncementDetail] ERROR", e);
    throw e;
  }
};
