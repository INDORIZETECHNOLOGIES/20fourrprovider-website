"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import { updatePsaraCoverage, type TaxProfile, type PsaraVerificationStatus } from "@/lib/api/taxProfile";
import { validatePsaraExpiry, validatePsaraLicenceNumber } from "@/lib/validation/taxProfile";
import { GST_STATES } from "@/lib/constants/indianStates";
import { PSARA_STATUS_LABELS, PSARA_STATUS_TONE } from "@/lib/constants/taxProfile";
import styles from "./TaxProfilePanel.module.css";

type LicenceRow = {
  key: number;
  stateCode: string;
  licenceNumber: string;
  issuedAt: string;
  expiresAt: string;
  verificationStatus?: PsaraVerificationStatus;
};

let nextKey = 0;

function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function PsaraCoverageSection({
  taxProfile,
  accessToken,
  onUpdated,
}: {
  taxProfile: TaxProfile;
  accessToken: string;
  onUpdated: (taxProfile: TaxProfile) => void;
}) {
  const [rows, setRows] = useState<LicenceRow[]>(() =>
    taxProfile.psaraCoverage.map((entry) => ({
      key: nextKey++,
      stateCode: entry.stateCode,
      licenceNumber: entry.licenceNumber,
      issuedAt: toDateInput(entry.issuedAt),
      expiresAt: toDateInput(entry.expiresAt),
      verificationStatus: entry.verificationStatus,
    })),
  );
  const [rowErrors, setRowErrors] = useState<Record<number, { licenceNumber?: string; expiresAt?: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addRow() {
    setRows((current) => [
      ...current,
      { key: nextKey++, stateCode: GST_STATES[0].code, licenceNumber: "", issuedAt: "", expiresAt: "" },
    ]);
  }

  function removeRow(key: number) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  function updateRow(key: number, patch: Partial<LicenceRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  async function handleSubmit() {
    const errors: Record<number, { licenceNumber?: string; expiresAt?: string }> = {};
    for (const row of rows) {
      const licenceError = validatePsaraLicenceNumber(row.licenceNumber);
      const expiryError = validatePsaraExpiry(row.expiresAt);
      if (licenceError || expiryError) {
        errors[row.key] = { licenceNumber: licenceError ?? undefined, expiresAt: expiryError ?? undefined };
      }
    }
    const stateCodes = rows.map((r) => r.stateCode);
    if (new Set(stateCodes).size !== stateCodes.length) {
      setError("Each state can only appear once — remove the duplicate.");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setRowErrors(errors);
      return;
    }

    setRowErrors({});
    setError(null);
    setSaving(true);
    try {
      const updated = await updatePsaraCoverage(
        rows.map((row) => ({
          stateCode: row.stateCode,
          licenceNumber: row.licenceNumber.trim(),
          issuedAt: row.issuedAt || undefined,
          expiresAt: row.expiresAt,
        })),
        accessToken,
      );
      onUpdated(updated);
      setRows(
        updated.psaraCoverage.map((entry) => ({
          key: nextKey++,
          stateCode: entry.stateCode,
          licenceNumber: entry.licenceNumber,
          issuedAt: toDateInput(entry.issuedAt),
          expiresAt: toDateInput(entry.expiresAt),
          verificationStatus: entry.verificationStatus,
        })),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your PSARA coverage. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>PSARA coverage</h2>
      <p className={styles.sectionText}>
        Every state you&apos;re licensed to operate a security service in, under the Private Security
        Agencies Regulation Act.
      </p>

      {rows.length === 0 ? <p className={styles.empty}>No states added yet.</p> : null}

      <div className={styles.licenceList}>
        {rows.map((row) => (
          <div key={row.key} className={styles.licenceRow}>
            <div className={styles.licenceTop}>
              {row.verificationStatus ? (
                <Badge tone={PSARA_STATUS_TONE[row.verificationStatus]}>
                  {PSARA_STATUS_LABELS[row.verificationStatus]}
                </Badge>
              ) : (
                <span />
              )}
              <button type="button" className={styles.removeButton} onClick={() => removeRow(row.key)}>
                Remove
              </button>
            </div>

            <Select
              id={`state-${row.key}`}
              label="State"
              value={row.stateCode}
              onChange={(e) => updateRow(row.key, { stateCode: e.target.value })}
            >
              {GST_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </Select>

            <Field
              id={`licenceNumber-${row.key}`}
              label="Licence number"
              value={row.licenceNumber}
              onChange={(e) => updateRow(row.key, { licenceNumber: e.target.value })}
              error={rowErrors[row.key]?.licenceNumber}
            />

            <div className={styles.licenceFields}>
              <Field
                id={`issuedAt-${row.key}`}
                label="Issued on (optional)"
                type="date"
                value={row.issuedAt}
                onChange={(e) => updateRow(row.key, { issuedAt: e.target.value })}
              />
              <Field
                id={`expiresAt-${row.key}`}
                label="Expires on"
                type="date"
                value={row.expiresAt}
                onChange={(e) => updateRow(row.key, { expiresAt: e.target.value })}
                error={rowErrors[row.key]?.expiresAt}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addButton} onClick={addRow}>
        Add a state
      </button>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button type="button" className={styles.saveButton} disabled={saving} onClick={handleSubmit}>
          {saving ? "Saving…" : "Save PSARA coverage"}
        </button>
      </div>
    </div>
  );
}
