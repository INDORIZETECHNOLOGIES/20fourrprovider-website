"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadMore } from "@/components/ui/LoadMore";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { listPenalties, type Penalty } from "@/lib/api/penalties";
import { formatDate, formatPaise } from "@/lib/format";
import { PenaltyRow } from "./PenaltyRow";
import styles from "./Penalties.module.css";

const PAGE_SIZE = 20;

export function PenaltiesPanel({ accessToken }: { accessToken: string }) {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Read once on mount; a suspension date is compared against "now" only for display.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    listPenalties(accessToken, { page: 1, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setPenalties(result.penalties);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your penalties. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const result = await listPenalties(accessToken, { page: page + 1, limit: PAGE_SIZE });
      setPenalties((current) => [...current, ...result.penalties]);
      setPage(result.page);
      setTotal(result.total);
    } catch {
      setError("Couldn't load more penalties.");
    } finally {
      setLoadingMore(false);
    }
  }

  // The appeal is recorded server-side; mirror it here without a refetch.
  function markAppealed(id: string) {
    setPenalties((current) =>
      current.map((p) =>
        p._id === id
          ? { ...p, status: "appealed", appeal: { ...p.appeal, appealed: true, appealStatus: "pending", appealedAt: new Date().toISOString() } }
          : p,
      ),
    );
  }

  const hasMore = penalties.length < total;

  // The totals are only honest once every penalty is loaded.
  const sum = (status: Penalty["status"]) =>
    penalties.filter((p) => p.status === status).reduce((acc, p) => acc + p.amount, 0);
  const inReview = penalties.filter((p) => p.status === "appealed").length;

  const suspendedUntil = penalties
    .filter((p) => p.status !== "waived" && p.suspensionUntil && new Date(p.suspensionUntil).getTime() > now)
    .map((p) => p.suspensionUntil as string)
    .sort()
    .pop();

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Penalties"
          intro="Charges applied for missed, late or unplanned duty. If one was applied by mistake, you can appeal it once."
        />

        {error ? <Banner>{error}</Banner> : null}

        {suspendedUntil ? (
          <Banner>A penalty on your account includes a suspension until {formatDate(suspendedUntil)}.</Banner>
        ) : null}

        {!loading && penalties.length === 0 && !error ? (
          <EmptyState
            icon="shield-check"
            title="No penalties"
            body="Nothing has been charged to your account. If that changes, each penalty appears here with the reason and a way to appeal."
          />
        ) : null}

        {penalties.length > 0 && !hasMore ? (
          <div className={styles.ledger}>
            <div className={styles.ledgerCell}>
              <p className={styles.ledgerLabel}>Not yet deducted</p>
              <p className={styles.ledgerValue}>{formatPaise(sum("pending"))}</p>
            </div>
            <div className={styles.ledgerCell}>
              <p className={styles.ledgerLabel}>Deducted so far</p>
              <p className={styles.ledgerValue}>{formatPaise(sum("deducted"))}</p>
            </div>
            <div className={styles.ledgerCell}>
              <p className={styles.ledgerLabel}>Appeals in review</p>
              <p className={styles.ledgerValue}>{inReview}</p>
            </div>
          </div>
        ) : null}

        {penalties.length > 0 ? (
          <RowList>
            {penalties.map((penalty) => (
              <PenaltyRow key={penalty._id} penalty={penalty} accessToken={accessToken} onAppealed={markAppealed} />
            ))}
          </RowList>
        ) : null}

        {hasMore ? <LoadMore loading={loadingMore} onClick={handleLoadMore} what="penalties" /> : null}
      </div>
    </div>
  );
}
