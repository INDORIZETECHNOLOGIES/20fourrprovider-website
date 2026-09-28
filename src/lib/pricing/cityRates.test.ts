import { describe, expect, it } from "vitest";
import {
  EMPTY_ROW,
  hasErrors,
  packageReference,
  pricedCount,
  toCityDraft,
  toRowsPayload,
  validateCityDraft,
  type CityDraft,
} from "./cityRates";
import type { CityRateCard } from "@/lib/api/pricing";

const card: CityRateCard = {
  cityKey: "27-mumbai",
  cityName: "Mumbai",
  stateCode: "27",
  rows: [
    { category: "guard", dailyRate: 150000, totalHoursPerDay: 12, monthlyRate: 3600000, yearlyRate: 39000000, hourlyEnabled: true, hourlyRate: 15000, minimumHours: 4, vehicleRate: 120000, weekendMultiplier: 1.5 },
    { category: "pso", dailyRate: 500000, totalHoursPerDay: 12, weekendMultiplier: 9 },
  ],
};

const withRow = (draft: CityDraft, category: "guard" | "bouncer", patch: Partial<CityDraft["rows"]["guard"]>): CityDraft => ({
  ...draft,
  rows: { ...draft.rows, [category]: { ...draft.rows[category], ...patch } },
});

describe("toCityDraft", () => {
  it("reads paise as whole rupees and the vehicle add-ons off any row", () => {
    const d = toCityDraft(card);
    expect(d.rows.guard).toMatchObject({ dailyRate: "1500", monthlyRate: "36000", yearlyRate: "390000", hourlyRate: "150", hourlyEnabled: true });
    expect(d.rows.bouncer).toEqual(EMPTY_ROW);
    expect(d.vehicleRate).toBe("1200");
    expect(d.vehicleWithDriverRate).toBe("");
  });
});

describe("toRowsPayload", () => {
  it("round-trips a priced row to paise, with packages and hourly", () => {
    const rows = toRowsPayload(toCityDraft(card), ["guard"], card);
    const guard = rows.find((r) => r.category === "guard")!;
    expect(guard).toMatchObject({
      dailyRate: 150000, totalHoursPerDay: 12, monthlyRate: 3600000, yearlyRate: 39000000,
      hourlyEnabled: true, hourlyRate: 15000, minimumHours: 4, vehicleRate: 120000, vehicleWithDriverRate: null, weekendMultiplier: 1.5,
    });
  });

  it("leaves an offered but unpriced category out, so it stays unpriced in this city", () => {
    const rows = toRowsPayload(toCityDraft(card), ["guard", "bouncer"], card);
    expect(rows.map((r) => r.category)).not.toContain("bouncer");
  });

  it("keeps a category the provider stopped offering, dropping an out-of-range weekend multiplier", () => {
    const rows = toRowsPayload(toCityDraft(card), ["guard"], card);
    const pso = rows.find((r) => r.category === "pso")!;
    expect(pso.dailyRate).toBe(500000);
    expect(pso).not.toHaveProperty("weekendMultiplier");
  });

  it("clears a package when its field is emptied", () => {
    const d = withRow(toCityDraft(card), "guard", { monthlyRate: "", yearlyRate: "" });
    const guard = toRowsPayload(d, ["guard"], card).find((r) => r.category === "guard")!;
    expect(guard.monthlyRate).toBeNull();
    expect(guard.yearlyRate).toBeNull();
  });
});

describe("validateCityDraft", () => {
  it("accepts the saved card", () => {
    expect(hasErrors(validateCityDraft(toCityDraft(card), ["guard"]))).toBe(false);
  });

  it("asks for a daily rate when only a package was typed", () => {
    const d = withRow(toCityDraft(null), "bouncer", { monthlyRate: "40000" });
    expect(validateCityDraft(d, ["bouncer"]).rows.bouncer?.dailyRate).toMatch(/daily rate/);
  });

  it("refuses a yearly package without a monthly one", () => {
    const d = withRow(toCityDraft(card), "guard", { monthlyRate: "" });
    expect(validateCityDraft(d, ["guard"]).rows.guard?.yearlyRate).toMatch(/monthly package/);
  });

  it("ignores categories that aren't offered", () => {
    const d = withRow(toCityDraft(null), "bouncer", { monthlyRate: "x" });
    expect(hasErrors(validateCityDraft(d, ["guard"]))).toBe(false);
  });
});

describe("helpers", () => {
  it("counts offered categories that are priced", () => {
    expect(pricedCount(toCityDraft(card), ["guard", "bouncer"])).toBe(1);
  });

  it("flags a package above the same period at the daily rate", () => {
    const d = toCityDraft(card).rows.guard;
    expect(packageReference(d)).toMatchObject({ month: 45000, year: 547500, monthAboveDaily: false });
    expect(packageReference({ ...d, monthlyRate: "50000" }).monthAboveDaily).toBe(true);
  });
});
