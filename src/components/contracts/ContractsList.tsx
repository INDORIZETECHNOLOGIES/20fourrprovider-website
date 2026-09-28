"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { ApiError } from "@/lib/api/client";
import { listContracts, type Contract } from "@/lib/api/contracts";
import { SERVICE_CATEGORY_LABELS } from "@/lib/api/provider";
import { formatPaise } from "@/lib/format";
import { CONTRACT_STATUS, CONTRACT_TAB, formatDay, termMonths, type ContractTab } from "@/lib/contracts";
import { useLiveVersion } from "@/lib/live/accountEvents";
import styles from "./Contracts.module.css";

const TABS: Array<{ key: ContractTab; label: string; empty: string }> = [
  { key: "requests", label: "Requests", empty: "No contract requests waiting for you." },
  { key: "active", label: "Active", empty: "No contracts running or about to start." },
  { key: "ended", label: "Ended", empty: "Nothing here yet." },
];

export const contractTitle = (c: Pick<Contract, "headcount" | "serviceCategory">) =>
  `${c.headcount > 1 ? `${c.headcount} × ` : ""}${SERVICE_CATEGORY_LABELS[c.serviceCategory]}`;

export function ContractsList({ accessToken }: { accessToken: string }) {
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [tab, setTab] = useState<ContractTab | null>(null);

  // Refetch when the server says a contract or one of its months changed (spec 0020).
  const liveVersion = useLiveVersion({ entities: ["contract", "booking", "payment"] });

  useEffect(() => {
    let cancelled = false;
    listContracts(accessToken)
      .then(({ contracts }) => {
        if (!cancelled) setContracts(contracts);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === "SC_1530") setDisabled(true);
        else setError("Couldn't load your contracts. Refresh to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, liveVersion]);

  const grouped = useMemo(() => {
    const g: Record<ContractTab, Contract[]> = { requests: [], active: [], ended: [] };
    for (const c of contracts ?? []) g[CONTRACT_TAB[c.status]].push(c);
    return g;
  }, [contracts]);

  // Open on requests when there are any: they're the ones waiting on the provider.
  const current: ContractTab = tab ?? (grouped.requests.length > 0 ? "requests" : "active");
  const shown = grouped[current];

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Contracts"
          intro="Long-term work billed month by month. Each month is its own booking: the client pays before it starts, and you upload one invoice when it ends."
        />

        {error ? <Banner>{error}</Banner> : null}

        {disabled ? (
          <EmptyState
            icon="clipboard"
            title="Contracts aren't open yet"
            body="Month-by-month contracts are coming to 20fourr. Until then, clients book you one booking at a time."
          />
        ) : null}

        {!contracts && !error && !disabled ? <div className={styles.skeleton} aria-busy="true" aria-label="Loading contracts" /> : null}

        {contracts ? (
          <>
            <div className={styles.tabs} role="tablist" aria-label="Contracts">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={current === t.key}
                  className={`${styles.tab} ${current === t.key ? styles.tabActive : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  <span className={styles.tabCount}>{grouped[t.key].length}</span>
                </button>
              ))}
            </div>

            {shown.length === 0 ? (
              <p className={styles.empty}>{TABS.find((t) => t.key === current)!.empty}</p>
            ) : (
              <RowList>
                {shown.map((c) => {
                  const status = CONTRACT_STATUS[c.status];
                  const place = [c.deployment.addressLine, c.deployment.city].filter(Boolean).join(", ");
                  const months = termMonths(c);
                  return (
                    <Link key={c._id} href={`/contracts/${c._id}`} className={styles.row}>
                      <span className={styles.rowMain}>
                        <span className={styles.rowTitle}>{contractTitle(c)}</span>
                        <span className={styles.rowMeta}>
                          {formatDay(c.startDate)} – {formatDay(c.endDate)} · {months} {months === 1 ? "month" : "months"}
                        </span>
                        {place ? <span className={styles.rowMeta}>{place}</span> : null}
                      </span>
                      <span className={styles.rowSide}>
                        {c.cycles[0] ? (
                          <span className={styles.rowAmount}>
                            {formatPaise(c.cycles[0].providerPreGstPaise)}
                            <span className={styles.rowPer}> / month</span>
                          </span>
                        ) : null}
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </span>
                      <Icon name="arrow-right" size={16} className={styles.rowArrow} />
                    </Link>
                  );
                })}
              </RowList>
            )}
            {shown.length > 0 ? <p className={styles.footnote}>Amounts are your price before GST, for all people on the contract.</p> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
