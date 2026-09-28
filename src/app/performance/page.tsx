"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { PerformancePanel } from "@/components/performance/PerformancePanel";

export default function PerformancePage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Performance">
      <PerformancePanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
