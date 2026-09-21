import { describe, expect, it } from "vitest";
import { canAppeal, validateAppealReason } from "./penalties";

describe("validateAppealReason", () => {
  it("rejects blank and too-short reasons", () => {
    expect(validateAppealReason("   ")).not.toBeNull();
    expect(validateAppealReason("It was wrong")).not.toBeNull();
  });
  it("accepts a real explanation", () => {
    expect(validateAppealReason("The client cancelled the shift the night before, so I was never on duty.")).toBeNull();
  });
  it("rejects an overlong reason", () => {
    expect(validateAppealReason("x".repeat(1001))).not.toBeNull();
  });
});

describe("canAppeal", () => {
  it("allows a pending or deducted penalty with no appeal", () => {
    expect(canAppeal({ status: "pending" })).toBe(true);
    expect(canAppeal({ status: "deducted", appeal: { appealed: false } })).toBe(true);
  });
  it("blocks a waived penalty and one already appealed (even if rejected)", () => {
    expect(canAppeal({ status: "waived" })).toBe(false);
    expect(canAppeal({ status: "appealed", appeal: { appealed: true } })).toBe(false);
    expect(canAppeal({ status: "deducted", appeal: { appealed: true } })).toBe(false);
  });
});
