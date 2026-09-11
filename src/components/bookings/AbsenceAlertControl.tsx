"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { raiseAbsenceAlert } from "@/lib/api/bookings";
import { validateAbsenceReason } from "@/lib/validation/protection";
import styles from "./SafetyControls.module.css";

export function AbsenceAlertControl({ bookingId, accessToken }: { bookingId: string; accessToken: string }) {
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ ticketId: string } | null>(null);

  async function handleSubmit() {
    const reasonError = validateAbsenceReason(reason);
    if (reasonError) {
      setError(reasonError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const { ticket } = await raiseAbsenceAlert(bookingId, reason.trim(), accessToken);
      setResult(ticket);
      setConfirming(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit the absence alert. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${styles.section} ${styles.sectionDanger}`}>
      <h2 className={styles.sectionTitle}>Report an absence</h2>
      <p className={styles.sectionText}>
        Use this only if either party failed to show up for this duty. Filing an absence alert
        immediately suspends your account and applies a financial penalty, regardless of who was
        actually absent — this can&apos;t be undone once submitted.
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}

      {result ? (
        <p className={styles.statusNote}>
          Absence alert filed — ticket {result.ticketId}. Your account is suspended pending review.
        </p>
      ) : !confirming ? (
        <button type="button" className={styles.dangerButton} onClick={() => setConfirming(true)}>
          Report an absence
        </button>
      ) : (
        <div className={styles.form}>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="What happened?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className={styles.row}>
            <button
              type="button"
              className={styles.dangerButtonSolid}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting…" : "Yes, file the absence alert — suspend my account"}
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              disabled={submitting}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
