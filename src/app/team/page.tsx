"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { TeamPanel } from "@/components/team/TeamPanel";

export default function TeamPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Your team">
      <TeamPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
