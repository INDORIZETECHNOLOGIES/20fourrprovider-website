"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { LicencesPanel } from "@/components/profile/LicencesPanel";

export default function LicencesPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Licences">
      <LicencesPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
