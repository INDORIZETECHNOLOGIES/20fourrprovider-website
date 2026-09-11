"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { markBookingComplete, type Booking } from "@/lib/api/bookings";
import styles from "./BookingRow.module.css";

type CompleteBookingControlProps = {
  bookingId: string;
  accessToken: string;
  onUpdated: (bookingId: string, status: Booking["status"]) => void;
};

export function CompleteBookingControl({ bookingId, accessToken, onUpdated }: CompleteBookingControlProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setError(null);
    setSubmitting(true);
    try {
      await markBookingComplete(bookingId, accessToken);
      onUpdated(bookingId, "completed");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="button" className={styles.acceptButton} disabled={submitting} onClick={handleComplete}>
          {submitting ? "Completing…" : "Mark complete"}
        </button>
      </div>
    </>
  );
}
