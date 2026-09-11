import { describe, expect, it } from "vitest";
import {
  validateGstin,
  validatePan,
  validatePsaraExpiry,
  validatePsaraLicenceNumber,
  validateTurnoverAmount,
} from "./taxProfile";

describe("validatePan", () => {
  it("accepts a valid PAN", () => {
    expect(validatePan("ABCPE1234F")).toBeNull();
  });

  it("rejects an empty PAN", () => {
    expect(validatePan("  ")).not.toBeNull();
  });

  it("rejects a malformed PAN", () => {
    expect(validatePan("ABCDE1234")).not.toBeNull();
  });

  it("rejects a PAN with an unrecognized holder-type character", () => {
    expect(validatePan("ABCDE1234Z")).not.toBeNull();
  });
});

describe("validateGstin", () => {
  it("accepts a structurally valid GSTIN", () => {
    expect(validateGstin("29ABCDE1234F1Z5")).toBeNull();
  });

  it("rejects an empty GSTIN", () => {
    expect(validateGstin("")).not.toBeNull();
  });

  it("rejects a malformed GSTIN", () => {
    expect(validateGstin("29ABCDE1234F1Z")).not.toBeNull();
  });
});

describe("validateTurnoverAmount", () => {
  it("accepts an empty value (optional)", () => {
    expect(validateTurnoverAmount("")).toBeNull();
  });

  it("accepts a valid amount", () => {
    expect(validateTurnoverAmount("500000")).toBeNull();
  });

  it("rejects a negative amount", () => {
    expect(validateTurnoverAmount("-5")).not.toBeNull();
  });

  it("rejects a non-numeric value", () => {
    expect(validateTurnoverAmount("abc")).not.toBeNull();
  });
});

describe("validatePsaraLicenceNumber", () => {
  it("rejects an empty licence number", () => {
    expect(validatePsaraLicenceNumber("")).not.toBeNull();
  });

  it("accepts a real licence number", () => {
    expect(validatePsaraLicenceNumber("PSARA/KA/2026/001")).toBeNull();
  });
});

describe("validatePsaraExpiry", () => {
  it("rejects an empty date", () => {
    expect(validatePsaraExpiry("")).not.toBeNull();
  });

  it("rejects a past date", () => {
    expect(validatePsaraExpiry("2000-01-01")).not.toBeNull();
  });

  it("accepts a future date", () => {
    expect(validatePsaraExpiry("2099-01-01")).toBeNull();
  });
});
