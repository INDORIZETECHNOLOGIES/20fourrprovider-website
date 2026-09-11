"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth/session";
import styles from "./AppTopBar.module.css";

export function AppTopBar() {
  const router = useRouter();

  function handleSignOut() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className={styles.bar}>
      <p className={styles.wordmark}>20fourr</p>
      <button type="button" className={styles.signOut} onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}
