import { describe, expect, it } from "vitest";
import { addMonths, buildMonthGrid, daysInclusive, monthKey, todayString, toDateString } from "./staffCalendar";

describe("date strings", () => {
  it("builds zero-padded local dates", () => {
    expect(toDateString(2026, 8, 5)).toBe("2026-09-05");
    expect(monthKey(2026, 0)).toBe("2026-01");
    expect(todayString(new Date(2026, 8, 22, 23, 59))).toBe("2026-09-22");
  });
});

describe("addMonths", () => {
  it("rolls over year boundaries in both directions", () => {
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
    expect(addMonths(2026, 5, 0)).toEqual({ year: 2026, month: 5 });
  });
});

describe("buildMonthGrid", () => {
  it("starts weeks on Monday and pads with nulls", () => {
    // 1 Sep 2026 is a Tuesday: one leading blank.
    const weeks = buildMonthGrid(2026, 8);
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][1]).toBe("2026-09-01");
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
  });
  it("handles a month starting on Monday with no leading blanks", () => {
    // 1 Jun 2026 is a Monday.
    expect(buildMonthGrid(2026, 5)[0][0]).toBe("2026-06-01");
  });
});

describe("daysInclusive", () => {
  it("counts both ends", () => {
    expect(daysInclusive("2026-09-01", "2026-09-01")).toBe(1);
    expect(daysInclusive("2026-09-01", "2026-09-30")).toBe(30);
  });
  it("is null for an end before the start or malformed input", () => {
    expect(daysInclusive("2026-09-02", "2026-09-01")).toBeNull();
    expect(daysInclusive("2026-9-1", "2026-09-30")).toBeNull();
  });
  it("counts across a leap day", () => {
    expect(daysInclusive("2028-02-28", "2028-03-01")).toBe(3);
  });
});
