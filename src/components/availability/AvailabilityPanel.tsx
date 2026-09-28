"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/Switch";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Banner } from "@/components/ui/Banner";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { ApiError } from "@/lib/api/client";
import { addDayOff, removeDayOff, setAvailability } from "@/lib/api/availability";
import type { ProviderProfile } from "@/lib/api/provider";
import { validateDayOffDate } from "@/lib/validation/availability";
import { formatDate } from "@/lib/format";
import { ServicesOffered } from "./ServicesOffered";
import { CityRates } from "./CityRates";
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
          intro="Whether you're taking work, what you offer and what it costs in each city, and the days you're off."
        />

        {gateMessage ? (
          <div className={styles.bannerGap}>
            <Banner>
              {gateMessage} <Link href="/documents">Go to documents</Link>
            </Banner>
          </div>
        ) : null}

        {/* Same control, same wording as the dashboard's availability row. */}
        <div className={`${styles.availRow} ${isAvailable ? styles.availOn : ""}`}>
          <span className={styles.availDot} aria-hidden="true" />
          <div className={styles.availText}>
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

        <ServicesOffered profile={profile} accessToken={accessToken} onUpdated={onProfileUpdated} />

        <section className={styles.section} aria-labelledby="rates-title">
          <h2 id="rates-title" className={styles.sectionTitle}>
            Rates by city
          </h2>
          <p className={styles.sectionSubtext}>
            Clients only find you in cities where you&apos;ve set rates, and each booking is priced from the city
            the guards work in.
          </p>
          <CityRates accessToken={accessToken} offered={profile.serviceCategories} serviceState={profile.serviceState ?? null} />
        </section>

        <section className={styles.section} aria-labelledby="days-off-title">
          <h2 id="days-off-title" className={styles.sectionTitle}>
            Days off
          </h2>
          <p className={styles.sectionSubtext}>
            Clients can&apos;t book you on a blocked date. To stop taking work altogether, pause availability above.
          </p>

          <form className={styles.addRow} onSubmit={handleAddDayOff} noValidate>
            <div className={styles.addDate}>
              <Field
                id="newDayOffDate"
                label="Date"
                type="date"
                min={today}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                error={dateError}
              />
            </div>
            <div className={styles.addReason}>
              <Field
                id="newDayOffReason"
                label="Reason (optional)"
                placeholder="e.g. Diwali"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.secondaryButton} disabled={addingDayOff}>
              {addingDayOff ? "Blocking…" : "Block date"}
            </button>
          </form>

          {daysOff.length === 0 ? (
            <p className={styles.empty}>No days off blocked.</p>
          ) : (
            <RowList>
              {daysOff.map((dayOff) => (
                <div key={dayOff.date} className={styles.dayOffRow}>
                  <Icon name="calendar" size={18} className={styles.dayOffIcon} />
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
                    {removingDate === dayOff.date ? "Unblocking…" : "Unblock"}
                  </button>
                </div>
              ))}
            </RowList>
          )}
        </section>
      </div>
    </div>
  );
}
