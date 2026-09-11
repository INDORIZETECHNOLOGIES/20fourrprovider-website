"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { registerProvider } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { saveSession } from "@/lib/auth/session";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
} from "@/lib/validation/auth";
import styles from "./AuthForm.module.css";

type FieldErrors = Partial<
  Record<"name" | "email" | "phone" | "password" | "confirmPassword" | "terms", string>
>;

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors: FieldErrors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      phone: validatePhone(phone) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword: validatePasswordMatch(password, confirmPassword) ?? undefined,
      terms: agreedToTerms ? undefined : "You need to agree to the terms to continue.",
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const result = await registerProvider({
        name,
        email,
        phone,
        password,
        confirmPassword,
        referralCode: referralCode.trim() || undefined,
        marketingConsent,
      });
      saveSession({ tokens: result.tokens, name });
      router.push("/profile/setup");
    } catch (error) {
      setFormError(describeRegisterError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className={styles.heading}>Create your account</h1>
      <p className={styles.subtext}>For security professionals — guards, bouncers, gunmen, and PSOs.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError ? <p className={styles.banner}>{formError}</p> : null}
        <Field
          id="name"
          label="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <Field
          id="phone"
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
          hint={fieldErrors.phone ? undefined : "10-digit Indian mobile number."}
        />
        <div className={styles.row}>
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            hint={fieldErrors.password ? undefined : "8+ characters, with upper, lower, number, and symbol."}
          />
          <Field
            id="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />
        </div>
        <Field
          id="referralCode"
          label="Referral code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
        <div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span className={styles.checkboxLabel}>
              I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </span>
          </label>
          {fieldErrors.terms ? <p className={styles.error}>{fieldErrors.terms}</p> : null}
        </div>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          <span className={styles.checkboxLabel}>
            Send me updates about new bookings and features.
          </span>
        </label>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className={styles.footer}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}

function describeRegisterError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "SC_204") return "That email is already registered. Try signing in instead.";
    if (error.code === "SC_205") return "That mobile number is already registered. Try signing in instead.";
    if (error.code === "SC_206") return "Choose a stronger password.";
    return error.message;
  }
  return "Something went wrong. Try again.";
}
