import { describe, expect, it } from "vitest";
import {
  normalizeTags,
  validateDateOfBirth,
  validateEmergencyPhone,
  validateResponseTime,
  validateServiceRadius,
  validateVehicleRegistration,
  validateYearEstablished,
} from "./profileDetails";

const NOW = new Date("2026-09-22T10:00:00");

describe("validateDateOfBirth", () => {
  it("accepts blank (the field is optional)", () => {
    expect(validateDateOfBirth("", NOW)).toBeNull();
  });
  it("accepts a past date", () => {
    expect(validateDateOfBirth("1985-06-15", NOW)).toBeNull();
  });
  it("rejects a future date", () => {
    expect(validateDateOfBirth("2027-01-01", NOW)).not.toBeNull();
  });
  it("rejects an impossibly old date", () => {
    expect(validateDateOfBirth("1900-01-01", NOW)).not.toBeNull();
  });
});

describe("validateEmergencyPhone", () => {
  it("accepts blank", () => {
    expect(validateEmergencyPhone("  ")).toBeNull();
  });
  it("accepts a 10-digit mobile", () => {
    expect(validateEmergencyPhone("9876543210")).toBeNull();
  });
  it("rejects a number starting below 6", () => {
    expect(validateEmergencyPhone("5876543210")).not.toBeNull();
  });
});

describe("validateServiceRadius", () => {
  it("accepts blank and the bounds", () => {
    expect(validateServiceRadius("")).toBeNull();
    expect(validateServiceRadius("0")).toBeNull();
    expect(validateServiceRadius("5000")).toBeNull();
  });
  it("rejects out-of-range and non-integers", () => {
    expect(validateServiceRadius("5001")).not.toBeNull();
    expect(validateServiceRadius("12.5")).not.toBeNull();
    expect(validateServiceRadius("-1")).not.toBeNull();
  });
});

describe("validateYearEstablished", () => {
  it("accepts blank and a real year", () => {
    expect(validateYearEstablished("", NOW)).toBeNull();
    expect(validateYearEstablished("2015", NOW)).toBeNull();
  });
  it("rejects a future year and a too-early one", () => {
    expect(validateYearEstablished("2027", NOW)).not.toBeNull();
    expect(validateYearEstablished("1899", NOW)).not.toBeNull();
  });
});

describe("validateResponseTime", () => {
  it("requires a digit when filled", () => {
    expect(validateResponseTime("Within 30 minutes")).toBeNull();
    expect(validateResponseTime("Very fast")).not.toBeNull();
    expect(validateResponseTime("")).toBeNull();
  });
});

describe("validateVehicleRegistration", () => {
  it("accepts letters, digits and spaces", () => {
    expect(validateVehicleRegistration("MH 02 AB 1234")).toBeNull();
  });
  it("rejects symbols", () => {
    expect(validateVehicleRegistration("MH-02-AB")).not.toBeNull();
  });
});

describe("normalizeTags", () => {
  it("trims, drops blanks and case-insensitive repeats", () => {
    expect(normalizeTags([" Hindi", "hindi", "", "English "])).toEqual(["Hindi", "English"]);
  });
});
