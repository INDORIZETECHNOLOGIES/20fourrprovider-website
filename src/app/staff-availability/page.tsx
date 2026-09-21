"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { StaffAvailabilityPanel } from "@/components/staffAvailability/StaffAvailabilityPanel";

export default function StaffAvailabilityPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Staff availability">
      <StaffAvailabilityPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
