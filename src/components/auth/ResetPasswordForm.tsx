"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { resetPassword } from "@/lib/api/auth";
import { validatePassword, validatePasswordMatch } from "@/lib/validation/auth";
import styles from "./AuthForm.module.css";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const passwordError = validatePassword(password);
    const matchError = passwordError ? null : validatePasswordMatch(password, confirmPassword);
    setFieldErrors({ password: passwordError ?? undefined, confirmPassword: matchError ?? undefined });
    if (passwordError || matchError) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, password, confirmPassword);
      setDone(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <>
        <h1 className={styles.heading}>Password reset</h1>
        <p className={styles.successBanner}>Your password has been changed. Sign in with your new password.</p>
        <p className={styles.footer}>
          <Link href="/login">Go to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.heading}>Set a new password</h1>
      <p className={styles.subtext}>Choose a new password for your account.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError ? <p className={styles.banner}>{formError}</p> : null}
        <Field
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="8-128 characters, with uppercase, lowercase, a number, and a symbol."
        />
        <Field
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </>
  );
}
