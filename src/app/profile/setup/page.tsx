"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { getProviderProfile, isProfileComplete } from "@/lib/api/provider";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { ProfileSetupForm } from "@/components/profile/ProfileSetupForm";

export default function ProfileSetupPage() {
  const router = useRouter();
  const session = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    getProviderProfile(session.tokens.accessToken)
      .then(({ profile }) => {
        if (cancelled) return;
        if (isProfileComplete(profile)) {
          router.replace("/dashboard");
        } else {
          setReady(true);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        // Can't tell whether a profile exists — let the provider try to
        // submit rather than getting stuck on a background check failing.
        console.error("Failed to check for an existing provider profile", error);
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session, router]);

  if (!session || !ready) return null;

  return (
    <>
      <AppTopBar />
      <ProfileSetupForm accessToken={session.tokens.accessToken} />
    </>
  );
}
