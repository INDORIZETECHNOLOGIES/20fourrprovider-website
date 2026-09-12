"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/constants/bookingStatus";
import { BookingsList } from "./BookingsList";
import styles from "./BookingsPanel.module.css";

type BookingsPanelProps = {
  isVerified: boolean;
  accessToken: string;
};

function statusFromQuery(value: string | null): BookingStatus | "" {
  return value && (BOOKING_STATUSES as readonly string[]).includes(value) ? (value as BookingStatus) : "";
}

export function BookingsPanel({ isVerified, accessToken }: BookingsPanelProps) {
  const searchParams = useSearchParams();
  // Deep links like /bookings?status=pending (the dashboard's stat cards) preselect the filter.
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">(() =>
    statusFromQuery(searchParams.get("status")),
  );

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Bookings</h1>
        <p className={styles.subtext}>Requests from clients, and the bookings you&apos;ve accepted.</p>

        <div className={styles.filterRow}>
          <Select
            id="statusFilter"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")}
          >
            <option value="">All</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {BOOKING_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>

        <BookingsList
          key={statusFilter}
          statusFilter={statusFilter}
          isVerified={isVerified}
          accessToken={accessToken}
        />
      </div>
    </div>
  );
}
