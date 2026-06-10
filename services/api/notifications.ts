import axiosPrivate from "../axiosPrivate";

export type NotificationPlatform = "IOS" | "ANDROID";

export type NotificationType =
  | "LIKED_ON_COLLECTION"
  | "COMMENTED_ON_COLLECTION"
  | "REPLIED_TO_COMMENT"
  | "BIRD_ID_SUGGESTED_ON_COLLECTION"
  | "SUGGESTED_BIRD_ID_ON_COLLECTION"
  | "BIRD_ID_ADOPTED_ON_COLLECTION"
  | "COMMENTED_ON_FREE_BOARD_POST"
  | "REPLIED_TO_FREE_BOARD_COMMENT"
  | "SYSTEM_PUBLISHED_ANNOUNCEMENT"
  | "SYSTEM_ADMIN_MESSAGE"
  | string;

export type UpsertNotificationTokenRequest = {
  deviceId: string;
  token: string;
  platform: NotificationPlatform;
};

export type UpsertNotificationTokenResponse = {
  deviceId: string;
  success: boolean;
};

export const upsertNotificationTokenApi = async (
  body: UpsertNotificationTokenRequest,
): Promise<UpsertNotificationTokenResponse> => {
  try {
    const res = await axiosPrivate.post<UpsertNotificationTokenResponse>(
      "/notifications/tokens",
      body,
      { showOverlay: false } as any,
    );
    return res.data;
  } catch (e) {
    console.log("[upsertNotificationTokenApi] ERROR", e);
    throw e;
  }
};

export const readNotificationApi = async (
  notificationId: number,
): Promise<void> => {
  try {
    await axiosPrivate.patch(`/notifications/${notificationId}/read`);
  } catch (e) {
    console.log("[readNotificationApi] ERROR", e);
    throw e;
  }
};

export type ToggleNotificationSettingRequest = {
  deviceId: string;
  platform: NotificationPlatform;
  type: NotificationType;
};

export type ToggleNotificationSettingResponse = {
  deviceId: string;
  type: NotificationType;
  enabled: boolean;
};

export const toggleNotificationSettingApi = async (
  body: ToggleNotificationSettingRequest,
): Promise<ToggleNotificationSettingResponse> => {
  try {
    console.log("[toggleNotificationSettingApi] REQUEST", body);
    const res = await axiosPrivate.patch<ToggleNotificationSettingResponse>(
      "/notifications/settings/toggle",
      body,
    );
    return res.data;
  } catch (e) {
    const err: any = e;
    console.log(
      "[toggleNotificationSettingApi] ERROR",
      err?.response?.status,
      err?.response?.data ?? err,
    );
    throw e;
  }
};

export const readAllNotificationsApi = async (): Promise<void> => {
  try {
    await axiosPrivate.patch("/notifications/read-all");
  } catch (e) {
    console.log("[readAllNotificationsApi] ERROR", e);
    throw e;
  }
};

export type NotificationItem = {
  id: number;
  type: NotificationType;
  actorId: number | null;
  actorNickname: string | null;
  actorProfileImageUrl: string | null;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationItem[];
};

export const fetchNotificationsApi = async (): Promise<NotificationListResponse> => {
  try {
    const res = await axiosPrivate.get<NotificationListResponse>(
      "/notifications",
      { showOverlay: false } as any,
    );
    return res.data;
  } catch (e) {
    console.log("[fetchNotificationsApi] ERROR", e);
    throw e;
  }
};

export type NotificationUnreadCountResponse = {
  unreadCount: number;
};

export const fetchUnreadNotificationCountApi =
  async (): Promise<NotificationUnreadCountResponse> => {
    try {
      const res = await axiosPrivate.get<NotificationUnreadCountResponse>(
        "/notifications/unread-count",
        { showOverlay: false } as any,
      );
      return res.data;
    } catch (e) {
      console.log("[fetchUnreadNotificationCountApi] ERROR", e);
      throw e;
    }
  };

export type NotificationSettingItem = {
  type: NotificationType;
  enabled: boolean;
};

export type NotificationSettingsResponse = {
  deviceId: string;
  items: NotificationSettingItem[];
};

export const fetchNotificationSettingsApi = async (
  deviceId: string,
  platform?: NotificationPlatform,
): Promise<NotificationSettingsResponse> => {
  try {
    const res = await axiosPrivate.get<NotificationSettingsResponse>(
      "/notifications/settings",
      {
        params: { deviceId, ...(platform ? { platform } : {}) },
        showOverlay: false,
      },
    );
    return res.data;
  } catch (e) {
    console.log("[fetchNotificationSettingsApi] ERROR", e);
    throw e;
  }
};

export const deleteNotificationApi = async (
  notificationId: number,
): Promise<void> => {
  try {
    await axiosPrivate.delete(`/notifications/${notificationId}`);
  } catch (e) {
    console.log("[deleteNotificationApi] ERROR", e);
    throw e;
  }
};

export const deleteAllNotificationsApi = async (): Promise<void> => {
  try {
    await axiosPrivate.delete("/notifications/all");
  } catch (e) {
    console.log("[deleteAllNotificationsApi] ERROR", e);
    throw e;
  }
};
