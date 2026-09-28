"use client";

import { useState, type FormEvent } from "react";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { createPerson, teamErrorMessage, type Person } from "@/lib/api/personnel";
import { EMPTY_DRAFT, toInput, validateDraft, type DraftErrors, type PersonDraft } from "@/lib/team";
import { PersonFields } from "./PersonFields";
import styles from "./Team.module.css";

export function AddPersonForm({
  accessToken,
  onCreated,
  onCancel,
}: {
  accessToken: string;
  onCreated: (person: Person) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PersonDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [genuine, setGenuine] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    if (!genuine || !consent) return setError("Confirm both statements to add this person.");

    setError(null);
    setSaving(true);
    try {
      const input = toInput(draft);
      const person = await createPerson(
        { ...input, fullName: input.fullName!, category: input.category! },
        { documentsGenuine: true, consentToDisplay: true },
        accessToken,
      );
      onCreated(person);
    } catch (err) {
      setError(
        (err instanceof ApiError && teamErrorMessage(err.code)) ||
          (err instanceof Error ? err.message : "Couldn't add this person. Try again."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit} noValidate aria-labelledby="add-person-title">
      <div className={styles.panelHead}>
        <h2 id="add-person-title" className={styles.panelTitle}>
          Add a person
        </h2>
        <p className={styles.panelText}>Their photo and documents come next, once they&apos;re on your team.</p>
      </div>

      <div className={styles.panelBody}>
        {error ? <Banner>{error}</Banner> : null}
        <PersonFields idPrefix="add" draft={draft} errors={errors} disabled={saving} onChange={setDraft} />

        <fieldset className={styles.attest}>
          <legend className={styles.attestLegend}>Before adding them</legend>
          <label className={styles.check}>
            <input type="checkbox" checked={genuine} disabled={saving} onChange={(e) => setGenuine(e.target.checked)} />
            <span>The documents I upload for this person are genuine and theirs.</span>
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={consent} disabled={saving} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              They agree to their photo and profile being shown to clients of the bookings I assign them to. We record
              this with today&apos;s date.
            </span>
          </label>
        </fieldset>
      </div>

      <div className={styles.panelFoot}>
        <button type="button" className={styles.quietButton} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className={styles.primaryButton} disabled={saving || !genuine || !consent}>
          {saving ? "Adding…" : "Add to team"}
        </button>
      </div>
    </form>
  );
}
