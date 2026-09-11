"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { TaxProfilePanel } from "@/components/taxProfile/TaxProfilePanel";

export default function TaxProfilePage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <TaxProfilePanel accessToken={session.tokens.accessToken} />
    </>
  );
}
