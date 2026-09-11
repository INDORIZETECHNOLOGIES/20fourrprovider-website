import { describe, expect, it } from "vitest";
import { validateOtp } from "./duty";

describe("validateOtp", () => {
  it("rejects an empty value", () => {
    expect(validateOtp("")).not.toBeNull();
  });

  it("rejects a value with the wrong length", () => {
    expect(validateOtp("12345")).not.toBeNull();
    expect(validateOtp("1234567")).not.toBeNull();
  });

  it("rejects non-numeric characters", () => {
    expect(validateOtp("12a456")).not.toBeNull();
  });

  it("accepts a 6-digit code", () => {
    expect(validateOtp("482913")).toBeNull();
  });
});
