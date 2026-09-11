import { apiRequest, apiUpload } from "./client";
import type { Pagination } from "./bookings";

export type ChatMessage = {
  _id: string;
  bookingId: string;
  senderId: { _id: string; name: string; role: "client" | "provider" };
  content: string;
  messageType: "text" | "system" | "image" | "file";
  fileUrl?: string | null;
  fileName?: string | null;
  isRead: boolean;
  createdAt: string;
};

export function getChatHistory(
  bookingId: string,
  accessToken: string,
  options: { page?: number; limit?: number } = {},
): Promise<{ messages: ChatMessage[]; pagination: Pagination }> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return apiRequest(`/chat/${bookingId}${query ? `?${query}` : ""}`, { accessToken });
}

export function sendChatMessage(
  bookingId: string,
  content: string,
  accessToken: string,
): Promise<{ message: ChatMessage }> {
  return apiRequest(`/chat/${bookingId}`, { method: "POST", body: { content }, accessToken });
}

export function uploadChatAttachment(
  bookingId: string,
  file: File,
  accessToken: string,
): Promise<{ message: ChatMessage }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload(`/chat/${bookingId}/upload`, formData, accessToken);
}

export function getUnreadChatCount(accessToken: string): Promise<{ unreadCount: number }> {
  return apiRequest("/chat/unread", { accessToken });
}
