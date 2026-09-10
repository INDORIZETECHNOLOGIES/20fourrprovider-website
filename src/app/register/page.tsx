import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create your account — 20fourr" };

export default function RegisterPage() {
  return (
    <AuthShell tagline="Get verified once. Accept work, track duty, and get paid from one account.">
      <RegisterForm />
    </AuthShell>
  );
}
