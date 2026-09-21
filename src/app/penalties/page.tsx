"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { PenaltiesPanel } from "@/components/penalties/PenaltiesPanel";

export default function PenaltiesPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Penalties">
      <PenaltiesPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
