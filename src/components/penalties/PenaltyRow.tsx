"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { appealPenalty, type Penalty } from "@/lib/api/penalties";
import {
  APPEAL_STATUS_LABELS,
  OFFENSE_LEVEL_LABELS,
  PENALTY_STATUS_LABELS,
  PENALTY_STATUS_TONE,
  PENALTY_TYPE_LABELS,
} from "@/lib/constants/penalty";
import { formatDate, formatPaise } from "@/lib/format";
import { APPEAL_REASON_MAX, canAppeal, validateAppealReason } from "@/lib/validation/penalties";
import styles from "./Penalties.module.css";

export function PenaltyRow({
  penalty,
  accessToken,
  onAppealed,
}: {
  penalty: Penalty;
  accessToken: string;
  onAppealed: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const appeal = penalty.appeal?.appealed ? penalty.appeal : null;
  const suspension = penalty.suspensionDays
    ? `${penalty.suspensionDays}-day suspension${penalty.suspensionUntil ? ` until ${formatDate(penalty.suspensionUntil)}` : ""}`
    : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const invalid = validateAppealReason(reason);
    setFieldError(invalid);
    if (invalid) return;

    setError(null);
    setSubmitting(true);
    try {
      await appealPenalty(penalty._id, reason.trim(), accessToken);
      onAppealed(penalty._id);
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send your appeal. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.type}>{PENALTY_TYPE_LABELS[penalty.type] ?? "Penalty"}</p>
          <p className={styles.meta}>
            {formatDate(penalty.reportedAt || penalty.createdAt)} · {OFFENSE_LEVEL_LABELS[penalty.offenseLevel]}
            {suspension ? ` · ${suspension}` : ""}
          </p>
        </div>
        <div className={styles.amountCol}>
          <span className={styles.amount}>{formatPaise(penalty.amount)}</span>
          <Badge tone={PENALTY_STATUS_TONE[penalty.status]}>{PENALTY_STATUS_LABELS[penalty.status]}</Badge>
        </div>
      </div>

      <p className={styles.description}>{penalty.description}</p>

      {penalty.bookingId ? (
        <p className={styles.note}>
          For{" "}
          <Link href={`/bookings/${penalty.bookingId}`} className={styles.bookingLink}>
            this booking
          </Link>
          .
        </p>
      ) : null}

      {penalty.status === "waived" && penalty.waiverReason ? (
        <p className={styles.note}>
          <span className={styles.noteLabel}>Waived{penalty.waivedAt ? ` on ${formatDate(penalty.waivedAt)}` : ""}: </span>
          {penalty.waiverReason}
        </p>
      ) : null}

      {appeal ? (
        <p className={styles.note}>
          <span className={styles.noteLabel}>
            {appeal.appealStatus ? APPEAL_STATUS_LABELS[appeal.appealStatus] : "Appealed"}
            {appeal.appealedAt ? ` · sent ${formatDate(appeal.appealedAt)}` : ""}
          </span>
          {appeal.appealReason ? <> — “{appeal.appealReason}”</> : null}
          {appeal.appealStatus && appeal.appealStatus !== "pending" && appeal.appealReviewReason ? (
            <>
              <br />
              <span className={styles.noteLabel}>Our reply: </span>
              {appeal.appealReviewReason}
            </>
          ) : null}
        </p>
      ) : null}

      {canAppeal(penalty) ? (
        <div className={styles.actions}>
          {open ? (
            <form onSubmit={handleSubmit} noValidate className={styles.appealForm}>
              {error ? <Banner>{error}</Banner> : null}
              <Textarea
                id={`appeal-${penalty._id}`}
                label="Why should this be reviewed?"
                className={styles.textarea}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                error={fieldError}
                placeholder="What happened, and anything that shows this penalty was applied by mistake."
              />
              <p className={styles.counter}>
                {reason.length}/{APPEAL_REASON_MAX}
              </p>
              <div className={styles.formActions}>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Send appeal"}
                </Button>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={submitting}
                  onClick={() => {
                    setOpen(false);
                    setFieldError(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
              <p className={styles.note} style={{ margin: 0 }}>
                You can appeal a penalty once, so include everything the reviewer needs.
              </p>
            </form>
          ) : (
            <button type="button" className={styles.appealButton} onClick={() => setOpen(true)}>
              Appeal this penalty
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
