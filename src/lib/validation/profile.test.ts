import { describe, expect, it } from "vitest";
import {
  validateDailyRate,
  validateServiceCategories,
  validateServiceCity,
  validateServiceState,
  validateTotalHoursPerDay,
  validateYearsExperience,
} from "./profile";

describe("validateServiceCategories", () => {
  it("rejects an empty selection", () => {
    expect(validateServiceCategories([])).not.toBeNull();
  });

  it("accepts one or more categories", () => {
    expect(validateServiceCategories(["guard"])).toBeNull();
  });
});

describe("validateServiceCity / validateServiceState", () => {
  it("rejects blank values", () => {
    expect(validateServiceCity("  ")).not.toBeNull();
    expect(validateServiceState("")).not.toBeNull();
  });

  it("accepts real values", () => {
    expect(validateServiceCity("Pune")).toBeNull();
    expect(validateServiceState("Maharashtra")).toBeNull();
  });
});

describe("validateYearsExperience", () => {
  it.each([-1, 51, NaN])("rejects out-of-range value %s", (years) => {
    expect(validateYearsExperience(years)).not.toBeNull();
  });

  it.each([0, 25, 50])("accepts in-range value %s", (years) => {
    expect(validateYearsExperience(years)).toBeNull();
  });
});

describe("validateDailyRate", () => {
  it.each([0, 99, 100001, NaN])("rejects out-of-range rate %s", (rupees) => {
    expect(validateDailyRate(rupees)).not.toBeNull();
  });

  it.each([100, 1000, 100000])("accepts in-range rate %s", (rupees) => {
    expect(validateDailyRate(rupees)).toBeNull();
  });
});

describe("validateTotalHoursPerDay", () => {
  it.each([0, 3, 25, NaN])("rejects out-of-range hours %s", (hours) => {
    expect(validateTotalHoursPerDay(hours)).not.toBeNull();
  });

  it.each([4, 12, 24])("accepts in-range hours %s", (hours) => {
    expect(validateTotalHoursPerDay(hours)).toBeNull();
  });
});
