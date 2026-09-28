// The editable form of one city's rate card, and the conversions to and from the API.
// Paise on the wire, whole rupees in the form (CLAUDE.md). Pure — no React, no fetch — so the
// rules that decide what gets saved are unit-tested (cityRates.test.ts).

import { SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/api/provider";
import type { CityRateCard, CityRateRow } from "@/lib/api/pricing";
import {
  validateDailyRate,
  validateHourlyRate,
  validateMinimumHours,
  validateMonthlyRate,
  validateTotalHoursPerDay,
  validateVehicleAddOn,
  validateYearlyRate,
} from "@/lib/validation/profile";

export type RowDraft = {
  dailyRate: string;
  totalHoursPerDay: string;
  monthlyRate: string;
  yearlyRate: string;
  hourlyEnabled: boolean;
  hourlyRate: string;
  minimumHours: string;
};

export type CityDraft = {
  rows: Record<ServiceCategory, RowDraft>;
  vehicleRate: string;
  vehicleWithDriverRate: string;
};

export type RowErrors = Partial<Record<keyof RowDraft, string>>;
export type CityDraftErrors = {
  rows: Partial<Record<ServiceCategory, RowErrors>>;
  vehicleRate?: string;
  vehicleWithDriverRate?: string;
};

const rupees = (paise: number | null | undefined) => (paise ? String(Math.round(paise / 100)) : "");
const toPaise = (text: string) => Math.round(Number(text) * 100);
const toPaiseOrNull = (text: string) => (text.trim() ? toPaise(text) : null);

export const EMPTY_ROW: RowDraft = {
  dailyRate: "",
  totalHoursPerDay: "",
  monthlyRate: "",
  yearlyRate: "",
  hourlyEnabled: false,
  hourlyRate: "",
  minimumHours: "4",
};

export function toCityDraft(card: Pick<CityRateCard, "rows"> | null | undefined): CityDraft {
  const rows = SERVICE_CATEGORIES.reduce(
    (acc, category) => {
      const row = card?.rows.find((r) => r.category === category);
      acc[category] = row
        ? {
            dailyRate: rupees(row.dailyRate),
            totalHoursPerDay: row.totalHoursPerDay ? String(row.totalHoursPerDay) : "",
            monthlyRate: rupees(row.monthlyRate),
            yearlyRate: rupees(row.yearlyRate),
            hourlyEnabled: Boolean(row.hourlyEnabled),
            hourlyRate: rupees(row.hourlyRate),
            minimumHours: row.minimumHours ? String(row.minimumHours) : "4",
          }
        : { ...EMPTY_ROW };
      return acc;
    },
    {} as Record<ServiceCategory, RowDraft>,
  );
  const withVehicle = card?.rows.find((r) => r.vehicleRate || r.vehicleWithDriverRate);
  return {
    rows,
    vehicleRate: rupees(withVehicle?.vehicleRate),
    vehicleWithDriverRate: rupees(withVehicle?.vehicleWithDriverRate),
  };
}

/** A row counts as priced once it has a daily rate; the other fields refine it. */
export const isPriced = (row: RowDraft) => row.dailyRate.trim() !== "";

/** Anything typed into a row other than its defaults. */
const isTouched = (row: RowDraft) =>
  isPriced(row) || Boolean(row.totalHoursPerDay || row.monthlyRate || row.yearlyRate || row.hourlyRate) || row.hourlyEnabled;

export function validateCityDraft(draft: CityDraft, offered: ServiceCategory[]): CityDraftErrors {
  const errors: CityDraftErrors = { rows: {} };
  for (const category of offered) {
    const row = draft.rows[category];
    if (!isPriced(row)) {
      if (isTouched(row)) errors.rows[category] = { dailyRate: "Add a daily rate, or clear this row to leave it unpriced." };
      continue;
    }
    const e: RowErrors = {
      dailyRate: validateDailyRate(Number(row.dailyRate)) ?? undefined,
      totalHoursPerDay: validateTotalHoursPerDay(Number(row.totalHoursPerDay)) ?? undefined,
      monthlyRate: validateMonthlyRate(row.monthlyRate) ?? undefined,
      yearlyRate: validateYearlyRate(row.yearlyRate, row.monthlyRate) ?? undefined,
      ...(row.hourlyEnabled
        ? {
            hourlyRate: validateHourlyRate(Number(row.hourlyRate)) ?? undefined,
            minimumHours: validateMinimumHours(Number(row.minimumHours), Number(row.totalHoursPerDay)) ?? undefined,
          }
        : {}),
    };
    const present = Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as RowErrors;
    if (Object.keys(present).length) errors.rows[category] = present;
  }
  const vehicleRate = validateVehicleAddOn(draft.vehicleRate);
  const vehicleWithDriverRate = validateVehicleAddOn(draft.vehicleWithDriverRate);
  if (vehicleRate) errors.vehicleRate = vehicleRate;
  if (vehicleWithDriverRate) errors.vehicleWithDriverRate = vehicleWithDriverRate;
  return errors;
}

export const hasErrors = (e: CityDraftErrors) =>
  Object.keys(e.rows).length > 0 || Boolean(e.vehicleRate || e.vehicleWithDriverRate);

/**
 * The rows to PUT for one city. Offered, priced categories come from the form. A category the
 * provider no longer offers keeps whatever this city already had for it — switching a service
 * off hides it from clients; it shouldn't also throw its prices away.
 */
export function toRowsPayload(
  draft: CityDraft,
  offered: ServiceCategory[],
  saved: Pick<CityRateCard, "rows"> | null | undefined,
): Array<Partial<CityRateRow> & { category: ServiceCategory; dailyRate: number }> {
  const vehicleRate = toPaiseOrNull(draft.vehicleRate);
  const vehicleWithDriverRate = toPaiseOrNull(draft.vehicleWithDriverRate);
  const out: Array<Partial<CityRateRow> & { category: ServiceCategory; dailyRate: number }> = [];

  for (const category of SERVICE_CATEGORIES) {
    const existing = saved?.rows.find((r) => r.category === category);
    if (!offered.includes(category)) {
      if (existing) out.push({ ...stripReadOnly(existing), category, dailyRate: existing.dailyRate });
      continue;
    }
    const row = draft.rows[category];
    if (!isPriced(row)) continue;
    const weekend = Number(existing?.weekendMultiplier);
    out.push({
      category,
      dailyRate: toPaise(row.dailyRate),
      totalHoursPerDay: Number(row.totalHoursPerDay),
      monthlyRate: toPaiseOrNull(row.monthlyRate),
      yearlyRate: toPaiseOrNull(row.yearlyRate),
      hourlyEnabled: row.hourlyEnabled,
      ...(row.hourlyEnabled ? { hourlyRate: toPaise(row.hourlyRate), minimumHours: Number(row.minimumHours) } : {}),
      vehicleRate,
      vehicleWithDriverRate,
      // Stored, unused by any price, not editable — carried so a save never resets it. A legacy
      // value outside 1–3 would 400 the whole save, so it is dropped instead (CLAUDE.md).
      ...(Number.isFinite(weekend) && weekend >= 1 && weekend <= 3 ? { weekendMultiplier: weekend } : {}),
    });
  }
  return out;
}

function stripReadOnly(row: CityRateRow): Partial<CityRateRow> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping read-only keys
  const { updatedAt: _u, _id: _i, ...rest } = row as CityRateRow & { updatedAt?: unknown; _id?: unknown };
  const weekend = Number(rest.weekendMultiplier);
  if (!(Number.isFinite(weekend) && weekend >= 1 && weekend <= 3)) delete rest.weekendMultiplier;
  return rest;
}

/** Offered categories priced in this draft, for the city tab's "2 of 3" count. */
export const pricedCount = (draft: CityDraft, offered: ServiceCategory[]) =>
  offered.filter((c) => isPriced(draft.rows[c])).length;

/**
 * A reference line under the package fields: what the same period costs at the daily rate.
 * Display only — the server decides what a booking is charged (it takes the cheaper of the two).
 */
export function packageReference(row: RowDraft): { month: number | null; year: number | null; monthAboveDaily: boolean; yearAboveDaily: boolean } {
  const daily = Number(row.dailyRate);
  if (!isPriced(row) || !Number.isFinite(daily) || daily <= 0) return { month: null, year: null, monthAboveDaily: false, yearAboveDaily: false };
  const month = daily * 30;
  const year = daily * 365;
  return {
    month,
    year,
    monthAboveDaily: row.monthlyRate.trim() !== "" && Number(row.monthlyRate) > month,
    yearAboveDaily: row.yearlyRate.trim() !== "" && Number(row.yearlyRate) > year,
  };
}

export const draftsEqual = (a: CityDraft, b: CityDraft) => JSON.stringify(a) === JSON.stringify(b);
