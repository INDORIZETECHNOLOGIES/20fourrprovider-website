"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { ProfilePanel } from "@/components/profile/ProfilePanel";

export default function ProfilePage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Profile">
      <ProfilePanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
