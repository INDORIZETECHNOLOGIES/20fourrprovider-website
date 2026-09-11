"use client";

import { useState } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { TICKET_STATUSES, TICKET_STATUS_LABELS, type TicketStatus } from "@/lib/constants/ticket";
import { TicketsList } from "./TicketsList";
import styles from "./TicketsPanel.module.css";

export function TicketsPanel({ accessToken }: { accessToken: string }) {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <div className={styles.headingRow}>
          <div>
            <h1 className={styles.heading}>Support</h1>
            <p className={styles.subtext}>Raise an issue and track its progress.</p>
          </div>
          <Link href="/tickets/new" className={styles.newButton}>
            New ticket
          </Link>
        </div>

        <div className={styles.filterRow}>
          <Select
            id="ticketStatusFilter"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "")}
          >
            <option value="">All</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TICKET_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>

        <TicketsList key={statusFilter} statusFilter={statusFilter} accessToken={accessToken} />
      </div>
    </main>
  );
}
