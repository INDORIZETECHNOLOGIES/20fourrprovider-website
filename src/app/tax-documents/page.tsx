"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { TaxDocumentsPanel } from "@/components/taxDocuments/TaxDocumentsPanel";

export default function TaxDocumentsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Tax documents">
      <TaxDocumentsPanel accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
