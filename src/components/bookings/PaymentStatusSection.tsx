"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { getPaymentStatus, type BookingPaymentStatus } from "@/lib/api/payments";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "@/lib/constants/paymentStatus";
import styles from "./PaymentStatusSection.module.css";

export function PaymentStatusSection({ bookingId, accessToken }: { bookingId: string; accessToken: string }) {
  const [payment, setPayment] = useState<BookingPaymentStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPaymentStatus(bookingId, accessToken)
      .then((result) => {
        if (!cancelled) setPayment(result);
      })
      .catch(() => {
        // No Payment record yet, or it failed to load — the amounts breakdown
        // above already stands on its own, so this row just doesn't render.
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, accessToken]);

  if (!payment) return null;

  return (
    <div className={styles.row}>
      <span className={styles.label}>Payment status</span>
      <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>{PAYMENT_STATUS_LABELS[payment.status]}</Badge>
    </div>
  );
}
