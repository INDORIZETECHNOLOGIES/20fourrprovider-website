"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { LoadMore } from "@/components/ui/LoadMore";
import { Stars } from "@/components/ui/Stars";
import { getProviderProfile } from "@/lib/api/provider";
import { getRatingsForUser, type Rating, type Pagination } from "@/lib/api/ratings";
import { RatingRow } from "./RatingRow";
import styles from "./RatingsPanel.module.css";

export function RatingsPanel({ accessToken }: { accessToken: string }) {
  const [summary, setSummary] = useState<{ average: number; count: number } | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProviderProfile(accessToken)
      .then(({ profile }) => {
        if (cancelled) return;
        setSummary(profile.rating);
        setUserId(profile.userId._id);
        return getRatingsForUser(profile.userId._id, accessToken, { page: 1 });
      })
      .then((result) => {
        if (cancelled || !result) return;
        setRatings(result.ratings);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your ratings. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function handleLoadMore() {
    if (!pagination || !userId) return;
    setLoadingMore(true);
    try {
      const result = await getRatingsForUser(userId, accessToken, { page: pagination.page + 1 });
      setRatings((current) => [...current, ...result.ratings]);
      setPagination(result.pagination);
    } catch {
      setError("Couldn't load more ratings.");
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = pagination ? pagination.page < pagination.pages : false;
  const rated = summary !== null && summary.count > 0;

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Your ratings"
          intro="What clients have said after a completed booking. Your average is shown to clients browsing for a provider."
        />

        {error ? <Banner>{error}</Banner> : null}

        {/* With no ratings the empty state below already says so — a summary
            block of dashes and hollow stars would just say it twice. */}
        {summary && rated ? (
          <div className={styles.summary}>
            <p className={styles.summaryAverage}>{summary.average.toFixed(1)}</p>
            <div>
              <Stars value={summary.average} size={18} />
              <p className={styles.summaryCount}>
                {summary.count} {summary.count === 1 ? "rating" : "ratings"} from clients
              </p>
            </div>
          </div>
        ) : null}

        {!loading && ratings.length === 0 ? (
          <EmptyState icon="star" title="No ratings yet" body="Clients can rate you once a booking is completed." />
        ) : null}

        {ratings.length > 0 ? (
          <RowList>
            {ratings.map((rating) => (
              <RatingRow key={rating._id} rating={rating} />
            ))}
          </RowList>
        ) : null}

        {hasMore ? <LoadMore loading={loadingMore} onClick={handleLoadMore} what="ratings" /> : null}
      </div>
    </div>
  );
}
