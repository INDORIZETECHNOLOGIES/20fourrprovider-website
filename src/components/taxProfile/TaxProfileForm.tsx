"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api/client";
import { updateTaxProfile, type TaxProfile } from "@/lib/api/taxProfile";
import { validateGstin, validatePan, validateTurnoverAmount } from "@/lib/validation/taxProfile";
import styles from "./TaxProfilePanel.module.css";

export function TaxProfileForm({
  taxProfile,
  accessToken,
  onUpdated,
}: {
  taxProfile: TaxProfile;
  accessToken: string;
  onUpdated: (taxProfile: TaxProfile) => void;
}) {
  const [pan, setPan] = useState("");
  const [taxTier, setTaxTier] = useState(taxProfile.taxTier);
  const [gstin, setGstin] = useState(taxProfile.gstin ?? "");
  const [turnoverAmount, setTurnoverAmount] = useState(
    taxProfile.turnoverDeclaration ? String((taxProfile.turnoverDeclaration.amountPaise ?? 0) / 100) : "",
  );
  const [financialYear, setFinancialYear] = useState(taxProfile.turnoverDeclaration?.financialYear ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const errors: Record<string, string> = {};
    const panError = validatePan(pan);
    if (panError) errors.pan = panError;
    if (taxTier === "registered") {
      const gstinError = validateGstin(gstin);
      if (gstinError) errors.gstin = gstinError;
    }
    if (taxTier === "unregistered" && turnoverAmount) {
      const amountError = validateTurnoverAmount(turnoverAmount);
      if (amountError) errors.turnoverAmount = amountError;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setSaving(true);
    try {
      const updated = await updateTaxProfile(
        {
          panNumber: pan.trim().toUpperCase(),
          taxTier,
          gstin: taxTier === "registered" ? gstin.trim().toUpperCase() : undefined,
          turnoverDeclaration:
            taxTier === "unregistered" && turnoverAmount
              ? { financialYear: financialYear.trim() || undefined, amountPaise: Math.round(Number(turnoverAmount) * 100) }
              : undefined,
        },
        accessToken,
      );
      onUpdated(updated);
      setPan("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your tax profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.form}>
      <Field
        id="pan"
        label="PAN"
        value={pan}
        onChange={(e) => setPan(e.target.value.toUpperCase())}
        error={fieldErrors.pan}
        placeholder={taxProfile.panMasked ? `Current: ${taxProfile.panMasked}` : "ABCDE1234F"}
        maxLength={10}
      />

      <Select
        id="taxTier"
        label="Tax tier"
        value={taxTier}
        onChange={(e) => setTaxTier(e.target.value as "registered" | "unregistered")}
      >
        <option value="unregistered">Unregistered</option>
        <option value="registered">Registered (I have a GSTIN)</option>
      </Select>

      {taxTier === "registered" ? (
        <Field
          id="gstin"
          label="GSTIN"
          value={gstin}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          error={fieldErrors.gstin}
          placeholder="22ABCDE1234F1Z5"
          maxLength={15}
        />
      ) : (
        <>
          <Field
            id="turnoverAmount"
            label="Declared annual turnover, ₹ (optional)"
            type="number"
            min="0"
            value={turnoverAmount}
            onChange={(e) => setTurnoverAmount(e.target.value)}
            error={fieldErrors.turnoverAmount}
            hint="Only needed if you're close to the GST registration threshold for your state."
          />
          {turnoverAmount ? (
            <Field
              id="financialYear"
              label="Financial year (optional)"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              placeholder="2026-27"
            />
          ) : null}
        </>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button type="button" className={styles.saveButton} disabled={saving} onClick={handleSubmit}>
          {saving ? "Saving…" : "Save tax profile"}
        </button>
      </div>
    </div>
  );
}
