import { apiRequest } from "./client";
import type { Pagination } from "./bookings";

export type Notification = {
  _id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

// Only `isRead` actually filters server-side — the backend documents a `type` query
// param too, but getMyNotifications never reads it. See CLAUDE.md.
export function listNotifications(
  accessToken: string,
  options: { isRead?: boolean; page?: number; limit?: number } = {},
): Promise<{ notifications: Notification[]; pagination: Pagination }> {
  const params = new URLSearchParams();
  if (options.isRead !== undefined) params.set("isRead", String(options.isRead));
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return apiRequest(`/notifications${query ? `?${query}` : ""}`, { accessToken });
}

export function getUnreadNotificationCount(accessToken: string): Promise<{ unreadCount: number }> {
  return apiRequest("/notifications/unread-count", { accessToken });
}

export function markNotificationRead(
  notificationId: string,
  accessToken: string,
): Promise<{ notification: Notification }> {
  return apiRequest(`/notifications/${notificationId}/read`, { method: "PUT", accessToken });
}

// Marks every unread notification read — the backend documents an optional
// notificationType scope, but markAllAsRead never applies it. See CLAUDE.md.
export function markAllNotificationsRead(accessToken: string): Promise<void> {
  return apiRequest("/notifications/read-all", { method: "PUT", accessToken });
}

export function deleteNotification(notificationId: string, accessToken: string): Promise<void> {
  return apiRequest(`/notifications/${notificationId}`, { method: "DELETE", accessToken });
}
