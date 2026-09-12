"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/ui/PageHeader";
import { SETTLEMENT_STATES, SETTLEMENT_STATE_LABELS, type SettlementState } from "@/lib/constants/settlementState";
import { SettlementsList } from "./SettlementsList";
import { BankDetailsSection } from "./BankDetailsSection";
import styles from "./EarningsPanel.module.css";

export function EarningsPanel({ accessToken }: { accessToken: string }) {
  const [stateFilter, setStateFilter] = useState<SettlementState | "">("");

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Earnings"
          intro="Settlements for your completed bookings, including tax withheld and payout timing."
        />

        <BankDetailsSection accessToken={accessToken} />

        <h2 className={styles.sectionTitle}>Settlements</h2>

        <div className={styles.filterRow}>
          <Select
            id="settlementStateFilter"
            label="Status"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as SettlementState | "")}
          >
            <option value="">All</option>
            {SETTLEMENT_STATES.map((state) => (
              <option key={state} value={state}>
                {SETTLEMENT_STATE_LABELS[state]}
              </option>
            ))}
          </Select>
        </div>

        <SettlementsList key={stateFilter} stateFilter={stateFilter} accessToken={accessToken} />
      </div>
    </div>
  );
}
