"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { RatingsPanel } from "@/components/ratings/RatingsPanel";

export default function RatingsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <RatingsPanel accessToken={session.tokens.accessToken} />
    </>
  );
}
