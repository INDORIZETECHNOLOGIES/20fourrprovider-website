"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPaise, formatDate } from "@/lib/format";
import { SERVICE_CATEGORY_LABELS } from "@/lib/api/provider";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONE, CHAT_ALLOWED_STATUSES } from "@/lib/constants/bookingStatus";
import type { Booking } from "@/lib/api/bookings";
import { PendingBookingActions } from "./PendingBookingActions";
import { DutyControls } from "./DutyControls";
import { CompleteBookingControl } from "./CompleteBookingControl";
import styles from "./BookingRow.module.css";

type BookingRowProps = {
  booking: Booking;
  isVerified: boolean;
  accessToken: string;
  onUpdated: (bookingId: string, status: Booking["status"]) => void;
};

export function BookingRow({ booking, isVerified, accessToken, onUpdated }: BookingRowProps) {
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

      <div className={styles.linkRow}>
        <Link href={`/bookings/${booking._id}`} className={styles.viewLink}>
          View details
        </Link>
        {CHAT_ALLOWED_STATUSES.includes(booking.status) ? (
          <Link href={`/bookings/${booking._id}/chat`} className={styles.viewLink}>
            Chat with {booking.clientId.name}
          </Link>
        ) : null}
      </div>

      {booking.status === "pending" ? (
        <PendingBookingActions
          bookingId={booking._id}
          isVerified={isVerified}
          accessToken={accessToken}
          onUpdated={onUpdated}
        />
      ) : null}

      {booking.status === "payment_done" || booking.status === "duty_started" ? (
        <DutyControls booking={booking} accessToken={accessToken} onUpdated={onUpdated} />
      ) : null}

      {booking.status === "duty_ended" ? (
        <CompleteBookingControl bookingId={booking._id} accessToken={accessToken} onUpdated={onUpdated} />
      ) : null}
    </div>
  );
}
