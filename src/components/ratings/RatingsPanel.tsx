"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
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

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Your ratings</h1>
        <p className={styles.subtext}>What clients have said after a completed booking.</p>

        {error ? <Banner>{error}</Banner> : null}

        {summary ? (
          <div className={styles.summary}>
            <span className={styles.summaryAverage}>{summary.count > 0 ? summary.average.toFixed(1) : "—"}</span>
            <div>
              <div className={styles.summaryStars}>
                {summary.count > 0
                  ? "★".repeat(Math.round(summary.average)) + "☆".repeat(5 - Math.round(summary.average))
                  : "☆☆☆☆☆"}
              </div>
              <span className={styles.summaryCount}>
                {summary.count} {summary.count === 1 ? "rating" : "ratings"}
              </span>
            </div>
          </div>
        ) : null}

        {!loading && ratings.length === 0 ? (
          <p className={styles.empty}>No ratings yet — they&apos;ll show up here after clients rate a completed booking.</p>
        ) : null}

        {ratings.map((rating) => (
          <RatingRow key={rating._id} rating={rating} />
        ))}

        {hasMore ? (
          <button type="button" className={styles.loadMore} disabled={loadingMore} onClick={handleLoadMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        ) : null}
      </div>
    </main>
  );
}
