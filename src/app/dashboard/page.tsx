"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import styles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session) router.replace("/login");
  }, [session, router]);

  if (!session) return null;

  return (
    <main className={styles.main}>
      <div>
        <h1 className={styles.heading}>Welcome, {session.name}.</h1>
        <p className={styles.subtext}>The rest of the provider dashboard is being built next.</p>
      </div>
    </main>
  );
}
