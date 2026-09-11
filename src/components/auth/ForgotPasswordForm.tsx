"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { forgotPassword } from "@/lib/api/auth";
import { validateEmail } from "@/lib/validation/auth";
import styles from "./AuthForm.module.css";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setFormError(null);
    setSubmitting(true);
    try {
      // The backend always returns 200 with an identical message whether or not the
      // email exists (enumeration-safe) — a thrown error here is a real problem (rate
      // limit, network), never a signal about the email itself, so it's safe to show.
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <h1 className={styles.heading}>Check your email</h1>
        <p className={styles.successBanner}>
          If an account exists for {email}, we&apos;ve sent a link to reset your password. It&apos;s
          valid for 30 minutes.
        </p>
        <p className={styles.footer}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.heading}>Reset your password</h1>
      <p className={styles.subtext}>Enter your email and we&apos;ll send you a link to reset your password.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError ? <p className={styles.banner}>{formError}</p> : null}
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError ?? undefined}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className={styles.footer}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </>
  );
}
