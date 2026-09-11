"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/Switch";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { addDayOff, removeDayOff, setAvailability, type DayOff, type WorkingHours } from "@/lib/api/availability";
import { validateDayOffDate } from "@/lib/validation/availability";
import styles from "./AvailabilityPanel.module.css";

type AvailabilityPanelProps = {
  isVerified: boolean;
  initialIsAvailable: boolean;
  workingHours: WorkingHours;
  initialDaysOff: DayOff[];
  accessToken: string;
};

const VERIFICATION_REQUIRED_MESSAGE =
  "Your account is pending verification. Complete your documents to start accepting work.";

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function AvailabilityPanel({
  isVerified,
  initialIsAvailable,
  workingHours,
  initialDaysOff,
  accessToken,
}: AvailabilityPanelProps) {
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [daysOff, setDaysOff] = useState(initialDaysOff);
  const [toggling, setToggling] = useState(false);
  const [gateMessage, setGateMessage] = useState<string | null>(
    isVerified ? null : VERIFICATION_REQUIRED_MESSAGE,
  );

  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [addingDayOff, setAddingDayOff] = useState(false);
  const [removingDate, setRemovingDate] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function handleToggle(next: boolean) {
    setIsAvailable(next);
    setToggling(true);
    try {
      const result = await setAvailability(next, accessToken);
      setIsAvailable(result.isAvailable);
      setGateMessage(null);
    } catch (error) {
      setIsAvailable(!next);
      if (error instanceof ApiError && error.code === "SC_602") {
        setGateMessage(error.message);
      } else {
        setGateMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
      }
    } finally {
      setToggling(false);
    }
  }

  async function handleAddDayOff(event: FormEvent) {
    event.preventDefault();
    const validationError = validateDayOffDate(newDate);
    setDateError(validationError);
    if (validationError) return;

    setAddingDayOff(true);
    try {
      const result = await addDayOff(newDate, newReason || undefined, accessToken);
      setDaysOff(result.daysOff);
      setNewDate("");
      setNewReason("");
      setGateMessage(null);
    } catch (error) {
      if (error instanceof ApiError && error.code === "SC_602") {
        setGateMessage(error.message);
      } else if (error instanceof ApiError && error.code === "SC_1307") {
        setDateError("This date is already blocked.");
      } else {
        setDateError(error instanceof Error ? error.message : "Something went wrong. Try again.");
      }
    } finally {
      setAddingDayOff(false);
    }
  }

  async function handleRemoveDayOff(date: string) {
    setRemovingDate(date);
    try {
      const result = await removeDayOff(toDateInputValue(date), accessToken);
      setDaysOff(result.daysOff);
      setGateMessage(null);
    } catch (error) {
      if (error instanceof ApiError && error.code === "SC_602") {
        setGateMessage(error.message);
      }
    } finally {
      setRemovingDate(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Availability</h1>
        <p className={styles.subtext}>
          Turn off availability when you can&apos;t take new bookings, and block off specific days
          in advance.
        </p>

        {gateMessage ? (
          <Banner>
            {gateMessage} <Link href="/documents">Go to documents</Link>
          </Banner>
        ) : null}

        <div className={styles.card}>
          <Switch
            id="isAvailable"
            label={isAvailable ? "Available for new bookings" : "Not available"}
            checked={isAvailable}
            disabled={toggling}
            onChange={handleToggle}
          />
          <p className={styles.workingHours}>
            Working hours: {workingHours.startTime} – {workingHours.endTime}
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Days off</h2>
        <p className={styles.sectionSubtext}>Block specific dates when you won&apos;t be working.</p>

        <form className={styles.addRow} onSubmit={handleAddDayOff} noValidate>
          <Field
            id="newDayOffDate"
            label="Date"
            type="date"
            min={today}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            error={dateError}
          />
          <Field
            id="newDayOffReason"
            label="Reason (optional)"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
          />
          <Button type="submit" disabled={addingDayOff}>
            {addingDayOff ? "Adding…" : "Block date"}
          </Button>
        </form>

        <div className={styles.dayOffList}>
          {daysOff.length === 0 ? (
            <p className={styles.empty}>No days off blocked.</p>
          ) : (
            daysOff.map((dayOff) => (
              <div key={dayOff.date} className={styles.dayOffRow}>
                <div className={styles.dayOffInfo}>
                  <span className={styles.dayOffDate}>{formatDate(dayOff.date)}</span>
                  {dayOff.reason ? <span className={styles.dayOffReason}>{dayOff.reason}</span> : null}
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  disabled={removingDate === dayOff.date}
                  onClick={() => handleRemoveDayOff(dayOff.date)}
                >
                  {removingDate === dayOff.date ? "Removing…" : "Remove"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
