"use client";

import { useState, type FormEvent } from "react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { emptyCounts, setStaffDay, setStaffRange, type StaffCounts, type StaffDay } from "@/lib/api/staffAvailability";
import { formatDayLong } from "@/lib/staffCalendar";
import {
  NOTES_MAX,
  parseCount,
  totalStaff,
  validateCountText,
  validateNotes,
  validateWithinStrength,
} from "@/lib/validation/staffAvailability";
import { CountsFields, countTextsFrom, type CountTexts } from "./CountsFields";
import styles from "./StaffAvailability.module.css";

type Props = {
  date: string;
  day: StaffDay | undefined;
  maxStaff: number | null;
  disabled: boolean;
  accessToken: string;
  onChanged: (date: string, day: StaffDay) => void;
  onClose: () => void;
};

const toCounts = (texts: CountTexts): StaffCounts => {
  const out = emptyCounts();
  for (const key of Object.keys(out) as (keyof StaffCounts)[]) out[key] = parseCount(texts[key] || "0");
  return out;
};

// Mounted with key={date}, so choosing another day starts from that day's saved values.
export function DayEditor({ date, day, maxStaff, disabled, accessToken, onChanged, onClose }: Props) {
  const [texts, setTexts] = useState<CountTexts>(() => countTextsFrom(day?.counts));
  const [notes, setNotes] = useState(day?.notes ?? "");
  const [busy, setBusy] = useState<"save" | "off" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const counts = toCounts(texts);
  const total = totalStaff(counts);
  const overMessage = Number.isNaN(total) ? null : validateWithinStrength(total, maxStaff);
  const anyInvalid = Object.values(texts).some((t) => validateCountText(t));
  const notesError = validateNotes(notes);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(null);
    if (anyInvalid || overMessage || notesError) return;

    setBusy("save");
    try {
      await setStaffDay({ date, counts, notes: notes.trim() }, accessToken);
      onChanged(date, { date, counts, notes: notes.trim(), off: false });
      setSaved("Saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this day. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleOff() {
    setError(null);
    setSaved(null);
    setBusy("off");
    try {
      await setStaffRange({ startDate: date, endDate: date, off: true }, accessToken);
      onChanged(date, { date, counts: emptyCounts(), notes: notes.trim(), off: true });
      setTexts(countTextsFrom(null));
      setSaved("Marked off.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't mark this day off. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="day-editor-title">
      <h2 id="day-editor-title" className={styles.sectionTitle}>
        {formatDayLong(date)}
      </h2>
      <p className={styles.sectionText}>
        {day?.off ? "This day is marked off. Saving counts brings it back." : "How many of each you can field on this day."}
      </p>

      {saved ? (
        <p className={styles.saved} role="status">
          {saved}
        </p>
      ) : null}
      {error ? <Banner>{error}</Banner> : null}

      <form onSubmit={handleSave} noValidate className={styles.stack}>
        <CountsFields idPrefix="day" values={texts} disabled={disabled || busy !== null} onChange={setTexts} />

        <p className={`${styles.total} ${overMessage ? styles.totalOver : ""}`}>
          Total {Number.isNaN(total) ? "—" : total}
          {maxStaff ? ` of ${maxStaff}` : ""}
        </p>
        {overMessage ? (
          <p className={styles.note} role="alert" style={{ color: "var(--color-danger)" }}>
            {overMessage}
          </p>
        ) : null}

        <Textarea
          id="day-notes"
          label="Notes (optional)"
          className={styles.textarea}
          value={notes}
          maxLength={NOTES_MAX}
          disabled={disabled || busy !== null}
          error={notesError}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className={styles.actions}>
          <Button type="submit" disabled={disabled || busy !== null || anyInvalid || Boolean(overMessage)}>
            {busy === "save" ? "Saving…" : "Save this day"}
          </Button>
          <button type="button" className={styles.secondary} disabled={disabled || busy !== null} onClick={handleOff}>
            {busy === "off" ? "Marking…" : "Mark day off"}
          </button>
          <button type="button" className={styles.textButton} disabled={busy !== null} onClick={onClose}>
            Close
          </button>
        </div>
      </form>
    </section>
  );
}
