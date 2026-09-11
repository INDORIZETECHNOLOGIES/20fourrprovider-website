"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { TicketDetail } from "./TicketDetail";

export function TicketDetailPage({ ticketId }: { ticketId: string }) {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Ticket detail">
      <TicketDetail ticketId={ticketId} accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
