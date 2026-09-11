"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { NewTicketForm } from "@/components/tickets/NewTicketForm";

export default function NewTicketPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <NewTicketForm accessToken={session.tokens.accessToken} />
    </>
  );
}
