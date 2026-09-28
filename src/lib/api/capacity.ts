import { apiRequest } from "./client";
import type { StaffCategory } from "./staffAvailability";

// Backend spec 0011. Remaining capacity per India calendar day for one category: staff declared
// in the calendar minus the headcount of accepted-or-later bookings (and accepted contracts'
// future cycles) covering that day. `declared`/`remaining` are null for a date not in the
// calendar. At most 92 days per call.
export type DayCapacity = {
  date: string; // YYYY-MM-DD
  declared: number | null;
  off: boolean;
  booked: number;
  remaining: number | null;
};

export type CapacityResult = {
  category: StaffCategory;
  providerType: "individual" | "firm";
  /** When true, a booking of more than one person needs every date filled in on the calendar. */
  requireStaffAvailabilityForBulk: boolean;
  days: DayCapacity[];
};

export function getCapacity(
  accessToken: string,
  input: { category: StaffCategory; from: string; to: string },
): Promise<CapacityResult> {
  const query = new URLSearchParams(input).toString();
  return apiRequest(`/provider/capacity?${query}`, { accessToken });
}
