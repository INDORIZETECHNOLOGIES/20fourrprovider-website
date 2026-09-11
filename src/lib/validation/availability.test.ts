import { describe, expect, it } from "vitest";
import { validateDayOffDate } from "./availability";

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
    const today = new Date().toISOString().slice(0, 10);
    expect(validateDayOffDate(today)).toBeNull();
  });

  it("accepts a future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validateDayOffDate(future.toISOString().slice(0, 10))).toBeNull();
  });
});
