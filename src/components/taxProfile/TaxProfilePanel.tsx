"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
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
        <PageHeader
          title="Tax profile"
          intro="Your PAN, GST registration and PSARA licences. Invoicing and payouts wait on this being complete."
        />

        {/* The state is said once, in the heading — the badges that follow carry
            the per-field status, rather than four badges in a row saying
            overlapping things. */}
        <section className={styles.status}>
          <h2 className={styles.statusTitle}>
            {taxProfile.taxProfileComplete
              ? "Your tax profile is complete"
              : "Your tax profile is incomplete"}
          </h2>

          <dl className={styles.statusRows}>
            <div className={styles.statusRow}>
              <dt className={styles.statusLabel}>PAN</dt>
              <dd className={styles.statusValue}>
                <Badge tone={PAN_STATUS_TONE[taxProfile.panVerificationStatus]}>
                  {PAN_STATUS_LABELS[taxProfile.panVerificationStatus]}
                </Badge>
              </dd>
            </div>

            {taxProfile.taxTier === "registered" ? (
              <div className={styles.statusRow}>
                <dt className={styles.statusLabel}>GSTIN</dt>
                <dd className={styles.statusValue}>
                  <Badge tone={GSTIN_STATUS_TONE[taxProfile.gstinStatus]}>
                    {GSTIN_STATUS_LABELS[taxProfile.gstinStatus]}
                  </Badge>
                </dd>
              </div>
            ) : null}
          </dl>

          {taxProfile.blockingReasons.length > 0 ? (
            <>
              <p className={styles.blockingTitle}>Still outstanding</p>
              <ul className={styles.blockingList}>
                {taxProfile.blockingReasons.map((reason) => (
                  <li key={reason}>{blockingReasonLabel(reason)}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

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
