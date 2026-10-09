"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/session";

// The landing page is a server component; these are the two spots outside the nav that
// offer sign-in, swapped for a dashboard link once a provider's session is in the browser.

export function CloseAccountLine({ className }: { className?: string }) {
  const signedIn = useSession() !== null;
  return (
    <p className={className}>
      {signedIn ? (
        <>
          You&apos;re signed in. <Link href="/dashboard">Go to your dashboard</Link>
        </>
      ) : (
        <>
          Already registered? <Link href="/login">Sign in</Link>
        </>
      )}
    </p>
  );
}

export function FooterAccountLinks() {
  const signedIn = useSession() !== null;
  if (signedIn) return <Link href="/dashboard">Dashboard</Link>;
  return (
    <>
      <Link href="/login">Sign in</Link>
      <Link href="/register">Register</Link>
    </>
  );
}
