"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ApiError } from "@/lib/api/client";
import { updatePerson, uploadPersonPhoto, type Person } from "@/lib/api/personnel";
import { requiredDocuments, toDraft, toInput, validateDraft, type DraftErrors, type PersonDraft } from "@/lib/team";
import { DocumentUpload } from "./DocumentUpload";
import { PersonAvatar } from "./PersonAvatar";
import { PersonFields } from "./PersonFields";
import styles from "./Team.module.css";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Everything about one person, edited in place under their row. */
export function PersonEditor({
  person,
  accessToken,
  onUpdated,
  onClose,
}: {
  person: Person;
  accessToken: string;
  onUpdated: (person: Person) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PersonDraft>(() => toDraft(person));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [busy, setBusy] = useState<"details" | "photo" | "status" | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);

  const fail = (err: unknown, fallback: string) =>
    setMessage({ tone: "error", text: err instanceof ApiError ? err.message : fallback });

  async function saveDetails(event: FormEvent) {
    event.preventDefault();
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy("details");
    setMessage(null);
    try {
      onUpdated(await updatePerson(person.personnelId, toInput(draft), accessToken));
      setMessage({ tone: "ok", text: "Saved." });
    } catch (err) {
      fail(err, "Couldn't save. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return setMessage({ tone: "error", text: "Use a JPG, PNG or WebP photo." });
    if (file.size > 10 * 1024 * 1024) return setMessage({ tone: "error", text: "The photo must be under 10 MB." });
    setBusy("photo");
    setMessage(null);
    try {
      onUpdated(await uploadPersonPhoto(person.personnelId, file, accessToken));
    } catch (err) {
      fail(err, "Couldn't upload the photo. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleStatus() {
    setBusy("status");
    setMessage(null);
    try {
      onUpdated(
        await updatePerson(person.personnelId, { status: person.status === "active" ? "inactive" : "active" }, accessToken),
      );
    } catch (err) {
      fail(err, "Couldn't update. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const photoId = `${person.personnelId}-photo`;

  return (
    <div className={styles.editor}>
      <section className={styles.editorBlock} aria-label="Photo">
        <div className={styles.photoRow}>
          <PersonAvatar name={person.fullName} photoUrl={person.photoUrl} size={64} />
          <div>
            <p className={styles.blockTitle}>Photo</p>
            <p className={styles.help}>A clear, recent face photo. Clients see it once you assign this person to their booking.</p>
          </div>
          <label htmlFor={photoId} className={`${styles.secondaryButton} ${busy === "photo" ? styles.isBusy : ""}`}>
            {busy === "photo" ? "Uploading…" : person.photoUrl ? "Change" : "Add photo"}
          </label>
          <input id={photoId} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy !== null} onChange={changePhoto} />
        </div>
      </section>

      <section className={styles.editorBlock} aria-label="Documents">
        <p className={styles.blockTitle}>Documents</p>
        <p className={styles.help}>
          Each must be valid through a booking&apos;s last day, or this person can&apos;t be assigned to it. Clients see
          only which documents are held and until when, never the files.
        </p>
        <div className={styles.docs}>
          {requiredDocuments(person.category).map((type) => (
            <DocumentUpload key={type} person={person} type={type} accessToken={accessToken} onUpdated={onUpdated} />
          ))}
        </div>
      </section>

      <form className={styles.editorBlock} onSubmit={saveDetails} noValidate aria-label="Details">
        <p className={styles.blockTitle}>Details</p>
        <PersonFields idPrefix={person.personnelId} draft={draft} errors={errors} disabled={busy !== null} onChange={setDraft} />
        <div className={styles.inlineActions}>
          <button type="submit" className={styles.primaryButton} disabled={busy !== null}>
            {busy === "details" ? "Saving…" : "Save details"}
          </button>
          {message ? (
            <span className={message.tone === "error" ? styles.formError : styles.formOk} role={message.tone === "error" ? "alert" : "status"}>
              {message.text}
            </span>
          ) : null}
        </div>
      </form>

      <div className={styles.editorFoot}>
        <button type="button" className={styles.quietButton} disabled={busy !== null} onClick={toggleStatus}>
          {busy === "status" ? "Updating…" : person.status === "active" ? "Mark inactive" : "Mark active again"}
        </button>
        <span className={styles.help}>
          {person.status === "active"
            ? "An inactive person stays on past bookings but can't be assigned to new ones."
            : "Inactive: kept on past bookings, not assignable."}
        </span>
        <button type="button" className={styles.quietButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
