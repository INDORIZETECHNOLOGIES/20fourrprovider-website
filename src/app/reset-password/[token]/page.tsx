import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Set a new password — 20fourr" };

export default async function ResetPasswordRoute(props: PageProps<"/reset-password/[token]">) {
  const { token } = await props.params;
  return (
    <AuthShell tagline="Manage your bookings, duty shifts, and payouts in one place.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
