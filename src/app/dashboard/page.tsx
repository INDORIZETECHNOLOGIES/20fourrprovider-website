"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import {
  getProviderProfile,
  isProfileComplete,
  SERVICE_CATEGORY_LABELS,
  type ProviderProfile,
} from "@/lib/api/provider";
import { AppTopBar } from "@/components/layout/AppTopBar";
import Link from "next/link";
import styles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const session = useSession();
  const [profile, setProfile] = useState<ProviderProfile | null | "loading">("loading");

  useRedirectIfLoggedOut();

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    getProviderProfile(session.tokens.accessToken)
      .then(({ profile }) => {
        if (cancelled) return;
        if (!isProfileComplete(profile)) {
          router.replace("/profile/setup");
        } else {
          setProfile(profile);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load provider profile", error);
        setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [session, router]);

  if (!session || profile === "loading") return null;

  return (
    <>
      <AppTopBar />
      <main className={styles.main}>
        <div>
          <h1 className={styles.heading}>Welcome, {session.name}.</h1>
          {profile ? (
            <>
              <p className={styles.subtext}>Your provider profile is set up.</p>
              <div className={styles.summary}>
                <span className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Services:</span>
                  {profile.serviceCategories.map((category) => SERVICE_CATEGORY_LABELS[category]).join(", ")}
                </span>
                <span className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Location:</span>
                  {profile.serviceCity}, {profile.serviceState}
                </span>
              </div>
              <Link href="/documents" className={styles.manageLink}>
                Manage documents
              </Link>
              <Link href="/availability" className={styles.manageLink}>
                Manage availability
              </Link>
              <Link href="/bookings" className={styles.manageLink}>
                View bookings
              </Link>
              <Link href="/earnings" className={styles.manageLink}>
                View earnings
              </Link>
              <Link href="/ratings" className={styles.manageLink}>
                Your ratings
              </Link>
              <Link href="/tax-profile" className={styles.manageLink}>
                Tax profile
              </Link>
              <Link href="/tax-documents" className={styles.manageLink}>
                Tax documents
              </Link>
              <Link href="/tickets" className={styles.manageLink}>
                Support
              </Link>
              <Link href="/account" className={styles.manageLink}>
                Account
              </Link>
            </>
          ) : (
            <p className={styles.subtext}>The rest of the provider dashboard is being built next.</p>
          )}
        </div>
      </main>
    </>
  );
}
