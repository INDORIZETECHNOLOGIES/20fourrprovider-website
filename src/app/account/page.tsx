"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { AccountPanel } from "@/components/account/AccountPanel";

export default function AccountPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Account">
      <AccountPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
