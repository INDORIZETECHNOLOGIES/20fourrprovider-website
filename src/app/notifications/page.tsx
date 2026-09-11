"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";

export default function NotificationsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Notifications">
      <NotificationsPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
