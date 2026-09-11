"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { TaxDocumentsPanel } from "@/components/taxDocuments/TaxDocumentsPanel";

export default function TaxDocumentsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <>
      <AppTopBar />
      <TaxDocumentsPanel accessToken={session.tokens.accessToken} />
    </>
  );
}
