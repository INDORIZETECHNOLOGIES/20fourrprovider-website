"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { Banner } from "@/components/ui/Banner";
import { RowList } from "@/components/ui/RowList";
import { ApiError } from "@/lib/api/client";
import {
  carryPricingFields,
  saveProviderProfile,
  updateProviderPricing,
  getProviderProfile,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  type ProviderProfile,
  type ServiceCategory,
} from "@/lib/api/provider";
import {
  validateDailyRate,
  validateHourlyRate,
  validateMinimumHours,
  validateTotalHoursPerDay,
  validateVehicleAddOn,
} from "@/lib/validation/profile";
import styles from "./ServicesSection.module.css";

type ServicesSectionProps = {
  profile: ProviderProfile;
  accessToken: string;
  onUpdated: (profile: ProviderProfile) => void;
};

type CategoryDraft = {
  offered: boolean;
  dailyRate: string;
  totalHoursPerDay: string;
  hourlyEnabled: boolean;
  hourlyRate: string;
  minimumHours: string;
};

type Draft = Record<ServiceCategory, CategoryDraft>;

// Vehicle add-ons are one figure per provider, written onto every category row.
type VehicleDraft = { vehicleRate: string; vehicleWithDriverRate: string };

type RateErrors = Partial<
  Record<ServiceCategory, { dailyRate?: string; totalHoursPerDay?: string; hourlyRate?: string; minimumHours?: string }>
>;

const rupees = (paise: number | null | undefined) => (paise ? String(Math.round(paise / 100)) : "");

function toVehicleDraft(profile: ProviderProfile): VehicleDraft {
  const rows = profile.pricing ?? [];
  return {
    vehicleRate: rupees(rows.find((p) => p.vehicleRate)?.vehicleRate),
    vehicleWithDriverRate: rupees(rows.find((p) => p.vehicleWithDriverRate)?.vehicleWithDriverRate),
  };
}

function toDraft(profile: ProviderProfile): Draft {
  return SERVICE_CATEGORIES.reduce((draft, category) => {
    const pricing = profile.pricing?.find((p) => p.category === category);
    draft[category] = {
      offered: profile.serviceCategories.includes(category),
      // Rates are paise on the wire and rupees in the form.
      dailyRate: pricing ? String(Math.round(pricing.dailyRate / 100)) : "",
      totalHoursPerDay: pricing?.totalHoursPerDay ? String(pricing.totalHoursPerDay) : "",
      hourlyEnabled: Boolean(pricing?.hourlyEnabled),
      hourlyRate: rupees(pricing?.hourlyRate),
      minimumHours: pricing?.minimumHours ? String(pricing.minimumHours) : "4",
    };
    return draft;
  }, {} as Draft);
}

export function ServicesSection({ profile, accessToken, onUpdated }: ServicesSectionProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  const [vehicle, setVehicle] = useState<VehicleDraft>(() => toVehicleDraft(profile));
  const [vehicleErrors, setVehicleErrors] = useState<Partial<VehicleDraft>>({});
  const [rateErrors, setRateErrors] = useState<RateErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const offered = SERVICE_CATEGORIES.filter((category) => draft[category].offered);
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(toDraft(profile)) ||
    JSON.stringify(vehicle) !== JSON.stringify(toVehicleDraft(profile));

  function updateVehicle(patch: Partial<VehicleDraft>) {
    setVehicle((current) => ({ ...current, ...patch }));
    setSaved(false);
  }

  function update(category: ServiceCategory, patch: Partial<Draft[ServiceCategory]>) {
    setDraft((current) => ({ ...current, [category]: { ...current[category], ...patch } }));
    setSaved(false);
  }

  async function handleSave() {
    if (offered.length === 0) {
      setError("Offer at least one service — clients search by service category.");
      return;
    }

    const errors: RateErrors = {};
    for (const category of offered) {
      const dailyRate = validateDailyRate(Number(draft[category].dailyRate)) ?? undefined;
      const totalHoursPerDay = validateTotalHoursPerDay(Number(draft[category].totalHoursPerDay)) ?? undefined;
      const hourly = draft[category].hourlyEnabled;
      const hourlyRate = hourly ? (validateHourlyRate(Number(draft[category].hourlyRate)) ?? undefined) : undefined;
      const minimumHours = hourly
        ? (validateMinimumHours(Number(draft[category].minimumHours), Number(draft[category].totalHoursPerDay)) ??
          undefined)
        : undefined;
      if (dailyRate || totalHoursPerDay || hourlyRate || minimumHours) {
        errors[category] = { dailyRate, totalHoursPerDay, hourlyRate, minimumHours };
      }
    }
    setRateErrors(errors);
    const vErrors = {
      vehicleRate: validateVehicleAddOn(vehicle.vehicleRate) ?? undefined,
      vehicleWithDriverRate: validateVehicleAddOn(vehicle.vehicleWithDriverRate) ?? undefined,
    };
    setVehicleErrors(vErrors);
    if (Object.keys(errors).length > 0 || vErrors.vehicleRate || vErrors.vehicleWithDriverRate) {
      setError(null);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      // Pricing must cover every category currently on the profile, so send the
      // union of what's saved and what's being offered — otherwise removing a
      // category fails validation against the profile as it still stands.
      const union = Array.from(new Set([...profile.serviceCategories, ...offered]));
      const toPaiseOrNull = (text: string) => (text.trim() ? Math.round(Number(text) * 100) : null);
      const vehicleRate = toPaiseOrNull(vehicle.vehicleRate);
      const vehicleWithDriverRate = toPaiseOrNull(vehicle.vehicleWithDriverRate);

      await updateProviderPricing(
        union.map((category) => {
          const existing = profile.pricing?.find((p) => p.category === category);
          const rate = Number(draft[category].dailyRate);
          const hours = Number(draft[category].totalHoursPerDay);
          const isOffered = draft[category].offered;
          const hourlyOn = isOffered && draft[category].hourlyEnabled;
          return {
            // Everything this form doesn't edit is carried over from the saved row.
            ...carryPricingFields(existing),
            category,
            dailyRate: Number.isFinite(rate) && rate > 0 ? Math.round(rate * 100) : (existing?.dailyRate ?? 10000),
            totalHoursPerDay:
              Number.isFinite(hours) && hours > 0 ? hours : (existing?.totalHoursPerDay ?? 12),
            ...(isOffered
              ? {
                  hourlyEnabled: hourlyOn,
                  ...(hourlyOn
                    ? {
                        hourlyRate: toPaiseOrNull(draft[category].hourlyRate),
                        minimumHours: Number(draft[category].minimumHours),
                      }
                    : {}),
                }
              : {}),
            vehicleRate,
            vehicleWithDriverRate,
          };
        }),
        accessToken,
      );

      // Sends every profile field the endpoint reads, so saving services can't
      // blank the public profile or details edited on their own pages.
      await saveProviderProfile(profile, { serviceCategories: offered }, accessToken);

      // The PUT response omits select:false fields (see the bank-details note in
      // CLAUDE.md), so re-read rather than trusting it for what we render next.
      const { profile: fresh } = await getProviderProfile(accessToken);
      onUpdated(fresh);
      setDraft(toDraft(fresh));
      setVehicle(toVehicleDraft(fresh));
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.code === "SC_210"
            ? "Add a daily rate for every service you offer."
            : err.message
          : "Couldn't save your services. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Services you offer</h2>
      <p className={styles.intro}>
        Clients search by service. Switch one off and you stop appearing in those searches — your
        rate is what a client pays for one day of that service.
      </p>

      {error ? <Banner>{error}</Banner> : null}

      <RowList>
        {SERVICE_CATEGORIES.map((category) => {
          const entry = draft[category];
          return (
            <div key={category} className={styles.row}>
              <div className={styles.rowHead}>
                <div>
                  <p className={styles.name}>{SERVICE_CATEGORY_LABELS[category]}</p>
                  <p className={styles.state}>
                    {entry.offered ? "Clients can book you for this" : "Not offered"}
                  </p>
                </div>
                <Switch
                  id={`service-${category}`}
                  label={entry.offered ? "Offered" : "Off"}
                  checked={entry.offered}
                  disabled={saving}
                  onChange={(next) => update(category, { offered: next })}
                />
              </div>

              {entry.offered ? (
                <div className={styles.rates}>
                  <Field
                    id={`rate-${category}`}
                    label="Daily rate (₹)"
                    type="number"
                    min={100}
                    max={100000}
                    value={entry.dailyRate}
                    disabled={saving}
                    onChange={(e) => update(category, { dailyRate: e.target.value })}
                    error={rateErrors[category]?.dailyRate}
                  />
                  <Field
                    id={`hours-${category}`}
                    label="Hours per shift"
                    type="number"
                    min={4}
                    max={24}
                    value={entry.totalHoursPerDay}
                    disabled={saving}
                    onChange={(e) => update(category, { totalHoursPerDay: e.target.value })}
                    error={rateErrors[category]?.totalHoursPerDay}
                  />
                  <div className={styles.hourly}>
                    <Switch
                      id={`hourly-${category}`}
                      label="Also take short bookings by the hour"
                      checked={entry.hourlyEnabled}
                      disabled={saving}
                      onChange={(next) => update(category, { hourlyEnabled: next })}
                    />
                    <p className={styles.hourlyHint}>
                      For a one-day booking shorter than your {entry.totalHoursPerDay || "shift"}-hour shift, the
                      client pays your hourly rate. Anything longer pays the daily rate.
                    </p>
                    {entry.hourlyEnabled ? (
                      <div className={styles.hourlyFields}>
                        <Field
                          id={`hourly-rate-${category}`}
                          label="Hourly rate (₹)"
                          type="number"
                          min={50}
                          value={entry.hourlyRate}
                          disabled={saving}
                          onChange={(e) => update(category, { hourlyRate: e.target.value })}
                          error={rateErrors[category]?.hourlyRate}
                        />
                        <Field
                          id={`min-hours-${category}`}
                          label="Minimum hours per booking"
                          type="number"
                          min={1}
                          value={entry.minimumHours}
                          disabled={saving}
                          onChange={(e) => update(category, { minimumHours: e.target.value })}
                          error={rateErrors[category]?.minimumHours}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </RowList>

      <h3 className={styles.subtitle}>Vehicle add-ons</h3>
      <p className={styles.intro}>
        Optional. A client who wants you to bring a vehicle pays this extra for each day, on top of the daily rate.
        Leave a field blank if you don&apos;t offer it. Set the vehicle type and registration under Public profile.
      </p>
      <RowList>
        <div className={styles.row}>
          <div className={styles.vehicleFields}>
            <Field
              id="vehicle-with-driver-rate"
              label="Vehicle with driver (₹ per day)"
              type="number"
              min={0}
              value={vehicle.vehicleWithDriverRate}
              disabled={saving}
              onChange={(e) => updateVehicle({ vehicleWithDriverRate: e.target.value })}
              error={vehicleErrors.vehicleWithDriverRate}
            />
            <Field
              id="vehicle-rate"
              label="Vehicle only, no driver (₹ per day)"
              type="number"
              min={0}
              value={vehicle.vehicleRate}
              disabled={saving}
              onChange={(e) => updateVehicle({ vehicleRate: e.target.value })}
              error={vehicleErrors.vehicleRate}
            />
          </div>
        </div>
      </RowList>

      <div className={styles.actions}>
        <button type="button" className={styles.saveButton} disabled={saving || !dirty} onClick={handleSave}>
          {saving ? "Saving…" : "Save services"}
        </button>
        {dirty && !saving ? (
          <span className={styles.actionNote}>Unsaved changes</span>
        ) : saved ? (
          <span className={styles.actionNote}>Saved.</span>
        ) : null}
      </div>
    </section>
  );
}
