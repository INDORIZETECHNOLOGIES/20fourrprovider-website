"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { clientName, getBookingDetail, headcountOf, serviceLabel, type Booking, type BookingDetail as BookingDetailType, type ThreatAssessment } from "@/lib/api/bookings";
import { formatDate, formatPaise } from "@/lib/format";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONE, CHAT_ALLOWED_STATUSES } from "@/lib/constants/bookingStatus";
import { PendingBookingActions } from "./PendingBookingActions";
import { DutyControls } from "./DutyControls";
import { CompleteBookingControl } from "./CompleteBookingControl";
import { SosControl } from "./SosControl";
import { IncidentsSection } from "./IncidentsSection";
import { AbsenceAlertControl } from "./AbsenceAlertControl";
import { RateBookingControl } from "./RateBookingControl";
import { PaymentStatusSection } from "./PaymentStatusSection";
import { ProviderInvoiceSection } from "./ProviderInvoiceSection";
import { StaffingCheck } from "./StaffingCheck";
import { TeamSection } from "./TeamSection";
import { useLiveVersion } from "@/lib/live/accountEvents";
import styles from "./BookingDetail.module.css";

type BookingDetailProps = {
  bookingId: string;
  isVerified: boolean;
  accessToken: string;
  /** Agencies assign a team from their roster (spec 0017). */
  isAgency?: boolean;
};

export function BookingDetail({ bookingId, isVerified, isAgency = false, accessToken }: BookingDetailProps) {
  const [booking, setBooking] = useState<BookingDetailType | null>(null);
  const [threatProfile, setThreatProfile] = useState<ThreatAssessment | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Refetch when the server says something shown here changed (spec 0020).
  const liveVersion = useLiveVersion({ entities: ["booking", "payment"], entityId: bookingId });

  useEffect(() => {
    let cancelled = false;
    getBookingDetail(bookingId, accessToken)
      .then(({ booking, clientThreatProfile }) => {
        if (cancelled) return;
        setBooking(booking);
        setThreatProfile(clientThreatProfile);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error instanceof ApiError ? error.message : "Couldn't load this booking.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, accessToken, liveVersion]);

  function handleUpdated(_bookingId: string, status: Booking["status"]) {
    setBooking((current) => (current ? { ...current, status } : current));
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.column}>
          <Banner>{loadError}</Banner>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const dateLabel =
    booking.numberOfDays > 1
      ? `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`
      : formatDate(booking.startDate);

  const showSafetyBanner = threatProfile && (threatProfile.hasKnownThreat || threatProfile.wasAttackedBefore);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>{serviceLabel(booking)}</h1>
            <span className={styles.reference}>{booking.bookingId}</span>
          </div>
          <Badge tone={BOOKING_STATUS_TONE[booking.status]}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
        </div>

        {showSafetyBanner ? (
          <div className={styles.safetyBanner}>
            <p className={styles.safetyBannerTitle}>
              Safety notice — {threatProfile!.threatLevel} risk
            </p>
            {threatProfile!.hasKnownThreat && threatProfile!.threatDescription ? (
              <p>{threatProfile!.threatDescription}</p>
            ) : null}
            {threatProfile!.wasAttackedBefore && threatProfile!.attackDescription ? (
              <p>{threatProfile!.attackDescription}</p>
            ) : null}
          </div>
        ) : null}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Client</h2>
          {booking.clientId ? (
            <>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Name</span>
                <span>{booking.clientId.name}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Phone</span>
                <span>{booking.clientId.phone}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Email</span>
                <span>{booking.clientId.email}</span>
              </div>
            </>
          ) : (
            <p className={styles.clientGone}>This client&apos;s account no longer exists, so their contact details aren&apos;t available.</p>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Schedule</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Date</span>
            <span>{dateLabel}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Time</span>
            <span>
              {booking.startTime}–{booking.endTime}
            </span>
          </div>
          {headcountOf(booking) > 1 ? (
            <div className={styles.row}>
              <span className={styles.rowLabel}>People</span>
              <span>{headcountOf(booking)} each day</span>
            </div>
          ) : null}
          {booking.address ? (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Location</span>
              <span>{booking.address}</span>
            </div>
          ) : null}
          {booking.notes ? (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Notes</span>
              <span>{booking.notes}</span>
            </div>
          ) : null}
        </div>

        {isAgency ? (
          <TeamSection
            booking={booking}
            isVerified={isVerified}
            accessToken={accessToken}
            onAssigned={(ids) =>
              setBooking((current) =>
                current
                  ? {
                      ...current,
                      assignedPersonnel: [
                        ...(current.assignedPersonnel ?? []).map((a) =>
                          a.replacedAt || ids.includes(a.personnelId) ? a : { ...a, replacedAt: new Date().toISOString() },
                        ),
                        ...ids
                          .filter((id) => !(current.assignedPersonnel ?? []).some((a) => !a.replacedAt && a.personnelId === id))
                          .map((personnelId) => ({ personnelId, assignedAt: new Date().toISOString(), replacedAt: null, replacedBy: null })),
                      ],
                    }
                  : current,
              )
            }
          />
        ) : null}

        {booking.status === "pending" && headcountOf(booking) > 1 ? (
          <StaffingCheck
            category={booking.serviceCategory}
            headcount={headcountOf(booking)}
            startDate={booking.startDate}
            endDate={booking.endDate}
            accessToken={accessToken}
          />
        ) : null}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Payment</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Subtotal</span>
            <span>{formatPaise(booking.subtotalAmount)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Platform fee</span>
            <span>{formatPaise(booking.platformFee)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>GST</span>
            <span>{formatPaise(booking.gstAmount)}</span>
          </div>
          <div className={`${styles.row} ${styles.rowTotal}`}>
            <span>Client paid</span>
            <span>{formatPaise(booking.totalAmount)}</span>
          </div>
          {CHAT_ALLOWED_STATUSES.includes(booking.status) ? (
            <PaymentStatusSection bookingId={booking._id} accessToken={accessToken} />
          ) : null}
        </div>

        {CHAT_ALLOWED_STATUSES.includes(booking.status) ? (
          <div className={styles.links}>
            <Link href={`/bookings/${booking._id}/chat`} className={styles.link}>
              Chat with {clientName(booking)}
            </Link>
          </div>
        ) : null}

        {booking.status === "pending" ? (
          <PendingBookingActions
            bookingId={booking._id}
            isVerified={isVerified}
            accessToken={accessToken}
            onUpdated={handleUpdated}
          />
        ) : null}

        {booking.status === "payment_done" || booking.status === "duty_started" ? (
          <DutyControls booking={booking} accessToken={accessToken} onUpdated={handleUpdated} />
        ) : null}

        {booking.status === "duty_ended" ? (
          <CompleteBookingControl bookingId={booking._id} accessToken={accessToken} onUpdated={handleUpdated} />
        ) : null}

        {booking.status === "duty_ended" || booking.status === "completed" ? (
          <ProviderInvoiceSection bookingId={booking._id} accessToken={accessToken} />
        ) : null}

        {booking.status === "duty_started" ? (
          <SosControl bookingId={booking._id} accessToken={accessToken} />
        ) : null}

        {booking.status === "duty_started" || booking.status === "duty_ended" || booking.status === "completed" ? (
          <IncidentsSection bookingId={booking._id} accessToken={accessToken} />
        ) : null}

        {booking.status === "payment_done" || booking.status === "duty_started" ? (
          <AbsenceAlertControl bookingId={booking._id} accessToken={accessToken} />
        ) : null}

        {booking.status === "completed" && booking.clientId ? (
          <RateBookingControl
            bookingId={booking._id}
            clientId={booking.clientId._id}
            clientName={booking.clientId.name}
            accessToken={accessToken}
          />
        ) : null}
      </div>
    </div>
  );
}
