"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { changePassword, sendChangePasswordOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { clearSession } from "@/lib/auth/session";
import { validateOtp, validatePassword, validatePasswordMatch } from "@/lib/validation/auth";
import styles from "./AccountPanel.module.css";

type Step = "idle" | "code" | "done";

// Two steps: an emailed code, then the new password. The code replaces asking
// for the current password, so someone who has forgotten it can still rotate it.
export function ChangePasswordSection({ accessToken }: { accessToken: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sentNote, setSentNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ otp?: string; password?: string; confirm?: string }>({});

  // A successful change ends every session, so send them to sign in again.
  useEffect(() => {
    if (step !== "done") return;
    const timer = window.setTimeout(() => {
      clearSession();
      router.push("/login");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [step, router]);

  async function sendCode() {
    setError(null);
    setSending(true);
    try {
      await sendChangePasswordOtp(accessToken);
      setStep("code");
      setSentNote("We emailed a 6-digit code to your registered address.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const next = {
      otp: validateOtp(otp) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirm: validatePasswordMatch(password, confirm) ?? undefined,
    };
    setFieldErrors(next);
    if (next.otp || next.password || next.confirm) return;

    setSaving(true);
    try {
      await changePassword({ otp: otp.trim(), newPassword: password, confirmPassword: confirm }, accessToken);
      setStep("done");
    } catch (err) {
      // A wrong, expired or used-up code belongs on the code field.
      if (err instanceof ApiError && err.code === "SC_207") {
        setFieldErrors({ otp: err.message });
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn't change your password. Try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.section} id="password">
      <h2 className={styles.sectionTitle}>Password</h2>

      {step === "done" ? (
        <p className={styles.successNote} role="status">
          Password changed. For your security you&apos;ve been signed out everywhere — taking you to sign in.
        </p>
      ) : step === "idle" ? (
        <>
          <p className={styles.sectionText}>
            We&apos;ll email you a code to confirm it&apos;s you, then you can choose a new password.
          </p>
          {error ? <Banner>{error}</Banner> : null}
          <Button type="button" disabled={sending} onClick={sendCode}>
            {sending ? "Sending…" : "Email me a code"}
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {sentNote ? <p className={styles.sectionText}>{sentNote}</p> : null}
          {error ? <Banner>{error}</Banner> : null}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Field
              id="passwordOtp"
              label="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              error={fieldErrors.otp}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <Field
              id="newPassword"
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              hint="At least 8 characters, with upper and lower case, a number and a symbol."
              autoComplete="new-password"
            />
            <Field
              id="confirmPassword"
              label="Confirm new password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={fieldErrors.confirm}
              autoComplete="new-password"
            />
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={saving} style={{ width: "auto", minWidth: 200 }}>
              {saving ? "Changing…" : "Change password"}
            </Button>
            <button type="button" className={styles.textButton} disabled={sending} onClick={sendCode}>
              {sending ? "Sending…" : "Send a new code"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
