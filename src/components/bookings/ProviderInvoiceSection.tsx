"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import {
  getProviderInvoice,
  uploadProviderInvoice,
  type ProviderInvoiceView,
} from "@/lib/api/providerInvoice";
import { formatDate, formatPaiseExact } from "@/lib/format";
import {
  rupeesToPaise,
  validateInvoiceDate,
  validateInvoiceFile,
  validateInvoiceNumber,
  validateInvoiceTotal,
} from "@/lib/validation/providerInvoice";
import styles from "./ProviderInvoiceSection.module.css";

type Props = {
  bookingId: string;
  accessToken: string;
};

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * The provider's own invoice to the client (v6 bookings, after the end-of-duty OTP).
 *
 * 20fourr invoices the client for its platform fee; the provider invoices the client for the
 * service. This section tells the provider exactly what their invoice must say — who it's
 * addressed to and the amounts from the booking quote — and takes the upload. The payout is
 * held until it's on file.
 *
 * Renders nothing for a v1 booking: the endpoint refuses those with SC_1446.
 */
export function ProviderInvoiceSection({ bookingId, accessToken }: Props) {
  const [view, setView] = useState<ProviderInvoiceView | null>(null);
  const [hidden, setHidden] = useState(false);
  const [editing, setEditing] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayIso);
  const [total, setTotal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProviderInvoice(bookingId, accessToken)
      .then((data) => {
        if (cancelled) return;
        setView(data);
        setTotal((data.expected.totalPaise / 100).toFixed(2));
      })
      .catch(() => {
        // v1 booking (SC_1446) or a transient failure — the rest of the page still works.
        if (!cancelled) setHidden(true);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, accessToken]);

  if (hidden || !view) return null;

  const { expected, billTo, providerInvoice } = view;
  const isTaxInvoice = expected.documentKind === "tax_invoice";
  const showForm = view.canUpload && (!providerInvoice || editing);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const problem =
      validateInvoiceFile(file) ??
      validateInvoiceNumber(invoiceNumber) ??
      validateInvoiceDate(invoiceDate) ??
      validateInvoiceTotal(total, expected.totalPaise);
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const updated = await uploadProviderInvoice(
        bookingId,
        {
          file: file!,
          invoiceNumber: invoiceNumber.trim(),
          invoiceDate,
          totalPaise: rupeesToPaise(total)!,
        },
        accessToken,
      );
      setView(updated);
      setEditing(false);
      setFile(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't upload the invoice. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Your invoice to the client</h2>
        {providerInvoice ? (
          <Badge tone="active">Uploaded</Badge>
        ) : view.canUpload ? (
          <Badge tone="action">Needed</Badge>
        ) : null}
      </div>

      {providerInvoice ? (
        <>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Invoice number</span>
            <span>{providerInvoice.invoiceNumber}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Invoice date</span>
            <span>{formatDate(providerInvoice.invoiceDate)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Total</span>
            <span>{formatPaiseExact(providerInvoice.totalPaise)}</span>
          </div>
          <div className={styles.actions}>
            {providerInvoice.fileUrl ? (
              <a href={providerInvoice.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                View uploaded invoice
              </a>
            ) : null}
            {view.canUpload && !editing ? (
              <button type="button" className={styles.linkButton} onClick={() => setEditing(true)}>
                Replace
              </button>
            ) : null}
          </div>
          <p className={styles.note}>
            The client can download this alongside 20fourr&apos;s platform fee invoice.
            {view.canUpload ? " You can replace it until your payout is released." : null}
          </p>
        </>
      ) : (
        <p className={styles.sectionText}>
          Issue your own {isTaxInvoice ? "tax invoice" : "bill of supply"} to the client for this
          booking and upload it here. 20fourr invoices the client separately for its platform fee, so
          leave that out of yours.
          {view.payoutHeldForInvoice ? (
            <strong className={styles.held}> Your payout is on hold until you upload it.</strong>
          ) : (
            " Your payout is released only after it's uploaded."
          )}
        </p>
      )}

      {showForm ? (
        <>
          <h3 className={styles.subTitle}>What your invoice must show</h3>
          <dl className={styles.spec}>
            <dt>Document</dt>
            <dd>
              {isTaxInvoice
                ? "Tax invoice, with your GSTIN"
                : "Bill of supply — you're not GST-registered, so no GST is charged"}
            </dd>
            <dt>Bill to</dt>
            <dd>
              {billTo.legalName ?? "—"}
              {billTo.address ? <span className={styles.subLine}>{billTo.address}</span> : null}
            </dd>
            {billTo.gstin ? (
              <>
                <dt>Client GSTIN</dt>
                <dd className={styles.mono}>{billTo.gstin}</dd>
              </>
            ) : null}
            {isTaxInvoice && billTo.placeOfSupplyStateName ? (
              <>
                <dt>Place of supply</dt>
                <dd>
                  {billTo.placeOfSupplyStateName} ({billTo.placeOfSupplyStateCode})
                </dd>
              </>
            ) : null}
            <dt>Security service</dt>
            <dd>{formatPaiseExact(expected.servicePaise)}</dd>
            {isTaxInvoice ? (
              <>
                <dt>GST @ {expected.serviceGstRatePct}%</dt>
                <dd>{formatPaiseExact(expected.serviceGstPaise)}</dd>
              </>
            ) : null}
            <dt className={styles.specTotal}>Invoice total</dt>
            <dd className={styles.specTotal}>{formatPaiseExact(expected.totalPaise)}</dd>
          </dl>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>Invoice file (PDF, JPG or PNG, up to 10MB)</span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>Invoice number</span>
                <input
                  className={styles.input}
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  maxLength={40}
                  placeholder="INV/2026-27/0042"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Invoice date</span>
                <input
                  className={styles.input}
                  type="date"
                  value={invoiceDate}
                  max={todayIso()}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Invoice total (₹)</span>
                <input
                  className={styles.input}
                  inputMode="decimal"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                />
              </label>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.actions}>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                {submitting ? "Uploading…" : providerInvoice ? "Upload replacement" : "Upload invoice"}
              </button>
              {editing ? (
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
}
