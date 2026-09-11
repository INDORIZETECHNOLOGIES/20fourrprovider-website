import { apiRequest } from "./client";

export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";

export type BookingPaymentStatus = {
  status: PaymentStatus;
  amount: number; // paise
  amountINR: number; // rupees
  platformFee: number; // paise
  providerPayout: number; // paise
  createdAt: string;
};

export function getPaymentStatus(bookingId: string, accessToken: string): Promise<BookingPaymentStatus> {
  return apiRequest(`/payments/booking/${bookingId}`, { accessToken });
}
