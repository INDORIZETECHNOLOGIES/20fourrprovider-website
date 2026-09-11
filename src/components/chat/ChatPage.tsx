"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "./ChatPanel";

export function ChatPage({ bookingId }: { bookingId: string }) {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Chat">
      <ChatPanel bookingId={bookingId} accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
