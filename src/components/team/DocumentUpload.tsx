"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/Field";
import { ApiError } from "@/lib/api/client";
import { PERSONNEL_DOCUMENT_LABELS, uploadPersonDocument, type Person, type PersonnelDocumentType } from "@/lib/api/personnel";
import { formatDate } from "@/lib/format";
import { documentState } from "@/lib/team";
import { validateDocumentFile } from "@/lib/validation/documents";
import styles from "./Team.module.css";

const STATE_TEXT = {
  missing: "Not uploaded",
  expired: "Expired",
  expiring: "Expires soon",
  valid: "Valid",
} as const;

/** One required document: where it stands, and an inline form to upload or renew it. */
export function DocumentUpload({
  person,
  type,
  accessToken,
  onUpdated,
}: {
  person: Person;
  type: PersonnelDocumentType;
  accessToken: string;
  onUpdated: (person: Person) => void;
}) {
  const doc = documentState(person, type);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const id = `${person.personnelId}-${type}`;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setError("Choose the file.");
    const fileError = validateDocumentFile(file);
    if (fileError) return setError(fileError);
    if (expiresAt && new Date(expiresAt) < new Date(new Date().toDateString())) return setError("That date has already passed.");

    setError(null);
    setSaving(true);
    try {
      const updated = await uploadPersonDocument(
        person.personnelId,
        { type, file, number: number.trim() || undefined, expiresAt: expiresAt || undefined },
        accessToken,
      );
      onUpdated(updated);
      setOpen(false);
      setFile(null);
      setExpiresAt("");
      setNumber("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const tone = doc.state === "valid" ? styles.docOk : doc.state === "expiring" ? styles.docSoon : styles.docBad;

  return (
    <div className={styles.doc}>
      <div className={styles.docHead}>
        <div>
          <p className={styles.docName}>{PERSONNEL_DOCUMENT_LABELS[type]}</p>
          <p className={`${styles.docState} ${tone}`}>
            {STATE_TEXT[doc.state]}
            {doc.state !== "missing" && doc.expiresAt ? ` · ${doc.state === "expired" ? "expired" : "until"} ${formatDate(doc.expiresAt)}` : ""}
          </p>
        </div>
        {!open ? (
          <button type="button" className={styles.secondaryButton} onClick={() => setOpen(true)}>
            {doc.state === "missing" ? "Upload" : doc.state === "valid" ? "Replace" : "Renew"}
          </button>
        ) : null}
      </div>

      {open ? (
        <form className={styles.docForm} onSubmit={handleSubmit} noValidate>
          <label className={styles.fileLabel} htmlFor={`${id}-file`}>
            <span className={styles.fileButton}>{file ? "Change file" : "Choose file"}</span>
            <span className={styles.fileName}>{file ? file.name : "PDF, JPG, PNG or WebP, up to 10 MB"}</span>
          </label>
          <input
            id={`${id}-file`}
            className={styles.fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            disabled={saving}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className={styles.docFields}>
            <Field id={`${id}-expires`} label="Valid until" type="date" value={expiresAt} disabled={saving} onChange={(e) => setExpiresAt(e.target.value)} />
            <Field id={`${id}-number`} label="Number (optional)" value={number} disabled={saving} onChange={(e) => setNumber(e.target.value)} autoComplete="off" />
          </div>
          <p className={styles.help}>The number is stored encrypted and never shown again, even to you.</p>
          {error ? (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.inlineActions}>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              {saving ? "Uploading…" : "Upload"}
            </button>
            <button type="button" className={styles.quietButton} disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
