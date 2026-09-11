"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { TicketDetail } from "./TicketDetail";

export function TicketDetailPage({ ticketId }: { ticketId: string }) {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <TicketDetail ticketId={ticketId} accessToken={session.tokens.accessToken} />
    </>
  );
}
