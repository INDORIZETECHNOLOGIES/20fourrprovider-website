"use client";

import { useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { uploadProviderDocument } from "@/lib/api/documents";
import { validateDocumentFile } from "@/lib/validation/documents";
import type { ProviderDocumentCatalogEntry } from "@/lib/constants/providerDocuments";
import styles from "./DocumentRow.module.css";

type DocumentRowProps = {
  entry: ProviderDocumentCatalogEntry;
  required: boolean;
  currentUrl?: string;
  accessToken: string;
  onUploaded: (documentType: string, fileUrl: string) => void;
};

export function DocumentRow({ entry, required, currentUrl, accessToken, onUploaded }: DocumentRowProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateDocumentFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const { document } = await uploadProviderDocument(entry.id, file, accessToken);
      onUploaded(entry.id, document.fileUrl);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  const inputId = `doc-${entry.id}`;
  const uploaded = Boolean(currentUrl);

  return (
    <div className={styles.row}>
      {/* Uploaded or not is the first thing to read down a list of 27 rows. */}
      <span
        className={`${styles.mark} ${uploaded ? styles.markDone : ""}`}
        aria-label={uploaded ? "Uploaded" : "Not uploaded"}
        role="img"
      >
        {uploaded ? <Icon name="check" size={13} /> : null}
      </span>

      <div className={styles.info}>
        <div className={styles.labelRow}>
          <span className={styles.label}>{entry.label}</span>
          {required ? <span className={styles.requiredTag}>Required</span> : null}
        </div>
        {entry.hint ? <span className={styles.hint}>{entry.hint}</span> : null}
        {error ? <span className={styles.error}>{error}</span> : null}
      </div>

      <div className={styles.actions}>
        {currentUrl ? (
          <a className={styles.viewLink} href={currentUrl} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : null}
        <label
          htmlFor={inputId}
          className={`${styles.uploadButton} ${uploading ? styles.uploadButtonDisabled : ""}`}
        >
          {uploading ? "Uploading…" : uploaded ? "Replace" : "Upload"}
        </label>
        <input
          id={inputId}
          className={styles.fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
