"use client";

import { useEffect, useState } from "react";
import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { getProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentChecklist } from "@/components/documents/DocumentChecklist";

export default function DocumentsPage() {
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
    <AppShell title="Documents">
      <DocumentChecklist
        providerType={profile.providerType}
        initialDocuments={profile.documents ?? {}}
        accessToken={session.tokens.accessToken}
      />
    </AppShell>
  );
}
