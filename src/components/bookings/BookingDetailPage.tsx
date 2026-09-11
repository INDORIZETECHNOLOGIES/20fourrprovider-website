"use client";

import { useEffect, useState } from "react";
import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { getProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { BookingDetail } from "./BookingDetail";

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const session = useSession();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);

  useRedirectIfLoggedOut();

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    getProviderProfile(session.tokens.accessToken)
      .then(({ profile }) => {
        if (!cancelled) setProfile(profile);
      })
      .catch((error) => {
        console.error("Failed to load provider profile", error);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session || !profile) return null;

  return (
    <>
      <AppTopBar />
      <BookingDetail bookingId={bookingId} isVerified={profile.isVerified} accessToken={session.tokens.accessToken} />
    </>
  );
}
