"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { SERVICE_CATEGORY_LABELS, type ServiceCategory } from "@/lib/api/provider";
import { formatPaise } from "@/lib/format";
import {
  isPriced,
  packageReference,
  type CityDraft,
  type CityDraftErrors,
  type RowDraft,
} from "@/lib/pricing/cityRates";
import styles from "./CityRates.module.css";

type CityRateCardProps = {
  cityKey: string;
  cityName: string;
  stateName: string | null;
  isPrimary: boolean;
  /** Not saved yet: a city just added in this session. */
  isNew: boolean;
  offered: ServiceCategory[];
  draft: CityDraft;
  errors: CityDraftErrors;
  dirty: boolean;
  saving: boolean;
  removing: boolean;
  status: { tone: "error" | "info"; message: string } | null;
  onChange: (draft: CityDraft) => void;
  onSave: () => void;
  onRemove: () => void;
};

const rupeesOf = (n: number) => formatPaise(Math.round(n * 100));

export function CityRateCard({
  cityKey,
  cityName,
  stateName,
  isPrimary,
  isNew,
  offered,
  draft,
  errors,
  dirty,
  saving,
  removing,
  status,
  onChange,
  onSave,
  onRemove,
}: CityRateCardProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const busy = saving || removing;

  function updateRow(category: ServiceCategory, patch: Partial<RowDraft>) {
    onChange({ ...draft, rows: { ...draft.rows, [category]: { ...draft.rows[category], ...patch } } });
  }

  return (
    <section className={styles.card} aria-labelledby={`city-${cityKey}-title`}>
      <header className={styles.cardHead}>
        <div>
          <h3 id={`city-${cityKey}-title`} className={styles.cityName}>
            {cityName}
          </h3>
          <p className={styles.cityMeta}>
            {stateName ?? "State not set"}
            {isPrimary ? <span className={styles.metaSep}>Primary city</span> : null}
          </p>
        </div>

        {confirmingRemove ? (
          <div className={styles.confirm} role="group" aria-label={`Remove ${cityName}`}>
            <p className={styles.confirmText}>
              {isNew ? `Discard ${cityName}?` : `Stop serving ${cityName}? Clients there won't find you.`}
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={busy}
                onClick={() => {
                  setConfirmingRemove(false);
                  onRemove();
                }}
              >
                {removing ? "Removing…" : isNew ? "Discard" : "Remove city"}
              </button>
              <button type="button" className={styles.quietButton} onClick={() => setConfirmingRemove(false)}>
                Keep
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.quietButton} disabled={busy} onClick={() => setConfirmingRemove(true)}>
            {isNew ? "Discard" : "Remove city"}
          </button>
        )}
      </header>

      {isNew ? (
        <div className={styles.cardNotice}>
          <Banner tone="info">
            Not live yet. Save these rates and clients in {cityName} can start finding you.
          </Banner>
        </div>
      ) : null}

      {offered.length === 0 ? (
        <p className={styles.cardEmpty}>Switch on a service above, then set what it costs in {cityName}.</p>
      ) : (
        <ul className={styles.rateRows}>
          {offered.map((category) => (
            <RateRow
              key={category}
              cityKey={cityKey}
              cityName={cityName}
              category={category}
              row={draft.rows[category]}
              errors={errors.rows[category] ?? {}}
              disabled={busy}
              onChange={(patch) => updateRow(category, patch)}
            />
          ))}
        </ul>
      )}

      <div className={styles.vehicle}>
        <div className={styles.vehicleText}>
          <h4 className={styles.rowName}>Vehicle add-ons in {cityName}</h4>
          <p className={styles.help}>
            Per day, on top of the daily rate, when a client asks you to bring one. Leave blank if you don&apos;t offer it.
          </p>
        </div>
        <div className={styles.rateGrid}>
          <Field
            id={`${cityKey}-vehicle-driver`}
            label="With driver (₹/day)"
            inputMode="numeric"
            value={draft.vehicleWithDriverRate}
            disabled={busy}
            onChange={(e) => onChange({ ...draft, vehicleWithDriverRate: e.target.value })}
            error={errors.vehicleWithDriverRate}
          />
          <Field
            id={`${cityKey}-vehicle`}
            label="Vehicle only (₹/day)"
            inputMode="numeric"
            value={draft.vehicleRate}
            disabled={busy}
            onChange={(e) => onChange({ ...draft, vehicleRate: e.target.value })}
            error={errors.vehicleRate}
          />
        </div>
      </div>

      <footer className={styles.cardFoot}>
        <div className={styles.footStatus} aria-live="polite">
          {status ? (
            <span className={status.tone === "error" ? styles.statusError : styles.statusOk}>{status.message}</span>
          ) : dirty ? (
            <span className={styles.statusDirty}>Unsaved changes</span>
          ) : null}
        </div>
        <button type="button" className={styles.saveButton} disabled={busy || (!dirty && !isNew)} onClick={onSave}>
          {saving ? "Saving…" : `Save ${cityName} rates`}
        </button>
      </footer>
    </section>
  );
}

function RateRow({
  cityKey,
  cityName,
  category,
  row,
  errors,
  disabled,
  onChange,
}: {
  cityKey: string;
  cityName: string;
  category: ServiceCategory;
  row: RowDraft;
  errors: Partial<Record<keyof RowDraft, string>>;
  disabled: boolean;
  onChange: (patch: Partial<RowDraft>) => void;
}) {
  const id = `${cityKey}-${category}`;
  const priced = isPriced(row);
  const ref = packageReference(row);

  return (
    <li className={styles.rateRow}>
      <div className={styles.rowHead}>
        <h4 className={styles.rowName}>{SERVICE_CATEGORY_LABELS[category]}</h4>
        {priced ? <Badge tone="active">Priced</Badge> : <Badge tone="muted">Not priced here</Badge>}
      </div>

      {!priced ? (
        <p className={styles.help}>Clients in {cityName} can&apos;t book this until you add a daily rate.</p>
      ) : null}

      <div className={styles.rateGrid}>
        <Field
          id={`${id}-daily`}
          label="Daily rate (₹)"
          inputMode="numeric"
          value={row.dailyRate}
          disabled={disabled}
          onChange={(e) => onChange({ dailyRate: e.target.value })}
          error={errors.dailyRate}
        />
        <Field
          id={`${id}-hours`}
          label="Hours per shift"
          inputMode="numeric"
          value={row.totalHoursPerDay}
          disabled={disabled}
          onChange={(e) => onChange({ totalHoursPerDay: e.target.value })}
          error={errors.totalHoursPerDay}
        />
        <Field
          id={`${id}-monthly`}
          label="Monthly package (₹)"
          inputMode="numeric"
          placeholder="Optional"
          value={row.monthlyRate}
          disabled={disabled}
          onChange={(e) => onChange({ monthlyRate: e.target.value })}
          error={errors.monthlyRate}
        />
        <Field
          id={`${id}-yearly`}
          label="Yearly package (₹)"
          inputMode="numeric"
          placeholder="Optional"
          value={row.yearlyRate}
          disabled={disabled}
          onChange={(e) => onChange({ yearlyRate: e.target.value })}
          error={errors.yearlyRate}
        />
      </div>

      {ref.month !== null ? (
        <p className={ref.monthAboveDaily || ref.yearAboveDaily ? styles.refWarn : styles.ref}>
          {ref.monthAboveDaily || ref.yearAboveDaily
            ? `A package above the daily rate never applies — a client booking a month or more is charged the cheaper daily price (${rupeesOf(ref.month)} for 30 days).`
            : `For comparison: 30 days at your daily rate is ${rupeesOf(ref.month)}, a year ${rupeesOf(ref.year!)}. Packages apply to bookings of a month or more.`}
        </p>
      ) : null}

      <div className={styles.hourly}>
        <Switch
          id={`${id}-hourly`}
          label="Also take short bookings by the hour"
          checked={row.hourlyEnabled}
          disabled={disabled}
          onChange={(next) => onChange({ hourlyEnabled: next })}
        />
        {row.hourlyEnabled ? (
          <div className={styles.rateGrid}>
            <Field
              id={`${id}-hourly-rate`}
              label="Hourly rate (₹)"
              inputMode="numeric"
              value={row.hourlyRate}
              disabled={disabled}
              onChange={(e) => onChange({ hourlyRate: e.target.value })}
              error={errors.hourlyRate}
            />
            <Field
              id={`${id}-min-hours`}
              label="Minimum hours"
              inputMode="numeric"
              value={row.minimumHours}
              disabled={disabled}
              onChange={(e) => onChange({ minimumHours: e.target.value })}
              error={errors.minimumHours}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}
