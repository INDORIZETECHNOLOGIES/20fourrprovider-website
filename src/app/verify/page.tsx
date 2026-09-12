"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { getProviderProfile, isProfileComplete } from "@/lib/api/provider";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { VerificationPanel } from "@/components/verification/VerificationPanel";

// Sits between registration (or a login that comes back with
// requiresVerification) and profile setup. Uses AppTopBar rather than AppShell
// for the same reason profile/setup does — a sidebar full of feature links is
// premature this early, see CLAUDE.md.
export default function VerifyPage() {
  const router = useRouter();
  const session = useSession();

  useRedirectIfLoggedOut();

  const goNext = useCallback(() => {
    if (!session) return;
    getProviderProfile(session.tokens.accessToken)
      .then(({ profile }) => {
        router.replace(isProfileComplete(profile) ? "/dashboard" : "/profile/setup");
      })
      .catch(() => {
        // Can't tell whether the profile is complete — /profile/setup is the safe
        // default either way, since it redirects to /dashboard itself if the
        // profile turns out to already be done.
        router.replace("/profile/setup");
      });
  }, [session, router]);

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <VerificationPanel accessToken={session.tokens.accessToken} onDone={goNext} />
    </>
  );
}
