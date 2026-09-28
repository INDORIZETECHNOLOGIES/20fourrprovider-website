"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { acceptContract, getContract, giveNotice, rejectContract, type Contract } from "@/lib/api/contracts";
import { formatDate, formatPaise } from "@/lib/format";
import {
  CONTRACT_STATUS,
  NOTICE_ALLOWED,
  cycleState,
  formatDay,
  termMonths,
  termTotalPaise,
} from "@/lib/contracts";
import { contractTitle } from "./ContractsList";
import { useLiveVersion } from "@/lib/live/accountEvents";
import styles from "./Contracts.module.css";

const MANDATE_TEXT: Record<Contract["mandate"]["status"], string> = {
  none: "The client pays each month before it starts",
  pending: "Auto-debit is being set up; until then the client pays each month",
  confirmed: "Auto-debit is set up for each month",
  rejected: "The client's auto-debit was refused; they pay each month",
  cancelled: "Auto-debit cancelled",
};

function actionError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === "SC_1534")
      return "You don't have enough staff free for the whole term, or a day you've blocked falls inside it. Check your staff calendar and days off, then accept again.";
    if (err.code === "SC_1494") return "Razorpay hasn't approved your payout account yet, so you can't accept contracts.";
    if (err.code === "SC_1533") return "This contract has changed since you opened it. Refresh to see where it stands.";
    if (err.code === "SC_1539") return "Notice has already been given on this contract.";
    return err.message;
  }
  return "Something went wrong. Try again.";
}

type Pending = "accept" | "reject" | "notice" | null;

export function ContractDetail({ contractId, isVerified, accessToken }: { contractId: string; isVerified: boolean; accessToken: string }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState<"reject" | "notice" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  // Refetch when the server says a contract or one of its months changed (spec 0020).
  const liveVersion = useLiveVersion({ entities: ["contract", "booking", "payment"] });

  useEffect(() => {
    let cancelled = false;
    getContract(contractId, accessToken)
      .then((c) => {
        if (!cancelled) setContract(c);
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(
            err instanceof ApiError && err.code === "SC_1530"
              ? "Contracts aren't open on 20fourr yet."
              : err instanceof ApiError && err.code === "SC_1532"
                ? "This contract doesn't exist, or isn't yours."
                : "Couldn't load this contract.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [contractId, accessToken, liveVersion]);

  async function run(kind: Exclude<Pending, null>) {
    if (!contract) return;
    setBusy(kind);
    setError(null);
    try {
      const next =
        kind === "accept"
          ? await acceptContract(contract._id, accessToken)
          : kind === "reject"
            ? await rejectContract(contract._id, reason.trim() || null, accessToken)
            : await giveNotice(contract._id, reason.trim() || null, accessToken);
      setContract(next);
      setOpen(null);
      setReason("");
    } catch (err) {
      setError(actionError(err));
    } finally {
      setBusy(null);
    }
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.column}>
          <Banner>{loadError}</Banner>
          <p className={styles.back}>
            <Link href="/contracts">All contracts</Link>
          </p>
        </div>
      </div>
    );
  }
  if (!contract) return <div className={styles.skeleton} aria-busy="true" aria-label="Loading contract" />;

  const status = CONTRACT_STATUS[contract.status];
  const months = termMonths(contract);
  const pausedCycle = contract.cycles.find((c) => c.index === contract.suspendedCycleIndex);
  const notice = contract.terminationNotice;
  const canGiveNotice = NOTICE_ALLOWED.includes(contract.status) && !notice;
  const notStarted = contract.status === "accepted";

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <p className={styles.back}>
          <Link href="/contracts">All contracts</Link>
        </p>
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>{contractTitle(contract)}</h1>
            <span className={styles.reference}>{contract.contractId}</span>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        {contract.status === "suspended" ? (
          <div className={styles.notice}>
            <Banner tone="warning">
              <strong>Client payment overdue. Don&apos;t deploy from {pausedCycle ? formatDay(pausedCycle.startDate) : "today"}.</strong>{" "}
              Service is paused until they pay, and you&apos;ll be notified when it resumes. If it stays unpaid, the
              contract ends automatically.
            </Banner>
          </div>
        ) : null}

        {notice ? (
          <div className={styles.notice}>
            <Banner tone="info">
              {notice.by === "provider" ? "You" : notice.by === "client" ? "The client" : "20fourr"} gave notice on{" "}
              {formatDate(notice.givenAt)}. The contract ends on {formatDay(notice.effectiveOn)}, after month{" "}
              {notice.effectiveCycleIndex + 1}.
            </Banner>
          </div>
        ) : null}

        <section className={styles.section} aria-labelledby="terms-title">
          <h2 id="terms-title" className={styles.sectionTitle}>
            Terms
          </h2>
          <dl className={styles.terms}>
            <div>
              <dt>Dates</dt>
              <dd>
                {formatDay(contract.startDate)} – {formatDay(contract.endDate)} · {months} {months === 1 ? "month" : "months"}
              </dd>
            </div>
            <div>
              <dt>Shift</dt>
              <dd>
                {contract.dailyStartTime}–{contract.dailyEndTime}, every day
              </dd>
            </div>
            <div>
              <dt>People</dt>
              <dd>{contract.headcount} each day</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>
                {[contract.deployment.addressLine, contract.deployment.city, contract.deployment.pincode].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{MANDATE_TEXT[contract.mandate.status]}</dd>
            </div>
            <div>
              <dt>Your price</dt>
              <dd>
                <span className={styles.total}>{formatPaise(termTotalPaise(contract))}</span> over the term, before GST
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="months-title">
          <h2 id="months-title" className={styles.sectionTitle}>
            Months
          </h2>
          <p className={styles.sectionText}>
            Each month is its own booking. It starts and ends on its own, with no daily codes, except the very first start,
            which uses the client&apos;s code at handover. Upload one invoice per month once it ends.
          </p>
          <ol className={styles.cycles}>
            {contract.cycles.map((cycle) => {
              const state = cycleState(cycle, contract);
              const body = (
                <>
                  <span className={styles.cycleIndex}>{cycle.index + 1}</span>
                  <span className={styles.cycleMain}>
                    <span className={styles.cycleDates}>
                      {formatDay(cycle.startDate)} – {formatDay(cycle.endDate)}
                    </span>
                    <span className={styles.cycleDays}>{cycle.days} days</span>
                  </span>
                  <span className={styles.cycleAmount}>{formatPaise(cycle.providerPreGstPaise)}</span>
                  {contract.status !== "requested" ? (
                    <span className={styles.cycleState}>
                      <Badge tone={state.tone}>{state.label}</Badge>
                    </span>
                  ) : null}
                </>
              );
              return (
                <li key={cycle.index}>
                  {cycle.bookingId ? (
                    <Link href={`/bookings/${cycle.bookingId}`} className={`${styles.cycle} ${styles.cycleLink} ${contract.status === "requested" ? styles.cycleNoState : ""}`} aria-label={`Month ${cycle.index + 1}: ${state.label}. Open its booking`}>
                      {body}
                    </Link>
                  ) : (
                    <div className={`${styles.cycle} ${contract.status === "requested" ? styles.cycleNoState : ""}`}>{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        {contract.status === "requested" ? (
          <div className={styles.actions}>
            {open === "reject" ? (
              <div className={styles.inlineForm}>
                <label htmlFor="reject-reason" className={styles.inlineLabel}>
                  Reason for declining (optional)
                </label>
                <input id="reject-reason" className={styles.input} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className={styles.buttons}>
                  <button type="button" className={styles.primary} disabled={busy !== null} onClick={() => run("reject")}>
                    {busy === "reject" ? "Declining…" : "Decline contract"}
                  </button>
                  <button type="button" className={styles.quiet} disabled={busy !== null} onClick={() => setOpen(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.buttons}>
                {isVerified ? (
                  <button type="button" className={styles.primary} disabled={busy !== null} onClick={() => run("accept")}>
                    {busy === "accept" ? "Accepting…" : "Accept contract"}
                  </button>
                ) : (
                  <span className={styles.gate}>
                    Complete <Link href="/documents">verification</Link> to accept contracts.
                  </span>
                )}
                <button type="button" className={styles.secondary} disabled={busy !== null} onClick={() => setOpen("reject")}>
                  Decline
                </button>
              </div>
            )}
            <p className={styles.fine}>
              Accepting holds {contract.headcount === 1 ? "one person" : `${contract.headcount} people`} for every day of the term.
            </p>
          </div>
        ) : null}

        {canGiveNotice ? (
          <div className={styles.actions}>
            {open === "notice" ? (
              <div className={styles.inlineForm}>
                <p className={styles.sectionText}>
                  {notStarted
                    ? "The contract hasn't started, so this cancels it now. Nothing has been paid for it yet."
                    : "The contract ends at the end of the month in which the notice period runs out. You'll see the date here once it's given."}
                </p>
                <label htmlFor="notice-reason" className={styles.inlineLabel}>
                  Reason (optional)
                </label>
                <input id="notice-reason" className={styles.input} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className={styles.buttons}>
                  <button type="button" className={styles.danger} disabled={busy !== null} onClick={() => run("notice")}>
                    {busy === "notice" ? "Sending…" : notStarted ? "Cancel contract" : "Give notice"}
                  </button>
                  <button type="button" className={styles.quiet} disabled={busy !== null} onClick={() => setOpen(null)}>
                    Keep contract
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className={styles.quiet} onClick={() => setOpen("notice")}>
                {notStarted ? "Cancel before it starts" : "Give notice to end this contract"}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
