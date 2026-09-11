"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  confirmGuardEnd,
  confirmGuardStart,
  getCurrentCoordinates,
  verifyEndOtp,
  verifyStartOtp,
} from "@/lib/api/duty";
import { validateOtp } from "@/lib/validation/duty";
import type { Booking } from "@/lib/api/bookings";
import styles from "./BookingRow.module.css";

type DutyControlsProps = {
  booking: Booking;
  accessToken: string;
  onUpdated: (bookingId: string, status: Booking["status"]) => void;
};

export function DutyControls({ booking, accessToken, onUpdated }: DutyControlsProps) {
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGuard = booking.serviceCategory === "guard";
  const starting = booking.status === "payment_done";

  async function handleGuardConfirm() {
    setError(null);
    setSubmitting(true);
    try {
      if (starting) {
        await confirmGuardStart(booking._id, accessToken);
        onUpdated(booking._id, "duty_started");
      } else {
        await confirmGuardEnd(booking._id, accessToken);
        onUpdated(booking._id, "duty_ended");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

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

  const guardLabel = starting ? "Confirm duty start" : "Confirm duty end";
  const otpLabel = starting ? "Start duty" : "End duty";

  return (
    <div className={styles.rejectForm}>
      {error ? <p className={styles.error}>{error}</p> : null}
      {isGuard ? (
        <button type="button" className={styles.acceptButton} disabled={submitting} onClick={handleGuardConfirm}>
          {submitting ? "Confirming…" : guardLabel}
        </button>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
