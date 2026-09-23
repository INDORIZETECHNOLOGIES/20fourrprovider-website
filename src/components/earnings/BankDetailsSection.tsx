"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import { getProviderProfile, updateBankDetails, confirmBankDetails, type BankDetails } from "@/lib/api/provider";
import { validateAccountName, validateAccountNumber, validateIfscCode } from "@/lib/validation/bankDetails";
import { payoutAccountStatus } from "@/lib/constants/payoutAccount";
import styles from "./BankDetailsSection.module.css";

export function BankDetailsSection({ accessToken }: { accessToken: string }) {
  const [bankDetails, setBankDetails] = useState<BankDetails | null | "loading">("loading");
  const [editing, setEditing] = useState(false);

  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "current" | "">("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProviderProfile(accessToken)
      .then(({ profile }) => {
        if (!cancelled) setBankDetails(profile.bankDetails ?? null);
      })
      .catch(() => {
        if (!cancelled) setBankDetails(null);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  function startEditing() {
    setAccountNumber("");
    setIfscCode("");
    setAccountName(bankDetails && bankDetails !== "loading" ? bankDetails.accountName ?? "" : "");
    setBankName(bankDetails && bankDetails !== "loading" ? bankDetails.bankName ?? "" : "");
    setAccountType(
      bankDetails && bankDetails !== "loading" && bankDetails.accountType ? bankDetails.accountType : "",
    );
    setFieldErrors({});
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    const errors: Record<string, string> = {};
    const accountNumberError = validateAccountNumber(accountNumber);
    if (accountNumberError) errors.accountNumber = accountNumberError;
    const ifscError = validateIfscCode(ifscCode);
    if (ifscError) errors.ifscCode = ifscError;
    const nameError = validateAccountName(accountName);
    if (nameError) errors.accountName = nameError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setSaving(true);
    try {
      await updateBankDetails(
        {
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          accountName: accountName.trim(),
          bankName: bankName.trim() || undefined,
          accountType: accountType || undefined,
        },
        accessToken,
      );
      // The update response's bankDetails.accountNumber is always missing (the
      // schema field is select:false and the update handler doesn't re-select
      // it, unlike GET) — refetch rather than trust it for display.
      const { profile } = await getProviderProfile(accessToken);
      setBankDetails(profile.bankDetails ?? null);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save bank details. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    setConfirming(true);
    try {
      await confirmBankDetails(accessToken);
      setBankDetails((current) =>
        current && current !== "loading" ? { ...current, confirmedByProvider: true } : current,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't confirm your bank account. Try again.");
    } finally {
      setConfirming(false);
    }
  }

  if (bankDetails === "loading") return null;

  const payout = payoutAccountStatus(bankDetails);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Payout bank account</h2>
      <p className={styles.sectionText}>
        Where your settlement payouts are sent. After you submit or change these details, our team
        verifies the account before it can receive a payout.
      </p>

      {editing ? (
        <div className={styles.form}>
          <Field
            id="accountNumber"
            label="Account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            error={fieldErrors.accountNumber}
            placeholder={bankDetails?.accountNumber ? `Current: ${bankDetails.accountNumber}` : undefined}
          />
          <Field
            id="ifscCode"
            label="IFSC code"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            error={fieldErrors.ifscCode}
          />
          <Field
            id="accountName"
            label="Account holder name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            error={fieldErrors.accountName}
          />
          <Field
            id="bankName"
            label="Bank name (optional)"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <Select
            id="accountType"
            label="Account type (optional)"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as "savings" | "current" | "")}
          >
            <option value="">Not specified</option>
            <option value="savings">Savings</option>
            <option value="current">Current</option>
          </Select>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.formActions}>
            <button type="button" className={styles.saveButton} disabled={saving} onClick={handleSave}>
              {saving ? "Saving…" : "Save bank details"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              disabled={saving}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {bankDetails?.accountNumber ? (
            <>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Account number</span>
                <span>{bankDetails.accountNumber}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>IFSC</span>
                <span>{bankDetails.ifscCode}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Account holder</span>
                <span>{bankDetails.accountName}</span>
              </div>

              <div className={styles.statusRow}>
                {bankDetails.confirmedByProvider ? (
                  <Badge tone="active">Confirmed</Badge>
                ) : bankDetails.verified ? (
                  <Badge tone="action">Verified — confirm to enable payouts</Badge>
                ) : (
                  <Badge tone="muted">Pending verification</Badge>
                )}
              </div>

              {payout ? (
                <div className={styles.payoutAccount}>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Payout account</span>
                    <Badge tone={payout.tone}>{payout.label}</Badge>
                  </div>
                  <p className={styles.hint}>
                    {payout.detail}
                    {payout.action ? (
                      <>
                        {" "}
                        <Link href={payout.action.href}>{payout.action.label}</Link>
                      </>
                    ) : null}
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.sectionText}>No bank account on file yet.</p>
          )}

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.editButton} onClick={startEditing}>
              {bankDetails?.accountNumber ? "Update bank details" : "Add bank details"}
            </button>
            {bankDetails?.verified && !bankDetails.confirmedByProvider ? (
              <button type="button" className={styles.confirmButton} disabled={confirming} onClick={handleConfirm}>
                {confirming ? "Confirming…" : "Confirm this is my account"}
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
