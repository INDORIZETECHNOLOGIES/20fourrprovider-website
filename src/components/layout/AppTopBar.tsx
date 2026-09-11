"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearSession, useSession } from "@/lib/auth/session";
import { getUnreadNotificationCount } from "@/lib/api/notifications";
import styles from "./AppTopBar.module.css";

export function AppTopBar() {
  const router = useRouter();
  const session = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getUnreadNotificationCount(session.tokens.accessToken)
      .then((result) => {
        if (!cancelled) setUnreadCount(result.unreadCount);
      })
      .catch(() => {
        // A failed badge fetch shouldn't block the rest of the page.
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  function handleSignOut() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className={styles.bar}>
      <p className={styles.wordmark}>20fourr</p>
      <div className={styles.right}>
        <Link href="/notifications" className={styles.notifications}>
          Notifications
          {unreadCount > 0 ? <span className={styles.badge}>{unreadCount}</span> : null}
        </Link>
        <button type="button" className={styles.signOut} onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
