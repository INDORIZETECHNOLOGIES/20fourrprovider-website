"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import {
  getTaxDocument,
  downloadTaxDocumentPdf,
  type TaxDocumentHeader,
  type TaxDocumentDetail,
} from "@/lib/api/taxDocuments";
import { TAX_DOCUMENT_TYPE_LABELS, TAX_DOCUMENT_STATUS_LABELS, TAX_DOCUMENT_STATUS_TONE } from "@/lib/constants/taxDocument";
import { formatDate, formatPaise } from "@/lib/format";
import styles from "./TaxDocumentRow.module.css";

export function TaxDocumentRow({ document: doc, accessToken }: { document: TaxDocumentHeader; accessToken: string }) {
  const [detail, setDetail] = useState<TaxDocumentDetail | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (detail) return;

    setLoadingDetail(true);
    setError(null);
    try {
      const result = await getTaxDocument(doc._id, accessToken);
      setDetail(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this document.");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const blob = await downloadTaxDocumentPdf(doc._id, accessToken);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.documentNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't download the PDF. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <span className={styles.number}>{doc.documentNumber}</span>
        <Badge tone={TAX_DOCUMENT_STATUS_TONE[doc.status]}>{TAX_DOCUMENT_STATUS_LABELS[doc.status]}</Badge>
      </div>
      <div className={styles.details}>
        <span>{TAX_DOCUMENT_TYPE_LABELS[doc.docType]}</span>
        <span>{formatDate(doc.issuedAt)}</span>
        <span className={styles.amount}>{formatPaise(doc.totalPaise)}</span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.link} onClick={handleToggle}>
          {expanded ? "Hide details" : "View details"}
        </button>
        <button type="button" className={styles.downloadLink} disabled={downloading} onClick={handleDownload}>
          {downloading ? "Downloading…" : "Download PDF"}
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {expanded ? (
        <div className={styles.detail}>
          {loadingDetail ? null : detail ? (
            <>
              <div className={styles.partyRow}>
                <span className={styles.partyLabel}>From</span>
                <span>{detail.issuer.legalName ?? "—"}</span>
              </div>
              <div className={styles.partyRow}>
                <span className={styles.partyLabel}>To</span>
                <span>{detail.recipient.legalName ?? "—"}</span>
              </div>
              {detail.placeOfSupplyStateCode ? (
                <div className={styles.partyRow}>
                  <span className={styles.partyLabel}>Place of supply</span>
                  <span>{detail.placeOfSupplyStateCode}</span>
                </div>
              ) : null}

              {detail.lineItems.length > 0 ? (
                <>
                  <p className={styles.lineItemsTitle}>Line items</p>
                  {detail.lineItems.map((item, index) => (
                    <div key={index} className={styles.lineItemRow}>
                      <span>{item.description}</span>
                      <span>{formatPaise(item.amountPaise)}</span>
                    </div>
                  ))}
                </>
              ) : null}

              {detail.taxLines.length > 0 ? (
                <>
                  <p className={styles.lineItemsTitle}>Tax</p>
                  {detail.taxLines.map((line, index) => (
                    <div key={index} className={styles.lineItemRow}>
                      <span>{line.label}</span>
                      <span>{formatPaise(line.amountPaise)}</span>
                    </div>
                  ))}
                </>
              ) : null}

              <div className={styles.partyRow}>
                <span className={styles.partyLabel}>Taxable value</span>
                <span>{formatPaise(detail.taxableValuePaise)}</span>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
