"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { AccountPanel } from "@/components/account/AccountPanel";

export default function AccountPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <AccountPanel accessToken={session.tokens.accessToken} />
    </>
  );
}
