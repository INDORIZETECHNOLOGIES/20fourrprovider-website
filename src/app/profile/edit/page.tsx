"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { EditDetailsPanel } from "@/components/profile/EditDetailsPanel";

export default function EditDetailsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Your details">
      <EditDetailsPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
