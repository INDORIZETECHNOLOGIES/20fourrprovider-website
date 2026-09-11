"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { TicketsPanel } from "@/components/tickets/TicketsPanel";

export default function TicketsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <TicketsPanel accessToken={session.tokens.accessToken} />
    </>
  );
}
