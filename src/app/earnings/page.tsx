"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { EarningsPanel } from "@/components/earnings/EarningsPanel";

export default function EarningsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Earnings">
      <EarningsPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
