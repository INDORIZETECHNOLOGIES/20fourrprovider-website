"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowList } from "@/components/ui/RowList";
import { LoadMore } from "@/components/ui/LoadMore";
import { listTickets, type Ticket } from "@/lib/api/tickets";
import type { Pagination } from "@/lib/api/bookings";
import type { TicketStatus } from "@/lib/constants/ticket";
import { TicketRow } from "./TicketRow";

type TicketsListProps = {
  statusFilter: TicketStatus | "";
  accessToken: string;
};

// Mounted with key={statusFilter} by TicketsPanel, so a filter change remounts
// this component with fresh initial state instead of needing to reset it.
export function TicketsList({ statusFilter, accessToken }: TicketsListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listTickets(accessToken, { status: statusFilter || undefined, page: 1 })
      .then((result) => {
        if (cancelled) return;
        setTickets(result.tickets);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load tickets. Try refreshing.");
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
      const result = await listTickets(accessToken, {
        status: statusFilter || undefined,
        page: pagination.page + 1,
      });
      setTickets((current) => [...current, ...result.tickets]);
      setPagination(result.pagination);
    } catch {
      setError("Couldn't load more tickets.");
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = pagination ? pagination.page < pagination.pages : false;

  return (
    <>
      {error ? <Banner>{error}</Banner> : null}

      {!loading && tickets.length === 0 ? (
        statusFilter ? (
          <EmptyState icon="chat" title="No tickets with this status" body="Try another status, or choose All." />
        ) : (
          <EmptyState
            icon="chat"
            title="No support tickets"
            body="If something goes wrong on a booking or with a payout, open a new ticket and we'll follow up here."
          />
        )
      ) : null}

      {tickets.length > 0 ? (
        <RowList>
          {tickets.map((ticket) => (
            <TicketRow key={ticket._id} ticket={ticket} />
          ))}
        </RowList>
      ) : null}

      {hasMore ? <LoadMore loading={loadingMore} onClick={handleLoadMore} what="tickets" /> : null}
    </>
  );
}
