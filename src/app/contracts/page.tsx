"use client";

import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { ContractsList } from "@/components/contracts/ContractsList";

export default function ContractsPage() {
  const session = useSession();

  useRedirectIfLoggedOut();

  if (!session) return null;

  return (
    <AppShell title="Contracts">
      <ContractsList accessToken={session.tokens.accessToken} />
    </AppShell>
  );
}
