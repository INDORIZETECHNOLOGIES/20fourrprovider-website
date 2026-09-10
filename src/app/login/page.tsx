import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in — 20fourr" };

export default function LoginPage() {
  return (
    <AuthShell tagline="Manage your bookings, duty shifts, and payouts in one place.">
      <LoginForm />
    </AuthShell>
  );
}
