"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import { sendEmailVerification, verifyEmail } from "@/lib/api/auth";
import { validateOtp } from "@/lib/validation/auth";
import panelStyles from "./AccountPanel.module.css";

export function EmailVerificationSection({
  email,
  emailVerified,
  accessToken,
  onVerified,
}: {
  email: string;
  emailVerified: boolean;
  accessToken: string;
  onVerified: () => void;
}) {
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleSendCode() {
    setError(null);
    setSending(true);
    try {
      await sendEmailVerification(accessToken);
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send a verification code. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    const validationError = validateOtp(otp);
    setOtpError(validationError);
    if (validationError) return;

    setError(null);
    setVerifying(true);
    try {
      await verifyEmail(otp.trim(), accessToken);
      onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify that code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className={panelStyles.section}>
      <h2 className={panelStyles.sectionTitle}>Email verification</h2>
      <div className={panelStyles.checkboxRow}>
        <span>{email}</span>
        {emailVerified ? <Badge tone="active">Verified</Badge> : <Badge tone="muted">Not verified</Badge>}
      </div>

      {!emailVerified ? (
        <>
          <p className={panelStyles.sectionText}>
            Verify your email so we can reach you about your account and payouts.
          </p>

          {error ? <Banner>{error}</Banner> : null}

          {!codeSent ? (
            <div className={panelStyles.actions}>
              <Button type="button" disabled={sending} onClick={handleSendCode}>
                {sending ? "Sending…" : "Send verification code"}
              </Button>
            </div>
          ) : (
            <>
              <Field
                id="emailOtp"
                label="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={otpError ?? undefined}
                maxLength={6}
                inputMode="numeric"
              />
              <div className={panelStyles.actions}>
                <Button type="button" disabled={verifying} onClick={handleVerify}>
                  {verifying ? "Verifying…" : "Verify"}
                </Button>
                <button type="button" disabled={sending} onClick={handleSendCode} className={panelStyles.textButton}>
                  {sending ? "Resending…" : "Resend code"}
                </button>
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
