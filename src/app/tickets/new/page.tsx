"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { NewTicketForm } from "@/components/tickets/NewTicketForm";

export default function NewTicketPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="New ticket">
      <NewTicketForm accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
