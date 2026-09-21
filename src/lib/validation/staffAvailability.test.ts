import { describe, expect, it } from "vitest";
import { emptyCounts } from "@/lib/api/staffAvailability";
import { parseCount, totalStaff, validateCountText, validateRange, validateWithinStrength } from "./staffAvailability";

describe("counts", () => {
  it("sums across every category", () => {
    expect(totalStaff({ ...emptyCounts(), guard: 5, bouncer: 3, exServiceman: 2 })).toBe(10);
  });
  it("treats blank as zero and rejects non-integers", () => {
    expect(validateCountText("")).toBeNull();
    expect(validateCountText("4")).toBeNull();
    expect(validateCountText("-1")).not.toBeNull();
    expect(validateCountText("2.5")).not.toBeNull();
    expect(parseCount("7")).toBe(7);
    expect(parseCount("x")).toBeNaN();
  });
});

describe("validateWithinStrength", () => {
  it("passes when there is no declared size", () => {
    expect(validateWithinStrength(500, null)).toBeNull();
    expect(validateWithinStrength(500, 0)).toBeNull();
  });
  it("allows the total to equal the size but not exceed it", () => {
    expect(validateWithinStrength(40, 40)).toBeNull();
    expect(validateWithinStrength(41, 40)).toContain("41");
  });
});

describe("validateRange", () => {
  const today = "2026-09-22";
  it("requires both dates and a sensible order", () => {
    expect(validateRange("", "2026-09-30", today)).not.toBeNull();
    expect(validateRange("2026-10-02", "2026-10-01", today)).not.toBeNull();
  });
  it("caps at 366 days and rejects a range wholly in the past", () => {
    expect(validateRange("2026-10-01", "2027-10-02", today)).not.toBeNull();
    expect(validateRange("2026-10-01", "2027-09-30", today)).toBeNull();
    expect(validateRange("2026-08-01", "2026-08-10", today)).not.toBeNull();
  });
});
