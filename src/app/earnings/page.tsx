"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { EarningsPanel } from "@/components/earnings/EarningsPanel";

export default function EarningsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <EarningsPanel accessToken={session.tokens.accessToken} />
    </>
  );
}
