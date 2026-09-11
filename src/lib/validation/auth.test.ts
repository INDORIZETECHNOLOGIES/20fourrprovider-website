import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateName,
  validateOtp,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
} from "./auth";

describe("validateEmail", () => {
  it("rejects empty input", () => {
    expect(validateEmail("")).toMatch(/enter/i);
  });

  it("rejects malformed addresses", () => {
    expect(validateEmail("not-an-email")).toMatch(/valid/i);
  });

  it("accepts a well-formed address", () => {
    expect(validateEmail("provider@example.com")).toBeNull();
  });
});

describe("validatePhone", () => {
  it("rejects non-10-digit numbers", () => {
    expect(validatePhone("12345")).not.toBeNull();
  });

  it("rejects numbers starting outside 6-9", () => {
    expect(validatePhone("5123456789")).not.toBeNull();
  });

  it("accepts a valid Indian mobile number", () => {
    expect(validatePhone("9876543210")).toBeNull();
  });
});

describe("validateName", () => {
  it("rejects blank/whitespace-only names", () => {
    expect(validateName("   ")).not.toBeNull();
  });

  it("accepts a real name", () => {
    expect(validateName("Ravi Kumar")).toBeNull();
  });
});

describe("validatePassword", () => {
  it.each([
    ["short1!", "too short"],
    ["alllowercase1!", "no uppercase"],
    ["ALLUPPERCASE1!", "no lowercase"],
    ["NoDigitsHere!", "no digit"],
    ["NoSymbolsHere1", "no symbol"],
  ])("rejects %s (%s)", (password) => {
    expect(validatePassword(password)).not.toBeNull();
  });

  it("accepts a password meeting every rule", () => {
    expect(validatePassword("Str0ng!Pass")).toBeNull();
  });
});

describe("validatePasswordMatch", () => {
  it("rejects mismatched passwords", () => {
    expect(validatePasswordMatch("a", "b")).not.toBeNull();
  });

  it("accepts matching passwords", () => {
    expect(validatePasswordMatch("same", "same")).toBeNull();
  });
});

describe("validateOtp", () => {
  it("rejects a code that isn't 6 digits", () => {
    expect(validateOtp("12345")).not.toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(validateOtp("abcdef")).not.toBeNull();
  });

  it("accepts a 6-digit code", () => {
    expect(validateOtp("123456")).toBeNull();
  });
});
