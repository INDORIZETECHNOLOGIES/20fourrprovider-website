"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { RatingsPanel } from "@/components/ratings/RatingsPanel";

export default function RatingsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Your ratings">
      <RatingsPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
