import { describe, expect, it } from "vitest";
import { validateAccountName, validateAccountNumber, validateIfscCode } from "./bankDetails";

describe("validateAccountNumber", () => {
  it("accepts a valid account number", () => {
    expect(validateAccountNumber("123456789012")).toBeNull();
  });

  it("rejects a too-short account number", () => {
    expect(validateAccountNumber("12345")).not.toBeNull();
  });

  it("rejects a non-numeric account number", () => {
    expect(validateAccountNumber("12345678901a")).not.toBeNull();
  });
});

describe("validateIfscCode", () => {
  it("accepts a valid IFSC code", () => {
    expect(validateIfscCode("HDFC0123456")).toBeNull();
  });

  it("rejects a malformed IFSC code", () => {
    expect(validateIfscCode("HDFC123456")).not.toBeNull();
  });
});

describe("validateAccountName", () => {
  it("rejects an empty name", () => {
    expect(validateAccountName("  ")).not.toBeNull();
  });

  it("accepts a real name", () => {
    expect(validateAccountName("Priya Sharma")).toBeNull();
  });
});
