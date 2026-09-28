"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { getPerformance, type Performance, type PerformanceComponent } from "@/lib/api/performance";
import { formatDate } from "@/lib/format";
import { PERFORMANCE_LABELS, headline, orderComponents, summarize } from "@/lib/performance";
import { ImportanceMark } from "./ImportanceMark";
import styles from "./Performance.module.css";

const STATUS_BADGE: Record<PerformanceComponent["status"], { tone: "active" | "action" | "muted"; label: string }> = {
  good: { tone: "active", label: "Good" },
  needs_attention: { tone: "action", label: "Needs attention" },
  not_enough_data: { tone: "muted", label: "Not enough data" },
};

export function PerformancePanel({ accessToken }: { accessToken: string }) {
  const [data, setData] = useState<Performance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPerformance(accessToken)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your performance. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, attempt]);

  const summary = data ? summarize(data.components) : null;

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="How clients find you"
          intro="When clients search your city, providers who turn up, finish what they accept and answer quickly are shown first. Ratings count, but they're one signal of six. Everything here covers recent work, and older jobs count for less."
        />

        {error ? (
          <Banner>
            {error}{" "}
            <button type="button" className={styles.inlineLink} onClick={() => setAttempt((n) => n + 1)}>
              Retry
            </button>
          </Banner>
        ) : null}

        {!data && !error ? <div className={styles.skeleton} aria-busy="true" aria-label="Loading your performance" /> : null}

        {data && summary ? (
          <>
            <div className={styles.summary}>
              <p className={styles.headline}>{headline(summary)}</p>
              {data.computedAt ? <p className={styles.updated}>Updated {formatDate(data.computedAt)}</p> : null}
            </div>

            {data.newProviderBoost ? (
              <div className={styles.notice}>
                <Banner tone="info">
                  You&apos;re new, so you&apos;re shown at least as high as a typical provider while you build a record.
                  That ends after your first few completed jobs.
                </Banner>
              </div>
            ) : null}

            <RowList>
              {orderComponents(data.components).map((component) => {
                const label = PERFORMANCE_LABELS[component.key];
                const badge = STATUS_BADGE[component.status];
                return (
                  <div key={component.key} className={styles.row}>
                    <ImportanceMark level={component.importance} />
                    <div className={styles.rowText}>
                      <h2 className={styles.rowName}>{label.name}</h2>
                      <p className={styles.rowMeasures}>{label.measures}</p>
                      <p className={styles.rowDetail}>{component.detail}</p>
                      {component.tip ? (
                        <p className={styles.tip}>
                          <span className={styles.tipLead}>What helps: </span>
                          {component.tip}
                        </p>
                      ) : null}
                    </div>
                    <div className={styles.rowStatus}>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </RowList>

            <p className={styles.footnote}>
              The bars show how much each signal weighs in search. Reviews from clients are under{" "}
              <Link href="/ratings" className={styles.inlineLink}>
                Ratings
              </Link>
              .
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
