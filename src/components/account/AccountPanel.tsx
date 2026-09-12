"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import {
  exportAccountData,
  requestErasure,
  withdrawConsent,
  type ConsentPurpose,
} from "@/lib/api/account";
import { validateConsentReason, validateErasureReason } from "@/lib/validation/account";
import { formatDate } from "@/lib/format";
import { ProfilePhotoSection } from "./ProfilePhotoSection";
import { EmailVerificationSection } from "./EmailVerificationSection";
import styles from "./AccountPanel.module.css";

const CONSENT_PURPOSES: { value: ConsentPurpose; label: string }[] = [
  { value: "marketing", label: "Marketing communications" },
  { value: "analytics", label: "Usage analytics" },
  { value: "profiling", label: "Personalised recommendations" },
];

export function AccountPanel({ accessToken }: { accessToken: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser(accessToken)
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        // A failed fetch here just means the photo/verification sections don't
        // render — the rest of the account page still works.
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // Data export
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Consent withdrawal
  const [selectedPurposes, setSelectedPurposes] = useState<Set<ConsentPurpose>>(new Set());
  const [consentReason, setConsentReason] = useState("");
  const [consentError, setConsentError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawnAt, setWithdrawnAt] = useState<string | null>(null);

  // Erasure request
  const [erasureReason, setErasureReason] = useState("");
  const [confirmingErasure, setConfirmingErasure] = useState(false);
  const [erasureError, setErasureError] = useState<string | null>(null);
  const [submittingErasure, setSubmittingErasure] = useState(false);
  const [erasureResult, setErasureResult] = useState<{
    expectedCompletionBy: string;
    grievanceContact: string;
  } | null>(null);

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      const data = await exportAccountData(accessToken);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `20fourr-account-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof ApiError ? error.message : "Couldn't export your data. Try again.");
    } finally {
      setExporting(false);
    }
  }

  function togglePurpose(purpose: ConsentPurpose) {
    setSelectedPurposes((current) => {
      const next = new Set(current);
      if (next.has(purpose)) next.delete(purpose);
      else next.add(purpose);
      return next;
    });
  }

  async function handleWithdrawConsent() {
    if (selectedPurposes.size === 0) {
      setConsentError("Select at least one type of communication to stop.");
      return;
    }
    const reasonError = validateConsentReason(consentReason);
    if (reasonError) {
      setConsentError(reasonError);
      return;
    }

    setConsentError(null);
    setWithdrawing(true);
    try {
      const result = await withdrawConsent(
        Array.from(selectedPurposes),
        consentReason.trim() || undefined,
        accessToken,
      );
      setWithdrawnAt(result.withdrawnAt);
      setSelectedPurposes(new Set());
      setConsentReason("");
    } catch (error) {
      setConsentError(error instanceof ApiError ? error.message : "Something went wrong. Try again.");
    } finally {
      setWithdrawing(false);
    }
  }

  async function handleRequestErasure() {
    const reasonError = validateErasureReason(erasureReason);
    if (reasonError) {
      setErasureError(reasonError);
      return;
    }

    setErasureError(null);
    setSubmittingErasure(true);
    try {
      const result = await requestErasure(erasureReason.trim() || undefined, accessToken);
      setErasureResult(result);
      setConfirmingErasure(false);
    } catch (error) {
      setErasureError(error instanceof ApiError ? error.message : "Couldn't submit the request. Try again.");
    } finally {
      setSubmittingErasure(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Account</h1>
        <p className={styles.subtext}>Your data, your consent, and your right to erasure under the DPDP Act.</p>

        {user ? (
          <>
            <ProfilePhotoSection
              user={user}
              accessToken={accessToken}
              onUpdated={(profilePhoto) => setUser((current) => (current ? { ...current, profilePhoto } : current))}
            />
            <EmailVerificationSection
              email={user.email}
              emailVerified={user.emailVerified}
              accessToken={accessToken}
              onVerified={() => setUser((current) => (current ? { ...current, emailVerified: true } : current))}
            />
          </>
        ) : null}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Download your data</h2>
          <p className={styles.sectionText}>
            Get a copy of the personal data we hold about you — profile, bookings, payments, documents,
            and ratings.
          </p>
          {exportError ? <Banner>{exportError}</Banner> : null}
          <Button type="button" disabled={exporting} onClick={handleExport}>
            {exporting ? "Preparing…" : "Download your data"}
          </Button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Communication preferences</h2>
          <p className={styles.sectionText}>Stop receiving communications for any of these purposes.</p>
          {consentError ? <Banner>{consentError}</Banner> : null}
          {CONSENT_PURPOSES.map((purpose) => (
            <label key={purpose.value} className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={selectedPurposes.has(purpose.value)}
                onChange={() => togglePurpose(purpose.value)}
              />
              <span className={styles.checkboxLabel}>{purpose.label}</span>
            </label>
          ))}
          <Textarea
            id="consentReason"
            label="Reason (optional)"
            rows={2}
            value={consentReason}
            onChange={(e) => setConsentReason(e.target.value)}
          />
          <div className={styles.actions}>
            <Button type="button" disabled={withdrawing} onClick={handleWithdrawConsent}>
              {withdrawing ? "Submitting…" : "Stop these communications"}
            </Button>
          </div>
          {withdrawnAt ? (
            <p className={styles.successNote}>Updated on {formatDate(withdrawnAt)}.</p>
          ) : null}
        </div>

        <div className={`${styles.section} ${styles.sectionDanger}`}>
          <h2 className={styles.sectionTitle}>Delete your account</h2>
          <p className={styles.sectionText}>
            Requesting deletion suspends your account immediately and permanently erases your data
            within 30 days, as required by the DPDP Act. This can&apos;t be undone, and isn&apos;t
            possible while you have an active booking.
          </p>
          {erasureError ? <Banner>{erasureError}</Banner> : null}

          {erasureResult ? (
            <p className={styles.successNote}>
              Your account is suspended and your data will be erased by{" "}
              {formatDate(erasureResult.expectedCompletionBy)}. Contact {erasureResult.grievanceContact}{" "}
              with any questions.
            </p>
          ) : !confirmingErasure ? (
            <div className={styles.actions}>
              <button type="button" className={styles.dangerButton} onClick={() => setConfirmingErasure(true)}>
                Request account deletion
              </button>
            </div>
          ) : (
            <>
              <Textarea
                id="erasureReason"
                label="Reason (optional)"
                rows={2}
                value={erasureReason}
                onChange={(e) => setErasureReason(e.target.value)}
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.dangerButtonSolid}
                  disabled={submittingErasure}
                  onClick={handleRequestErasure}
                >
                  {submittingErasure ? "Submitting…" : "Yes, delete my account"}
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  disabled={submittingErasure}
                  onClick={() => setConfirmingErasure(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
