"use client";

import { useState, type FormEvent } from "react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { ApiError } from "@/lib/api/client";
import { emptyCounts, setStaffRange, type StaffCounts } from "@/lib/api/staffAvailability";
import { daysInclusive } from "@/lib/staffCalendar";
import { parseCount, totalStaff, validateCountText, validateRange, validateWithinStrength } from "@/lib/validation/staffAvailability";
import { CountsFields, countTextsFrom, type CountTexts } from "./CountsFields";
import styles from "./StaffAvailability.module.css";

type Props = {
  today: string;
  maxStaff: number | null;
  disabled: boolean;
  accessToken: string;
  onApplied: () => void;
};

export function RangeEditor({ today, maxStaff, disabled, accessToken, onApplied }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [off, setOff] = useState(false);
  const [texts, setTexts] = useState<CountTexts>(() => countTextsFrom(null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const counts: StaffCounts = emptyCounts();
  for (const key of Object.keys(counts) as (keyof StaffCounts)[]) counts[key] = parseCount(texts[key] || "0");
  const total = totalStaff(counts);
  const days = start && end ? daysInclusive(start, end) : null;

  const rangeError = start || end ? validateRange(start, end, today) : null;
  const overMessage = off || Number.isNaN(total) ? null : validateWithinStrength(total, maxStaff);
  const anyInvalid = !off && Object.values(texts).some((t) => validateCountText(t));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(null);
    const invalid = validateRange(start, end, today);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (anyInvalid || overMessage) return;

    setBusy(true);
    try {
      const result = await setStaffRange(off ? { startDate: start, endDate: end, off: true } : { startDate: start, endDate: end, counts }, accessToken);
      setSaved(`${result.updatedDays} ${result.updatedDays === 1 ? "day" : "days"} updated.`);
      onApplied();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update those dates. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="range-title">
      <h2 id="range-title" className={styles.sectionTitle}>
        Set a range of dates
      </h2>
      <p className={styles.sectionText}>
        Apply the same headcount to every day in a period, for a contract or a quiet month. This replaces anything
        already set for those days.
      </p>

      {saved ? (
        <p className={styles.saved} role="status">
          {saved}
        </p>
      ) : null}
      {error ? <Banner>{error}</Banner> : null}

      <form onSubmit={handleSubmit} noValidate className={styles.stack}>
        <div className={styles.pair}>
          <Field id="range-start" label="From" type="date" min={today} value={start} disabled={disabled || busy} onChange={(e) => setStart(e.target.value)} />
          <Field id="range-end" label="To" type="date" min={start || today} value={end} disabled={disabled || busy} error={rangeError} onChange={(e) => setEnd(e.target.value)} />
        </div>

        <Switch id="range-off" label="No one available in this period" checked={off} disabled={disabled || busy} onChange={setOff} />

        {!off ? (
          <>
            <CountsFields idPrefix="range" values={texts} disabled={disabled || busy} onChange={setTexts} />
            <p className={`${styles.total} ${overMessage ? styles.totalOver : ""}`}>
              Total per day {Number.isNaN(total) ? "—" : total}
              {maxStaff ? ` of ${maxStaff}` : ""}
            </p>
            {overMessage ? (
              <p className={styles.note} role="alert" style={{ color: "var(--color-danger)" }}>
                {overMessage}
              </p>
            ) : null}
          </>
        ) : null}

        <div className={styles.actions}>
          <Button type="submit" disabled={disabled || busy || Boolean(overMessage) || anyInvalid}>
            {busy ? "Applying…" : days ? `Apply to ${days} ${days === 1 ? "day" : "days"}` : "Apply to range"}
          </Button>
        </div>
      </form>
    </section>
  );
}
