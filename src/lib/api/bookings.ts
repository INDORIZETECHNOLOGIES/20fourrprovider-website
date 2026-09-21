import { apiRequest } from "./client";
import type { ServiceCategory } from "./provider";
import type { BookingStatus } from "@/lib/constants/bookingStatus";

export type BookingClient = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

export type Booking = {
  _id: string;
  bookingId: string;
  // `null` when the client's account no longer exists (deleted or erased) —
  // Mongoose's populate yields null for a dangling ref. Read the name through
  // `clientName()` rather than dereferencing this directly.
  clientId: BookingClient | null;
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

export function clientName(booking: Pick<Booking, "clientId">): string {
  return booking.clientId?.name ?? "Former client";
}

export type ThreatAssessment = {
  hasKnownThreat: boolean;
  threatDescription?: string | null;
  wasAttackedBefore: boolean;
  attackDescription?: string | null;
  threatLevel: "low" | "medium" | "high";
};

export type BookingDetail = Booking & {
  subtotalAmount: number; // paise
  platformFee: number; // paise
  gstAmount: number; // paise
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

export function markBookingComplete(bookingId: string, accessToken: string): Promise<void> {
  return apiRequest(`/provider/bookings/${bookingId}/complete`, { method: "PUT", accessToken });
}

// Shared client/provider surface — note the base path is /bookings, not /provider/bookings.
export function getBookingDetail(
  bookingId: string,
  accessToken: string,
): Promise<{ booking: BookingDetail; isContactVisible: boolean; clientThreatProfile: ThreatAssessment | null }> {
  return apiRequest(`/bookings/${bookingId}`, { accessToken });
}

// Reporting an absence — from EITHER party — always penalizes and immediately
// suspends the *provider* (and PSARA-blocks them on the critical window). See
// CLAUDE.md before wiring this up anywhere without a very explicit warning.
export function raiseAbsenceAlert(
  bookingId: string,
  reason: string,
  accessToken: string,
): Promise<{ ticket: { ticketId: string } }> {
  return apiRequest(`/bookings/${bookingId}/absence-alert`, {
    method: "POST",
    body: { reason },
    accessToken,
  });
}
