import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password — 20fourr" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell tagline="Manage your bookings, duty shifts, and payouts in one place.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
