import { describe, expect, it } from "vitest";
import { validateReview } from "./ratings";

describe("validateReview", () => {
  it("accepts a short review", () => {
    expect(validateReview("Great client, paid on time.")).toBeNull();
  });

  it("rejects a review over 500 characters", () => {
    expect(validateReview("a".repeat(501))).not.toBeNull();
  });

  it("accepts an empty review", () => {
    expect(validateReview("")).toBeNull();
  });
});
