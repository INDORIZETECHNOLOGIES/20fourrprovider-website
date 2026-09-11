"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { getProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { DocumentChecklist } from "@/components/documents/DocumentChecklist";

export default function DocumentsPage() {
  const router = useRouter();
  const session = useSession();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

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
  }, [session, router]);

  if (!session || !profile) return null;

  return (
    <>
      <AppTopBar />
      <DocumentChecklist
        providerType={profile.providerType}
        initialDocuments={profile.documents ?? {}}
        accessToken={session.tokens.accessToken}
      />
    </>
  );
}
