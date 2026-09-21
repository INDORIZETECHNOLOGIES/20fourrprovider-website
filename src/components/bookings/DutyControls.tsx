"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getCurrentCoordinates, verifyEndOtp, verifyStartOtp } from "@/lib/api/duty";
import { validateOtp } from "@/lib/validation/duty";
import type { Booking } from "@/lib/api/bookings";
import styles from "./BookingRow.module.css";

type DutyControlsProps = {
  booking: Booking;
  accessToken: string;
  onUpdated: (bookingId: string, status: Booking["status"]) => void;
};

// Every category, guard included, starts and ends duty with the 6-digit code the client
// generates and shares in person. Guards used to self-confirm with no code, which let a
// provider run a booking to completion without the client ever being involved.
export function DutyControls({ booking, accessToken, onUpdated }: DutyControlsProps) {
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const starting = booking.status === "payment_done";

  async function handleOtpSubmit() {
    const validationError = validateOtp(otp);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      if (starting) {
        const coords = await getCurrentCoordinates();
        await verifyStartOtp(booking._id, otp, accessToken, coords);
        onUpdated(booking._id, "duty_started");
      } else {
        await verifyEndOtp(booking._id, otp, accessToken);
        onUpdated(booking._id, "duty_ended");
      }
      setOtp("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const otpLabel = starting ? "Start duty" : "End duty";

  return (
    <div className={styles.rejectForm}>
      {error ? <p className={styles.error}>{error}</p> : null}
      <input
        className={styles.rejectInput}
        placeholder="6-digit code from client"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        maxLength={6}
      />
      <button type="button" className={styles.acceptButton} disabled={submitting} onClick={handleOtpSubmit}>
        {submitting ? "Verifying…" : otpLabel}
      </button>
    </div>
  );
}
