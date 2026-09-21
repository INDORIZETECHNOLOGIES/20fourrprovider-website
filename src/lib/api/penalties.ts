import { apiRequest } from "./client";

export type PenaltyType = "unplanned_leave" | "absence" | "misbehaviour" | "late_arrival" | "other";
export type PenaltyStatus = "pending" | "deducted" | "waived" | "appealed";
export type AppealStatus = "pending" | "approved" | "rejected";

export type Penalty = {
  _id: string;
  // The Mongo id — link with /bookings/:bookingId, never a human reference.
  bookingId?: string | null;
  type: PenaltyType;
  offenseLevel: 1 | 2 | 3;
  amount: number; // paise
  status: PenaltyStatus;
  description: string;
  suspensionDays?: number | null;
  suspensionUntil?: string | null;
  psaraBlocked?: boolean;
  reportedAt: string;
  createdAt: string;
  deductedAt?: string | null;
  waivedAt?: string | null;
  waiverReason?: string | null;
  appeal?: {
    appealed: boolean;
    appealedAt?: string | null;
    appealReason?: string | null;
    appealStatus?: AppealStatus | null;
    appealReviewedAt?: string | null;
    appealReviewReason?: string | null;
  } | null;
};

// This endpoint pages with { total, page, limit } rather than the usual
// pagination object, so "is there more" is worked out from those.
export type PenaltiesPage = {
  penalties: Penalty[];
  total: number;
  page: number;
  limit: number;
};

export function listPenalties(
  accessToken: string,
  params: { page?: number; limit?: number } = {},
): Promise<PenaltiesPage> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return apiRequest(`/provider/penalties?${query.toString()}`, { accessToken });
}

// One appeal per penalty. A penalty that was already appealed (even if rejected)
// or already waived comes back as a 409 with no SC_ code.
export function appealPenalty(
  penaltyId: string,
  appealReason: string,
  accessToken: string,
): Promise<{ penaltyId: string; appealStatus: AppealStatus; message: string }> {
  return apiRequest(`/provider/penalties/${penaltyId}/appeal`, {
    method: "POST",
    body: { appealReason },
    accessToken,
  });
}
