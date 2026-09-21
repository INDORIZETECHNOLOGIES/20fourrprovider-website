"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { PublicProfilePanel } from "@/components/profile/PublicProfilePanel";

export default function PublicProfilePage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Public profile">
      <PublicProfilePanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
