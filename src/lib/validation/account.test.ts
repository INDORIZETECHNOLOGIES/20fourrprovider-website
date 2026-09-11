import { describe, expect, it } from "vitest";
import { validateConsentReason, validateErasureReason } from "./account";

describe("validateConsentReason", () => {
  it("accepts an empty reason", () => {
    expect(validateConsentReason("")).toBeNull();
  });

  it("rejects a reason over 500 characters", () => {
    expect(validateConsentReason("a".repeat(501))).not.toBeNull();
  });
});

describe("validateErasureReason", () => {
  it("accepts an empty reason", () => {
    expect(validateErasureReason("")).toBeNull();
  });

  it("rejects a reason over 1000 characters", () => {
    expect(validateErasureReason("a".repeat(1001))).not.toBeNull();
  });
});
