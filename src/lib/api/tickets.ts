import { apiRequest, apiUpload } from "./client";
import type { Pagination } from "./bookings";
import type { TicketPriority, TicketStatus, TicketType } from "@/lib/constants/ticket";

export type TicketAttachment = {
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
};

export type TicketMessage = {
  senderId: string;
  senderRole: "client" | "provider" | "admin" | "support" | "support_review";
  message: string;
  attachments?: TicketAttachment[];
  timestamp: string;
};

export type Ticket = {
  _id: string;
  ticketId: string;
  type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  bookingId?: string | null;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTicketInput = {
  type: TicketType;
  subject: string;
  description: string;
  priority?: TicketPriority;
  bookingId?: string;
};

export function createTicket(input: CreateTicketInput, accessToken: string): Promise<{ ticket: Ticket }> {
  return apiRequest("/tickets", { method: "POST", body: input, accessToken });
}

// Only `status` actually filters server-side — the backend's own validator accepts
// type/priority/sortBy too, but getMyTickets never applies them. See CLAUDE.md.
export function listTickets(
  accessToken: string,
  options: { status?: TicketStatus; page?: number; limit?: number } = {},
): Promise<{ tickets: Ticket[]; pagination: Pagination }> {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return apiRequest(`/tickets${query ? `?${query}` : ""}`, { accessToken });
}

export function getTicket(ticketId: string, accessToken: string): Promise<{ ticket: Ticket }> {
  return apiRequest(`/tickets/${ticketId}`, { accessToken });
}

export function addTicketMessage(
  ticketId: string,
  message: string,
  accessToken: string,
  attachments?: TicketAttachment[],
): Promise<void> {
  return apiRequest(`/tickets/${ticketId}/message`, {
    method: "POST",
    body: { message, attachments },
    accessToken,
  });
}

export function uploadTicketAttachment(
  ticketId: string,
  file: File,
  accessToken: string,
): Promise<TicketAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload(`/tickets/${ticketId}/upload`, formData, accessToken);
}

export function closeTicket(ticketId: string, accessToken: string): Promise<void> {
  return apiRequest(`/tickets/${ticketId}/close`, { method: "PUT", accessToken });
}
