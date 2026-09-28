import type { CapacityResult } from "@/lib/api/capacity";
import { STAFF_CATEGORIES, type StaffCategory, type StaffDay } from "@/lib/api/staffAvailability";

/** One date's capacity across every category, as the calendar reads it. */
export type DayLoad = {
  off: boolean;
  declared: Partial<Record<StaffCategory, number | null>>;
  booked: Partial<Record<StaffCategory, number>>;
};

export type CapacityFilter = StaffCategory | "all";

/** Folds one /provider/capacity result per category into a per-date map. */
export function mergeCapacity(results: CapacityResult[]): Map<string, DayLoad> {
  const out = new Map<string, DayLoad>();
  for (const result of results) {
    for (const day of result.days) {
      const load = out.get(day.date) ?? { off: false, declared: {}, booked: {} };
      load.off = load.off || day.off;
      load.declared[result.category] = day.declared;
      load.booked[result.category] = day.booked;
      out.set(day.date, load);
    }
  }
  return out;
}

export type CellSummary =
  | { kind: "empty" }
  | { kind: "off"; booked: number }
  | { kind: "bookedOnly"; booked: number }
  | { kind: "load"; booked: number; declared: number; full: boolean; over: boolean };

/**
 * What a calendar cell shows for the filter. `declared` is known only for dates in the staff
 * calendar; bookings can still land on other dates (a one-person booking doesn't need the
 * calendar), which is the "bookedOnly" case.
 */
export function summarizeDay(load: DayLoad | undefined, filter: CapacityFilter): CellSummary {
  if (!load) return { kind: "empty" };
  const keys: readonly StaffCategory[] = filter === "all" ? STAFF_CATEGORIES : [filter];
  const booked = keys.reduce<number>((sum, k) => sum + (load.booked[k] ?? 0), 0);
  if (load.off) return { kind: "off", booked };

  const declaredValues = keys.map((k) => load.declared[k]);
  const inCalendar = declaredValues.some((v) => v !== null && v !== undefined);
  if (!inCalendar) return booked > 0 ? { kind: "bookedOnly", booked } : { kind: "empty" };

  const declared = declaredValues.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  if (declared === 0 && booked === 0) return { kind: "empty" };
  return { kind: "load", booked, declared, full: declared > 0 && booked >= declared, over: booked > declared };
}

/** Accepted headcount per category on one date — the floor for what the day editor should declare. */
export function bookedOn(load: DayLoad | undefined): Partial<Record<StaffCategory, number>> {
  return load?.booked ?? {};
}

/**
 * Overlays the staff calendar's own row (which the editors update in place) on the capacity
 * read, so a saved day shows its new counts without refetching capacity. Booked stays from the
 * capacity read — only bookings change it.
 */
export function withCalendarDay(load: DayLoad | undefined, day: StaffDay | undefined): DayLoad {
  const booked = load?.booked ?? {};
  if (!day) return { off: false, declared: {}, booked };
  const declared = Object.fromEntries(STAFF_CATEGORIES.map((k) => [k, day.off ? 0 : day.counts?.[k] ?? 0]));
  return { off: Boolean(day.off), declared, booked };
}

export type Shortfall = { date: string; free: number; reason: "short" | "off" | "unset" };

/**
 * The days a request for `headcount` people can't be staffed, mirroring the backend's accept
 * check (spec 0011 rules 5–6): a day off, or remaining below the headcount. A day missing from
 * the calendar counts as unset only when the platform requires the calendar for bulk bookings.
 */
export function staffingShortfall(
  days: CapacityResult["days"],
  headcount: number,
  requireBulk: boolean,
): Shortfall[] {
  const out: Shortfall[] = [];
  for (const day of days) {
    if (day.off) out.push({ date: day.date, free: 0, reason: "off" });
    else if (day.remaining === null) {
      if (requireBulk) out.push({ date: day.date, free: 0, reason: "unset" });
    } else if (day.remaining < headcount) out.push({ date: day.date, free: Math.max(0, day.remaining), reason: "short" });
  }
  return out;
}

/** India calendar day of an API timestamp — what the capacity endpoint is keyed by. */
export const indiaDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
