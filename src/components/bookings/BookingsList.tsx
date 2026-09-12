"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowList } from "@/components/ui/RowList";
import { LoadMore } from "@/components/ui/LoadMore";
import { listBookings, type Booking, type Pagination } from "@/lib/api/bookings";
import type { BookingStatus } from "@/lib/constants/bookingStatus";
import { BookingRow } from "./BookingRow";

type BookingsListProps = {
  statusFilter: BookingStatus | "";
  isVerified: boolean;
  accessToken: string;
};

// Mounted with key={statusFilter} by BookingsPanel, so a filter change remounts
// this component with fresh initial state instead of needing to reset it.
export function BookingsList({ statusFilter, isVerified, accessToken }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listBookings(accessToken, { status: statusFilter || undefined, page: 1 })
      .then((result) => {
        if (cancelled) return;
        setBookings(result.bookings);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load bookings. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, statusFilter]);

  async function handleLoadMore() {
    if (!pagination) return;
    setLoadingMore(true);
    try {
      const result = await listBookings(accessToken, {
        status: statusFilter || undefined,
        page: pagination.page + 1,
      });
      setBookings((current) => [...current, ...result.bookings]);
      setPagination(result.pagination);
    } catch {
      setError("Couldn't load more bookings.");
    } finally {
      setLoadingMore(false);
    }
  }

  function handleUpdated(bookingId: string, status: Booking["status"]) {
    setBookings((current) => current.map((b) => (b._id === bookingId ? { ...b, status } : b)));
  }

  const hasMore = pagination ? pagination.page < pagination.pages : false;

  return (
    <>
      {error ? <Banner>{error}</Banner> : null}

      {!loading && bookings.length === 0 ? (
        statusFilter ? (
          <EmptyState icon="clipboard" title="No bookings with this status" body="Try another status, or choose All." />
        ) : (
          <EmptyState
            icon="clipboard"
            title="No bookings yet"
            body="Requests from clients appear here. Clients can only find you while you're marked available."
            action={{ href: "/availability", label: "Check your availability" }}
          />
        )
      ) : null}

      {bookings.length > 0 ? (
        <RowList>
          {bookings.map((booking) => (
            <BookingRow
              key={booking._id}
              booking={booking}
              isVerified={isVerified}
              accessToken={accessToken}
              onUpdated={handleUpdated}
            />
          ))}
        </RowList>
      ) : null}

      {hasMore ? <LoadMore loading={loadingMore} onClick={handleLoadMore} what="bookings" /> : null}
    </>
  );
}
