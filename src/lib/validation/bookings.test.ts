import { describe, expect, it } from "vitest";
import { validateRejectionReason } from "./bookings";

describe("validateRejectionReason", () => {
  it("rejects an empty reason", () => {
    expect(validateRejectionReason("   ")).not.toBeNull();
  });

  it("rejects a reason over 500 characters", () => {
    expect(validateRejectionReason("a".repeat(501))).not.toBeNull();
  });

  it("accepts a reasonable reason", () => {
    expect(validateRejectionReason("Already booked that day.")).toBeNull();
  });
});
