import { describe, expect, it } from "vitest";
import { indiaToday, validateDayOffDate } from "./availability";

describe("validateDayOffDate", () => {
  it("rejects an empty date", () => {
    expect(validateDayOffDate("")).not.toBeNull();
  });

  it("rejects an unparsable date", () => {
    expect(validateDayOffDate("not-a-date")).not.toBeNull();
  });

  it("rejects a past date", () => {
    expect(validateDayOffDate("2000-01-01")).not.toBeNull();
  });

  it("accepts today", () => {
    expect(validateDayOffDate(indiaToday())).toBeNull();
  });

  it("accepts today just after midnight India time, when the UTC date is still yesterday", () => {
    const earlyMorningIst = new Date("2026-09-28T18:45:00Z"); // 00:15 IST on the 29th
    expect(validateDayOffDate("2026-09-29", earlyMorningIst)).toBeNull();
    expect(validateDayOffDate("2026-09-28", earlyMorningIst)).not.toBeNull();
  });

  it("accepts a future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validateDayOffDate(indiaToday(future))).toBeNull();
  });
});
