import { apiRequest } from "./client";
import type { Pagination } from "./bookings";
import type { SettlementState } from "@/lib/constants/settlementState";

export type Settlement = {
  bookingId: string;
  bookingReference: string;
  grossPaise: number | null;
  tcsPaise: number;
  tdsPaise: number;
  netPaise: number | null;
  state: SettlementState;
  releaseScheduledFor: string | null;
  releasedAt: string | null;
  utr: string | null;
  // Once duty has ended, the payout is released as soon as the provider's own invoice is on
  // file — there's no scheduled date for newer bookings (releaseScheduledFor stays null).
  invoiceUploaded?: boolean;
};

export function listSettlements(
  accessToken: string,
  options: { state?: SettlementState; page?: number; limit?: number } = {},
): Promise<{ settlements: Settlement[]; pagination: Pagination }> {
  const params = new URLSearchParams();
  if (options.state) params.set("state", options.state);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return apiRequest(`/provider/settlements${query ? `?${query}` : ""}`, { accessToken });
}
