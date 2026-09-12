"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import { sendEmailVerification, verifyEmail } from "@/lib/api/auth";
import { validateOtp } from "@/lib/validation/auth";
import styles from "./EmailVerificationSection.module.css";

// Shared by the Account page and the post-registration /verify step — moved out
// of src/components/account so both can import one implementation rather than
// two copies drifting apart.
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
      // verifyEmail is authenticated and keyed to req.user._id server-side (unlike
      // phone verification, which matches by phone string) — a 200 here is a
      // reliable signal, no need to re-confirm via a follow-up /auth/me read.
      await verifyEmail(otp.trim(), accessToken);
      onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify that code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Email verification</h2>
      <div className={styles.statusRow}>
        <span>{email}</span>
        {emailVerified ? <Badge tone="active">Verified</Badge> : <Badge tone="muted">Not verified</Badge>}
      </div>

      {!emailVerified ? (
        <>
          <p className={styles.sectionText}>
            Verify your email so we can reach you about your account and payouts.
          </p>

          {error ? <Banner>{error}</Banner> : null}

          {!codeSent ? (
            <div className={styles.actions}>
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
              <div className={styles.actions}>
                <Button type="button" disabled={verifying} onClick={handleVerify}>
                  {verifying ? "Verifying…" : "Verify"}
                </Button>
                <button type="button" disabled={sending} onClick={handleSendCode} className={styles.textButton}>
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
