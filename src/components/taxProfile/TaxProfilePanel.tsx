"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/Badge";
import { getTaxProfile, type TaxProfile } from "@/lib/api/taxProfile";
import { PAN_STATUS_LABELS, PAN_STATUS_TONE, GSTIN_STATUS_LABELS, GSTIN_STATUS_TONE, BLOCKING_REASON_LABELS } from "@/lib/constants/taxProfile";
import { TaxProfileForm } from "./TaxProfileForm";
import { PsaraCoverageSection } from "./PsaraCoverageSection";
import styles from "./TaxProfilePanel.module.css";

function blockingReasonLabel(reason: string): string {
  return BLOCKING_REASON_LABELS[reason] ?? reason.replace(/_/g, " ");
}

export function TaxProfilePanel({ accessToken }: { accessToken: string }) {
  const [taxProfile, setTaxProfile] = useState<TaxProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTaxProfile(accessToken)
      .then((result) => {
        if (!cancelled) setTaxProfile(result);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your tax profile. Try refreshing.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.column}>
          <Banner>{error}</Banner>
        </div>
      </div>
    );
  }

  if (!taxProfile) return null;

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Tax profile</h1>
        <p className={styles.subtext}>
          Your PAN, GST registration, and PSARA licences — used for tax invoicing and payouts once
          it&apos;s complete.
        </p>

        <div className={styles.section}>
          <div className={styles.summaryRow}>
            {taxProfile.taxProfileComplete ? (
              <Badge tone="active">Complete</Badge>
            ) : (
              <Badge tone="muted">Incomplete</Badge>
            )}
            <span className={styles.rowLabel}>PAN</span>
            <Badge tone={PAN_STATUS_TONE[taxProfile.panVerificationStatus]}>
              {PAN_STATUS_LABELS[taxProfile.panVerificationStatus]}
            </Badge>
            {taxProfile.taxTier === "registered" ? (
              <Badge tone={GSTIN_STATUS_TONE[taxProfile.gstinStatus]}>
                GSTIN: {GSTIN_STATUS_LABELS[taxProfile.gstinStatus]}
              </Badge>
            ) : null}
          </div>
          {taxProfile.blockingReasons.length > 0 ? (
            <ul className={styles.blockingList}>
              {taxProfile.blockingReasons.map((reason) => (
                <li key={reason}>{blockingReasonLabel(reason)}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>PAN &amp; GST</h2>
          <p className={styles.sectionText}>
            PAN is required for every provider. Add a GSTIN only if you&apos;re GST-registered.
          </p>
          <TaxProfileForm taxProfile={taxProfile} accessToken={accessToken} onUpdated={setTaxProfile} />
        </div>

        <PsaraCoverageSection taxProfile={taxProfile} accessToken={accessToken} onUpdated={setTaxProfile} />
      </div>
    </div>
  );
}
