"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
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

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

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
            </>
          ) : (
            <p className={styles.subtext}>The rest of the provider dashboard is being built next.</p>
          )}
        </div>
      </main>
    </>
  );
}
