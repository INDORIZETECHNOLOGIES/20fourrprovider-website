"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { listTaxDocuments, type TaxDocumentHeader, type TaxDocumentType, type Pagination } from "@/lib/api/taxDocuments";
import { TaxDocumentRow } from "./TaxDocumentRow";
import styles from "./TaxDocumentsPanel.module.css";

export function TaxDocumentsList({
  docTypeFilter,
  accessToken,
}: {
  docTypeFilter: TaxDocumentType | "";
  accessToken: string;
}) {
  const [documents, setDocuments] = useState<TaxDocumentHeader[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listTaxDocuments(accessToken, { docType: docTypeFilter || undefined, page: 1 })
      .then((result) => {
        if (cancelled) return;
        setDocuments(result.documents);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your tax documents. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, docTypeFilter]);

  async function handleLoadMore() {
    if (!pagination) return;
    setLoadingMore(true);
    try {
      const result = await listTaxDocuments(accessToken, {
        docType: docTypeFilter || undefined,
        page: pagination.page + 1,
      });
      setDocuments((current) => [...current, ...result.documents]);
      setPagination(result.pagination);
    } catch {
      setError("Couldn't load more documents.");
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = pagination ? pagination.page < pagination.pages : false;

  return (
    <>
      {error ? <Banner>{error}</Banner> : null}

      {!loading && documents.length === 0 ? (
        docTypeFilter ? (
        <EmptyState icon="receipt" title="No documents of this type" body="Try another type, or choose All." />
      ) : (
        <EmptyState
          icon="receipt"
          title="No tax documents yet"
          body="Invoices and settlement statements are issued automatically as your bookings are confirmed and completed."
        />
      )
      ) : null}

      {documents.map((doc) => (
        <TaxDocumentRow key={doc._id} document={doc} accessToken={accessToken} />
      ))}

      {hasMore ? (
        <button type="button" className={styles.loadMore} disabled={loadingMore} onClick={handleLoadMore}>
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </>
  );
}
