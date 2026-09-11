import { apiRequest } from "./client";
import type { RatingTag } from "@/lib/constants/rating";

export type Rating = {
  _id: string;
  bookingId: string | { _id: string; bookingId: string };
  fromUserId: { name: string; profilePhoto: string | null } | string;
  fromRole: "client" | "provider";
  rating: number;
  review?: string | null;
  tags?: RatingTag[];
  anonymous: boolean;
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export function submitRating(
  input: {
    bookingId: string;
    toUserId: string;
    rating: number;
    review?: string;
    tags?: RatingTag[];
  },
  accessToken: string,
): Promise<{ ratingRecord: Rating }> {
  return apiRequest("/ratings/", { method: "POST", body: input, accessToken });
}

// The other party's booking-completion prompt: which of my own completed
// bookings still need a rating from me. Not paginated in practice — the
// handler validates page/limit but never applies them. See CLAUDE.md.
export function getMyRatingStatus(
  accessToken: string,
): Promise<{ ratingRequired: boolean; pendingRatings: { _id: string }[] }> {
  return apiRequest("/ratings/my-status", { accessToken });
}

export function getRatingsForUser(
  userId: string,
  accessToken: string,
  options: { page?: number; limit?: number } = {},
): Promise<{ ratings: Rating[]; pagination: Pagination }> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return apiRequest(`/ratings/user/${userId}${query ? `?${query}` : ""}`, { accessToken });
}
