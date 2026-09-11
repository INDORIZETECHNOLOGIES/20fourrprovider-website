"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getMyRatingStatus, submitRating } from "@/lib/api/ratings";
import { validateReview } from "@/lib/validation/ratings";
import {
  POSITIVE_RATING_TAGS,
  NEGATIVE_RATING_TAGS,
  RATING_TAG_LABELS,
  type RatingTag,
} from "@/lib/constants/rating";
import styles from "./RateBookingControl.module.css";

type Props = {
  bookingId: string;
  clientId: string;
  clientName: string;
  accessToken: string;
};

type Status = "loading" | "pending" | "already-rated" | "submitted";

export function RateBookingControl({ bookingId, clientId, clientName, accessToken }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<RatingTag[]>([]);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyRatingStatus(accessToken)
      .then(({ pendingRatings }) => {
        if (cancelled) return;
        setStatus(pendingRatings.some((booking) => booking._id === bookingId) ? "pending" : "already-rated");
      })
      .catch(() => {
        // An uncertain state shouldn't nag — fail closed rather than show a form
        // that might fail with SC_1002 (already rated) on submit.
        if (!cancelled) setStatus("already-rated");
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, accessToken]);

  function toggleTag(tag: RatingTag) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : current.length < 10
          ? [...current, tag]
          : current,
    );
  }

  async function handleSubmit() {
    if (rating < 1) {
      setError("Choose a star rating.");
      return;
    }
    const reviewError = validateReview(review);
    if (reviewError) {
      setError(reviewError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await submitRating(
        {
          bookingId,
          toUserId: clientId,
          rating,
          review: review.trim() || undefined,
          tags: selectedTags.length ? selectedTags : undefined,
        },
        accessToken,
      );
      setStatus("submitted");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your rating. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Rate {clientName}</h2>

      {status === "already-rated" ? (
        <p className={styles.statusNote}>You&apos;ve already rated this booking.</p>
      ) : status === "submitted" ? (
        <p className={styles.statusNote}>Thanks — your rating has been submitted.</p>
      ) : (
        <>
          <p className={styles.sectionText}>How was working with this client?</p>

          <div className={styles.stars} role="radiogroup" aria-label="Rating out of 5 stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                className={styles.star}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
              >
                {(hoverRating || rating) >= value ? "★" : "☆"}
              </button>
            ))}
          </div>

          <div className={styles.tags}>
            {[...POSITIVE_RATING_TAGS, ...NEGATIVE_RATING_TAGS].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`${styles.tag} ${selectedTags.includes(tag) ? styles.tagSelected : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {RATING_TAG_LABELS[tag]}
              </button>
            ))}
          </div>

          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Add a note (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={500}
          />

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="button" className={styles.submitButton} disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting…" : "Submit rating"}
          </button>
        </>
      )}
    </div>
  );
}
