"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/client";
import { acceptBooking, rejectBooking, type Booking } from "@/lib/api/bookings";
import { validateRejectionReason } from "@/lib/validation/bookings";
import styles from "./BookingRow.module.css";

type PendingBookingActionsProps = {
  bookingId: string;
  isVerified: boolean;
  accessToken: string;
  onUpdated: (bookingId: string, status: Booking["status"]) => void;
};

export function PendingBookingActions({
  bookingId,
  isVerified,
  accessToken,
  onUpdated,
}: PendingBookingActionsProps) {
  const [accepting, setAccepting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setError(null);
    setAccepting(true);
    try {
      await acceptBooking(bookingId, accessToken);
      onUpdated(bookingId, "provider_accepted");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setAccepting(false);
    }
  }

  async function handleReject() {
    const validationError = validateRejectionReason(rejectionReason);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setRejecting(true);
    try {
      await rejectBooking(bookingId, rejectionReason, accessToken);
      onUpdated(bookingId, "provider_rejected");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setRejecting(false);
    }
  }

  return (
    <>
      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        {isVerified ? (
          <button type="button" className={styles.acceptButton} disabled={accepting} onClick={handleAccept}>
            {accepting ? "Accepting…" : "Accept"}
          </button>
        ) : (
          <span className={styles.gateNote}>
            Complete <Link href="/documents">verification</Link> to accept bookings
          </span>
        )}
        {!showRejectForm ? (
          <button
            type="button"
            className={styles.declineButton}
            disabled={rejecting}
            onClick={() => setShowRejectForm(true)}
          >
            Decline
          </button>
        ) : null}
      </div>

      {showRejectForm ? (
        <div className={styles.rejectForm}>
          <input
            className={styles.rejectInput}
            placeholder="Reason for declining"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            maxLength={500}
          />
          <div className={styles.actions}>
            <button type="button" className={styles.acceptButton} disabled={rejecting} onClick={handleReject}>
              {rejecting ? "Declining…" : "Confirm decline"}
            </button>
            <button
              type="button"
              className={styles.declineButton}
              disabled={rejecting}
              onClick={() => setShowRejectForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
