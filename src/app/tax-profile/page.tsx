"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { TaxProfilePanel } from "@/components/taxProfile/TaxProfilePanel";

export default function TaxProfilePage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Tax profile">
      <TaxProfilePanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
