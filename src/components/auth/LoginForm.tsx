"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { loginProvider } from "@/lib/api/auth";
import { saveSession } from "@/lib/auth/session";
import { validateEmail } from "@/lib/validation/auth";
import styles from "./AuthForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = password ? null : "Enter your password.";
    setFieldErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
    if (emailError || passwordError) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const result = await loginProvider({ email, password });
      saveSession({ tokens: result.tokens, name: result.user.name });
      // requiresVerification means email and/or phone OTP is still pending from
      // registration (or was skipped) — route back to finish it rather than
      // straight to the dashboard. /dashboard itself still redirects on to
      // /profile/setup if the profile isn't complete either.
      router.push(result.requiresVerification ? "/verify" : "/dashboard");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className={styles.heading}>Sign in</h1>
      <p className={styles.subtext}>Sign in with the email and password you registered with.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError ? <p className={styles.banner}>{formError}</p> : null}
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          maxLength={100}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <Link href="/forgot-password" className={styles.inlineLink}>
          Forgot your password?
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className={styles.footer}>
        New to 20fourr? <Link href="/register">Create an account</Link>
      </p>
    </>
  );
}
