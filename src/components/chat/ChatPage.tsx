"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { ChatPanel } from "./ChatPanel";

export function ChatPage({ bookingId }: { bookingId: string }) {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <ChatPanel bookingId={bookingId} accessToken={session.tokens.accessToken} />
    </>
  );
}
