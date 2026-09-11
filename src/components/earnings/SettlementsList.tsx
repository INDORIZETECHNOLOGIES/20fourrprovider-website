"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { listSettlements, type Settlement } from "@/lib/api/settlements";
import type { Pagination } from "@/lib/api/bookings";
import type { SettlementState } from "@/lib/constants/settlementState";
import { SettlementRow } from "./SettlementRow";
import styles from "./EarningsPanel.module.css";

type SettlementsListProps = {
  stateFilter: SettlementState | "";
  accessToken: string;
};

// Mounted with key={stateFilter} by EarningsPanel, so a filter change remounts
// this component with fresh initial state instead of needing to reset it.
export function SettlementsList({ stateFilter, accessToken }: SettlementsListProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSettlements(accessToken, { state: stateFilter || undefined, page: 1 })
      .then((result) => {
        if (cancelled) return;
        setSettlements(result.settlements);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load settlements. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, stateFilter]);

  async function handleLoadMore() {
    if (!pagination) return;
    setLoadingMore(true);
    try {
      const result = await listSettlements(accessToken, {
        state: stateFilter || undefined,
        page: pagination.page + 1,
      });
      setSettlements((current) => [...current, ...result.settlements]);
      setPagination(result.pagination);
    } catch {
      setError("Couldn't load more settlements.");
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = pagination ? pagination.page < pagination.pages : false;

  return (
    <>
      {error ? <Banner>{error}</Banner> : null}

      {!loading && settlements.length === 0 ? (
        <p className={styles.empty}>No settlements here yet.</p>
      ) : null}

      {settlements.map((settlement) => (
        <SettlementRow key={settlement.bookingId} settlement={settlement} />
      ))}

      {hasMore ? (
        <button type="button" className={styles.loadMore} disabled={loadingMore} onClick={handleLoadMore}>
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </>
  );
}
