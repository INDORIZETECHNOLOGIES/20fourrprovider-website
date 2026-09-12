"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { Banner } from "@/components/ui/Banner";
import { RowList } from "@/components/ui/RowList";
import { ApiError } from "@/lib/api/client";
import {
  updateProviderProfile,
  updateProviderPricing,
  getProviderProfile,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  type ProviderProfile,
  type ServiceCategory,
} from "@/lib/api/provider";
import { validateDailyRate, validateTotalHoursPerDay } from "@/lib/validation/profile";
import styles from "./ServicesSection.module.css";

type ServicesSectionProps = {
  profile: ProviderProfile;
  accessToken: string;
  onUpdated: (profile: ProviderProfile) => void;
};

type Draft = Record<ServiceCategory, { offered: boolean; dailyRate: string; totalHoursPerDay: string }>;

type RateErrors = Partial<Record<ServiceCategory, { dailyRate?: string; totalHoursPerDay?: string }>>;

function toDraft(profile: ProviderProfile): Draft {
  return SERVICE_CATEGORIES.reduce((draft, category) => {
    const pricing = profile.pricing?.find((p) => p.category === category);
    draft[category] = {
      offered: profile.serviceCategories.includes(category),
      // Rates are paise on the wire and rupees in the form.
      dailyRate: pricing ? String(Math.round(pricing.dailyRate / 100)) : "",
      totalHoursPerDay: pricing?.totalHoursPerDay ? String(pricing.totalHoursPerDay) : "",
    };
    return draft;
  }, {} as Draft);
}

export function ServicesSection({ profile, accessToken, onUpdated }: ServicesSectionProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  const [rateErrors, setRateErrors] = useState<RateErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const offered = SERVICE_CATEGORIES.filter((category) => draft[category].offered);
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(profile));

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
      if (dailyRate || totalHoursPerDay) errors[category] = { dailyRate, totalHoursPerDay };
    }
    setRateErrors(errors);
    if (Object.keys(errors).length > 0) {
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
      await updateProviderPricing(
        union.map((category) => {
          const existing = profile.pricing?.find((p) => p.category === category);
          const rate = Number(draft[category].dailyRate);
          const hours = Number(draft[category].totalHoursPerDay);
          return {
            category,
            dailyRate: Number.isFinite(rate) && rate > 0 ? Math.round(rate * 100) : (existing?.dailyRate ?? 10000),
            totalHoursPerDay:
              Number.isFinite(hours) && hours > 0 ? hours : (existing?.totalHoursPerDay ?? 12),
          };
        }),
        accessToken,
      );

      await updateProviderProfile(
        {
          providerType: profile.providerType,
          serviceCategories: offered,
          serviceCity: profile.serviceCity,
          serviceState: profile.serviceState,
          yearsExperience: profile.yearsExperience,
          businessName: profile.businessName,
          description: profile.description,
        },
        accessToken,
      );

      // The PUT response omits select:false fields (see the bank-details note in
      // CLAUDE.md), so re-read rather than trusting it for what we render next.
      const { profile: fresh } = await getProviderProfile(accessToken);
      onUpdated(fresh);
      setDraft(toDraft(fresh));
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
                </div>
              ) : null}
            </div>
          );
        })}
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
