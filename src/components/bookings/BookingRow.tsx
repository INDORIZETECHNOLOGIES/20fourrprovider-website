"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import { acceptBooking, rejectBooking, type Booking } from "@/lib/api/bookings";
import { validateRejectionReason } from "@/lib/validation/bookings";
import { formatPaise, formatDate } from "@/lib/format";
import { SERVICE_CATEGORY_LABELS } from "@/lib/api/provider";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONE } from "@/lib/constants/bookingStatus";
import { DutyControls } from "./DutyControls";
import styles from "./BookingRow.module.css";

type BookingRowProps = {
  booking: Booking;
  isVerified: boolean;
  accessToken: string;
  onUpdated: (bookingId: string, status: Booking["status"]) => void;
};

export function BookingRow({ booking, isVerified, accessToken, onUpdated }: BookingRowProps) {
  const [accepting, setAccepting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setError(null);
    setAccepting(true);
    try {
      await acceptBooking(booking._id, accessToken);
      onUpdated(booking._id, "provider_accepted");
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
      await rejectBooking(booking._id, rejectionReason, accessToken);
      onUpdated(booking._id, "provider_rejected");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setRejecting(false);
    }
  }

  const dateLabel =
    booking.numberOfDays > 1
      ? `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`
      : formatDate(booking.startDate);

  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <span className={styles.category}>{SERVICE_CATEGORY_LABELS[booking.serviceCategory]}</span>
        <Badge tone={BOOKING_STATUS_TONE[booking.status]}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
      </div>
      <div className={styles.details}>
        <span>
          <strong>{booking.clientId.name}</strong> · {booking.clientId.phone}
        </span>
        <span>
          {dateLabel}, {booking.startTime}–{booking.endTime}
        </span>
        {booking.address ? <span>{booking.address}</span> : null}
        <span className={styles.amount}>{formatPaise(booking.totalAmount)}</span>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {booking.status === "pending" ? (
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
      ) : null}

      {booking.status === "pending" && showRejectForm ? (
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

      {booking.status === "payment_done" || booking.status === "duty_started" ? (
        <DutyControls booking={booking} accessToken={accessToken} onUpdated={onUpdated} />
      ) : null}
    </div>
  );
}
