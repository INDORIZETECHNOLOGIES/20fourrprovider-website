"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { TicketsPanel } from "@/components/tickets/TicketsPanel";

export default function TicketsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Support">
      <TicketsPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
