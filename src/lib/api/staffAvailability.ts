import { apiRequest } from "./client";

// The five keys the backend counts a day's headcount across. Unlike
// ServiceCategory, this includes ex-servicemen.
export const STAFF_CATEGORIES = ["guard", "bouncer", "gunman", "pso", "exServiceman"] as const;
export type StaffCategory = (typeof STAFF_CATEGORIES)[number];

export const STAFF_CATEGORY_LABELS: Record<StaffCategory, string> = {
  guard: "Security guards",
  bouncer: "Bouncers",
  gunman: "Armed guards",
  pso: "Personal security officers",
  exServiceman: "Ex-servicemen",
};

export type StaffCounts = Record<StaffCategory, number>;

export type StaffDay = {
  date: string; // YYYY-MM-DD
  counts?: Partial<StaffCounts> | null;
  notes?: string | null;
  off?: boolean;
};

export type StaffAvailabilityResult = {
  staffAvailability: StaffDay[];
  // The declared team size — the most staff a single day can total. Null means
  // no size has been declared, so there is no cap.
  maxStaff: number | null;
};

export const emptyCounts = (): StaffCounts => ({ guard: 0, bouncer: 0, gunman: 0, pso: 0, exServiceman: 0 });

export function getStaffAvailability(accessToken: string, month: string): Promise<StaffAvailabilityResult> {
  return apiRequest(`/provider/staff-availability?month=${encodeURIComponent(month)}`, { accessToken });
}

// Gated: SC_602 until the provider is verified. Merges the counts into any
// existing entry for the date and clears its day-off marker.
export function setStaffDay(
  input: { date: string; counts: StaffCounts; notes: string },
  accessToken: string,
): Promise<{ staffAvailability: StaffDay[] }> {
  return apiRequest("/provider/staff-availability", { method: "PUT", body: input, accessToken });
}

// Gated. Overwrites — not merges — every date in the inclusive range; `off`
// zeroes the counts. A single day is just startDate === endDate. Max 366 days.
export function setStaffRange(
  input: { startDate: string; endDate: string; counts?: StaffCounts; off?: boolean },
  accessToken: string,
): Promise<{ updatedDays: number; off: boolean }> {
  return apiRequest("/provider/staff-availability/bulk", { method: "PUT", body: input, accessToken });
}
