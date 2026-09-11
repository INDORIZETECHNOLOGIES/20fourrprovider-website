"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";

export default function NotificationsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <NotificationsPanel accessToken={session.tokens.accessToken} />
    </>
  );
}
