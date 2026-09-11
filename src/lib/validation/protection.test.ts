import { describe, expect, it } from "vitest";
import { validateAbsenceReason, validateIncidentDescription } from "./protection";

describe("validateIncidentDescription", () => {
  it("rejects a description under 5 characters", () => {
    expect(validateIncidentDescription("Hi")).not.toBeNull();
  });

  it("rejects a description over 4000 characters", () => {
    expect(validateIncidentDescription("a".repeat(4001))).not.toBeNull();
  });

  it("accepts a reasonable description", () => {
    expect(validateIncidentDescription("A window was broken on site during the shift.")).toBeNull();
  });
});

describe("validateAbsenceReason", () => {
  it("rejects an empty reason", () => {
    expect(validateAbsenceReason("   ")).not.toBeNull();
  });

  it("accepts a real reason", () => {
    expect(validateAbsenceReason("Medical emergency.")).toBeNull();
  });
});
