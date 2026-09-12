"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import { sendPhoneOtp, verifyPhoneOtp, getCurrentUser } from "@/lib/api/auth";
import { validateOtp } from "@/lib/validation/auth";
import styles from "./EmailVerificationSection.module.css";

// Mirrors EmailVerificationSection's shape and copies its CSS module, but the
// two calls it makes are unauthenticated — POST /auth/send-otp and /verify-otp
// take the phone number itself, not a session, so no accessToken is passed to
// either. accessToken here is only used for the confirmation re-read below.
export function PhoneVerificationSection({
  phone,
  phoneVerified,
  accessToken,
  onVerified,
}: {
  phone: string;
  phoneVerified: boolean;
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
      await sendPhoneOtp(phone);
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send a code. Try again.");
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
      await verifyPhoneOtp(phone, otp.trim());

      // POST /auth/verify-otp checks the OTP against MSG91 and returns success even
      // if the phone doesn't match any User document — it just silently does nothing
      // to the account in that case (see CLAUDE.md). A 200 here is therefore not
      // proof the account itself was updated; re-read /auth/me and trust that instead.
      const { user } = await getCurrentUser(accessToken);
      if (user.phoneVerified) {
        onVerified();
      } else {
        setError(
          "That code checked out, but we couldn't confirm it against your account. Make sure the number matches what you registered with, then try again.",
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify that code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Phone verification</h2>
      <div className={styles.statusRow}>
        <span>{phone}</span>
        {phoneVerified ? <Badge tone="active">Verified</Badge> : <Badge tone="muted">Not verified</Badge>}
      </div>

      {!phoneVerified ? (
        <>
          <p className={styles.sectionText}>
            Verify your number so clients and our team can reach you about a booking or a duty
            issue.
          </p>

          {error ? <Banner>{error}</Banner> : null}

          {!codeSent ? (
            <div className={styles.actions}>
              <Button type="button" disabled={sending} onClick={handleSendCode}>
                {sending ? "Sending…" : "Send code by SMS"}
              </Button>
            </div>
          ) : (
            <>
              <Field
                id="phoneOtp"
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
