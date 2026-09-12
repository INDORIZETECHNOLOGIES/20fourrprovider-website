"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/Switch";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { ApiError } from "@/lib/api/client";
import { addDayOff, removeDayOff, setAvailability } from "@/lib/api/availability";
import type { ProviderProfile } from "@/lib/api/provider";
import { validateDayOffDate } from "@/lib/validation/availability";
import { formatDate } from "@/lib/format";
import { ServicesSection } from "./ServicesSection";
import styles from "./AvailabilityPanel.module.css";

type AvailabilityPanelProps = {
  profile: ProviderProfile;
  accessToken: string;
  onProfileUpdated: (profile: ProviderProfile) => void;
};

const VERIFICATION_REQUIRED_MESSAGE =
  "Your account is pending verification. Complete your documents to start accepting work.";

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function AvailabilityPanel({ profile, accessToken, onProfileUpdated }: AvailabilityPanelProps) {
  const [isAvailable, setIsAvailable] = useState(profile.availability.isAvailable);
  const [daysOff, setDaysOff] = useState(profile.availability.daysOff);
  const [toggling, setToggling] = useState(false);
  const [gateMessage, setGateMessage] = useState<string | null>(
    profile.isVerified ? null : VERIFICATION_REQUIRED_MESSAGE,
  );

  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [addingDayOff, setAddingDayOff] = useState(false);
  const [removingDate, setRemovingDate] = useState<string | null>(null);

  const workingHours = profile.availability.workingHours;
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
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Availability"
          intro="What you offer, whether you're taking work right now, and the days you've blocked off."
        />

        {gateMessage ? (
          <Banner>
            {gateMessage} <Link href="/documents">Go to documents</Link>
          </Banner>
        ) : null}

        {/* Same control, same wording as the dashboard's availability row. */}
        <div className={styles.availRow}>
          <div>
            <p className={styles.availTitle}>
              {isAvailable ? "You are accepting bookings" : "You are not accepting bookings"}
            </p>
            <p className={styles.availSubtext}>
              {isAvailable
                ? `Clients can discover and book you for ${workingHours.startTime}–${workingHours.endTime}.`
                : "You're hidden from new clients. Switch on to resume."}
            </p>
          </div>

          <Switch
            id="isAvailable"
            label={toggling ? "Saving…" : isAvailable ? "Available" : "Paused"}
            checked={isAvailable}
            disabled={toggling}
            onChange={handleToggle}
          />
        </div>

        <ServicesSection profile={profile} accessToken={accessToken} onUpdated={onProfileUpdated} />

        <h2 className={styles.sectionTitle}>Days off</h2>
        <p className={styles.sectionSubtext}>
          Blocked dates stay on your calendar — clients can&apos;t book you for them. To stop taking
          work altogether, switch availability off above.
        </p>

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

        {daysOff.length === 0 ? (
          <p className={styles.empty}>No days off blocked.</p>
        ) : (
          <RowList>
            {daysOff.map((dayOff) => (
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
            ))}
          </RowList>
        )}
      </div>
    </div>
  );
}
