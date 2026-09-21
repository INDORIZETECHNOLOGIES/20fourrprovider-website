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

import {
  validateHourlyRate,
  validateLicenceNumber,
  validateMinimumHours,
  validateVehicleAddOn,
} from "./profile";

describe("validateHourlyRate", () => {
  it("accepts the bounds", () => {
    expect(validateHourlyRate(50)).toBeNull();
    expect(validateHourlyRate(1000000)).toBeNull();
  });
  it("rejects below ₹50, above the cap, and non-numbers", () => {
    expect(validateHourlyRate(49)).not.toBeNull();
    expect(validateHourlyRate(1000001)).not.toBeNull();
    expect(validateHourlyRate(Number.NaN)).not.toBeNull();
  });
});

describe("validateMinimumHours", () => {
  it("accepts a whole number below the shift length", () => {
    expect(validateMinimumHours(4, 12)).toBeNull();
  });
  it("rejects zero, fractions, and a minimum at or above the shift", () => {
    expect(validateMinimumHours(0, 12)).not.toBeNull();
    expect(validateMinimumHours(2.5, 12)).not.toBeNull();
    expect(validateMinimumHours(12, 12)).not.toBeNull();
  });
});

describe("validateVehicleAddOn", () => {
  it("accepts blank, zero and the cap", () => {
    expect(validateVehicleAddOn("")).toBeNull();
    expect(validateVehicleAddOn("0")).toBeNull();
    expect(validateVehicleAddOn("500000")).toBeNull();
  });
  it("rejects negatives, over the cap and text", () => {
    expect(validateVehicleAddOn("-1")).not.toBeNull();
    expect(validateVehicleAddOn("500001")).not.toBeNull();
    expect(validateVehicleAddOn("abc")).not.toBeNull();
  });
});

describe("validateLicenceNumber", () => {
  it("accepts blank and a normal number, rejects an overlong one", () => {
    expect(validateLicenceNumber("")).toBeNull();
    expect(validateLicenceNumber("MH/PSARA/2021/1234")).toBeNull();
    expect(validateLicenceNumber("x".repeat(51))).not.toBeNull();
  });
});
