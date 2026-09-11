import { apiRequest } from "./client";
import type { ServiceCategory } from "./provider";
import type { BookingStatus } from "@/lib/constants/bookingStatus";

export type BookingClient = {
  name: string;
  email: string;
  phone: string;
};

export type Booking = {
  _id: string;
  bookingId: string;
  clientId: BookingClient;
  serviceCategory: ServiceCategory;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  numberOfDays: number;
  totalAmount: number; // paise
  status: BookingStatus;
  address?: string | null;
  notes?: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export function listBookings(
  accessToken: string,
  options: { status?: BookingStatus; page?: number; limit?: number } = {},
): Promise<{ bookings: Booking[]; pagination: Pagination }> {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return apiRequest(`/provider/bookings${query ? `?${query}` : ""}`, { accessToken });
}

export function acceptBooking(bookingId: string, accessToken: string): Promise<{ booking: Booking }> {
  return apiRequest(`/provider/bookings/${bookingId}/accept`, { method: "PUT", accessToken });
}

export function rejectBooking(
  bookingId: string,
  rejectionReason: string,
  accessToken: string,
): Promise<void> {
  return apiRequest(`/provider/bookings/${bookingId}/reject`, {
    method: "PUT",
    body: { rejectionReason },
    accessToken,
  });
}
