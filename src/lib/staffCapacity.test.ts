import { describe, expect, it } from "vitest";
import type { CapacityResult } from "@/lib/api/capacity";
import { indiaDate, mergeCapacity, staffingShortfall, summarizeDay, withCalendarDay } from "./staffCapacity";

const result = (category: CapacityResult["category"], days: CapacityResult["days"]): CapacityResult => ({
  category,
  providerType: "firm",
  requireStaffAvailabilityForBulk: true,
  days,
});

const loads = mergeCapacity([
  result("guard", [
    { date: "2026-10-01", declared: 20, off: false, booked: 4, remaining: 16 },
    { date: "2026-10-04", declared: 0, off: true, booked: 0, remaining: 0 },
    { date: "2026-10-12", declared: null, off: false, booked: 1, remaining: null },
    { date: "2026-10-13", declared: null, off: false, booked: 0, remaining: null },
  ]),
  result("bouncer", [
    { date: "2026-10-01", declared: 10, off: false, booked: 10, remaining: 0 },
    { date: "2026-10-04", declared: 0, off: true, booked: 2, remaining: 0 },
    { date: "2026-10-12", declared: null, off: false, booked: 0, remaining: null },
    { date: "2026-10-13", declared: null, off: false, booked: 0, remaining: null },
  ]),
]);

describe("summarizeDay", () => {
  it("sums every category for 'all'", () => {
    expect(summarizeDay(loads.get("2026-10-01"), "all")).toEqual({ kind: "load", booked: 14, declared: 30, full: false, over: false });
  });

  it("narrows to one category, flagging a full day", () => {
    expect(summarizeDay(loads.get("2026-10-01"), "bouncer")).toMatchObject({ booked: 10, declared: 10, full: true, over: false });
  });

  it("keeps bookings visible on a day marked off", () => {
    expect(summarizeDay(loads.get("2026-10-04"), "all")).toEqual({ kind: "off", booked: 2 });
  });

  it("shows bookings on a date that isn't in the calendar", () => {
    expect(summarizeDay(loads.get("2026-10-12"), "all")).toEqual({ kind: "bookedOnly", booked: 1 });
    expect(summarizeDay(loads.get("2026-10-12"), "bouncer")).toEqual({ kind: "empty" });
  });

  it("is empty for an untouched date or one it never loaded", () => {
    expect(summarizeDay(loads.get("2026-10-13"), "all")).toEqual({ kind: "empty" });
    expect(summarizeDay(undefined, "all")).toEqual({ kind: "empty" });
  });
});

describe("withCalendarDay", () => {
  it("takes declared counts from the calendar row and booked from capacity", () => {
    const load = withCalendarDay(loads.get("2026-10-01"), { date: "2026-10-01", counts: { guard: 25, bouncer: 12 } });
    expect(summarizeDay(load, "all")).toEqual({ kind: "load", booked: 14, declared: 37, full: false, over: false });
  });

  it("treats a date with no calendar row as not in the calendar", () => {
    expect(summarizeDay(withCalendarDay(loads.get("2026-10-12"), undefined), "all")).toEqual({ kind: "bookedOnly", booked: 1 });
  });
});

describe("staffingShortfall", () => {
  const days = [
    { date: "2026-10-05", declared: 5, off: false, booked: 0, remaining: 5 },
    { date: "2026-10-06", declared: 10, off: false, booked: 1, remaining: 9 },
    { date: "2026-10-07", declared: 0, off: true, booked: 0, remaining: 0 },
    { date: "2026-10-08", declared: null, off: false, booked: 0, remaining: null },
  ];

  it("flags short, off and — when the calendar is required — unset days", () => {
    expect(staffingShortfall(days, 8, true)).toEqual([
      { date: "2026-10-05", free: 5, reason: "short" },
      { date: "2026-10-07", free: 0, reason: "off" },
      { date: "2026-10-08", free: 0, reason: "unset" },
    ]);
  });

  it("treats a date outside the calendar as open when the platform doesn't require it", () => {
    expect(staffingShortfall(days, 5, false)).toEqual([{ date: "2026-10-07", free: 0, reason: "off" }]);
  });
});

describe("indiaDate", () => {
  it("reads a timestamp as an India calendar day", () => {
    expect(indiaDate("2026-10-04T18:30:00.000Z")).toBe("2026-10-05");
  });
});
