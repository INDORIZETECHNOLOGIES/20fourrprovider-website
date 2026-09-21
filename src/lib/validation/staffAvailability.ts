import { STAFF_CATEGORIES, type StaffCounts } from "@/lib/api/staffAvailability";
import { daysInclusive } from "@/lib/staffCalendar";

export const RANGE_MAX_DAYS = 366;
export const NOTES_MAX = 200;

export const totalStaff = (counts: StaffCounts) => STAFF_CATEGORIES.reduce((sum, key) => sum + (counts[key] || 0), 0);

// Blank reads as zero — a field left empty means "none on that day".
export function parseCount(text: string): number {
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 ? n : Number.NaN;
}

export function validateCountText(text: string): string | null {
  if (!text.trim()) return null;
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0 || n > 100000) return "Enter a whole number, 0 or more.";
  return null;
}

// The server enforces this too; checking first saves a round trip and lets the
// message name the numbers. A null max means no team size is declared.
export function validateWithinStrength(total: number, max: number | null): string | null {
  if (max == null || max <= 0) return null;
  if (total > max) return `That's ${total} in total, but your team size is ${max}. Raise it under Public profile, or lower a count.`;
  return null;
}

export function validateRange(start: string, end: string, today: string): string | null {
  if (!start || !end) return "Choose both a start and an end date.";
  const days = daysInclusive(start, end);
  if (days == null) return "The end date can't be before the start date.";
  if (days > RANGE_MAX_DAYS) return `Choose a range of ${RANGE_MAX_DAYS} days or fewer.`;
  if (end < today) return "That range is entirely in the past.";
  return null;
}

export function validateNotes(notes: string): string | null {
  if (notes.length > NOTES_MAX) return `Keep notes under ${NOTES_MAX} characters.`;
  return null;
}
