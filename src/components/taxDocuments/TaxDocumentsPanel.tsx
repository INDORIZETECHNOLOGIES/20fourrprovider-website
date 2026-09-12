"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { TAX_DOCUMENT_TYPES, TAX_DOCUMENT_TYPE_LABELS } from "@/lib/constants/taxDocument";
import type { TaxDocumentType } from "@/lib/api/taxDocuments";
import { TaxDocumentsList } from "./TaxDocumentsList";
import styles from "./TaxDocumentsPanel.module.css";

export function TaxDocumentsPanel({ accessToken }: { accessToken: string }) {
  const [docTypeFilter, setDocTypeFilter] = useState<TaxDocumentType | "">("");

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Tax documents</h1>
        <p className={styles.subtext}>
          Invoices and settlement statements issued for your bookings — generated automatically, not
          something you create.
        </p>

        <div className={styles.filterRow}>
          <Select
            id="docTypeFilter"
            label="Document type"
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value as TaxDocumentType | "")}
          >
            <option value="">All</option>
            {TAX_DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {TAX_DOCUMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>

        <TaxDocumentsList key={docTypeFilter} docTypeFilter={docTypeFilter} accessToken={accessToken} />
      </div>
    </div>
  );
}
