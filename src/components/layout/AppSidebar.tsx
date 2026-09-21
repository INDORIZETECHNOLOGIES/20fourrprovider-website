"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, useSession } from "@/lib/auth/session";
import { getProviderProfile } from "@/lib/api/provider";
import { getUnreadNotificationCount } from "@/lib/api/notifications";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./AppSidebar.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  const [isVerified, setIsVerified] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    const token = session.tokens.accessToken;
    let cancelled = false;

    getProviderProfile(token)
      .then(({ profile }) => {
        if (!cancelled) setIsVerified(profile.isVerified);
      })
      .catch(() => {});

    getUnreadNotificationCount(token)
      .then(({ unreadCount: count }) => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session]);

  const initials = session?.name
    ? session.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  function handleSignOut() {
    clearSession();
    router.push("/login");
  }

  const mainNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "grid" },
    { href: "/bookings", label: "Bookings", icon: "clipboard" },
    { href: "/earnings", label: "Earnings", icon: "receipt" },
    { href: "/availability", label: "Availability", icon: "calendar" },
    { href: "/documents", label: "Documents", icon: "file" },
    {
      href: "/notifications",
      label: "Notifications",
      icon: "bell",
      badge: unreadCount,
    },
  ];

  const complianceNav: NavItem[] = [
    { href: "/ratings", label: "Ratings", icon: "star" },
    { href: "/penalties", label: "Penalties", icon: "shield" },
    { href: "/tax-profile", label: "Tax profile", icon: "percent" },
    { href: "/tax-documents", label: "Tax documents", icon: "receipt" },
  ];

  const accountNav: NavItem[] = [
    { href: "/profile", label: "Profile", icon: "person-shield" },
    { href: "/tickets", label: "Support", icon: "chat" },
    { href: "/account", label: "Account", icon: "gear" },
  ];

  const mobileNav: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: "grid" },
    { href: "/bookings", label: "Bookings", icon: "clipboard" },
    { href: "/earnings", label: "Earnings", icon: "receipt" },
    {
      href: "/notifications",
      label: "Alerts",
      icon: "bell",
      badge: unreadCount,
    },
    // Profile is the hub; Account (photo, verification, password) is one tap in.
    { href: "/profile", label: "Profile", icon: "person-shield" },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        {/* Wordmark */}
        <Link href="/dashboard" className={styles.wordmark}>
          <div className={styles.brand}>
            20fourr<span className={styles.wordmarkDot} />
          </div>
        </Link>

        {/* Verification status */}
        <div
          className={`${styles.statusBadge} ${
            isVerified ? styles.statusBadgeVerified : styles.statusBadgePending
          }`}
        >
          <span
            className={`${styles.statusDot} ${
              isVerified ? styles.statusDotVerified : styles.statusDotPending
            }`}
          />
          {isVerified ? "Verified provider" : "Verification pending"}
        </div>

        {/* Main nav */}
        <nav className={styles.nav}>
          <span className={styles.navSection}>Main</span>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
            >
              <Icon name={item.icon} size={18} className={styles.navIcon} />
              {item.label}
              {item.badge ? (
                <span className={styles.navBadge}>{item.badge}</span>
              ) : null}
            </Link>
          ))}

          <span className={styles.navSection}>Compliance</span>
          {complianceNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
            >
              <Icon name={item.icon} size={18} className={styles.navIcon} />
              {item.label}
            </Link>
          ))}

          <span className={styles.navSection}>Settings</span>
          {accountNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
            >
              <Icon name={item.icon} size={18} className={styles.navIcon} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom user row + sign out */}
        <div className={styles.bottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{initials}</div>
            <span className={styles.userName}>{session?.name ?? "Provider"}</span>
          </div>
          <button type="button" className={styles.signOutBtn} onClick={handleSignOut}>
            <Icon name="logout" size={18} className={styles.navIcon} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav} aria-label="Main navigation">
        {mobileNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.mobileNavLinkActive : ""}`}
          >
            {item.badge ? <span className={styles.mobileNavBadge}>{item.badge}</span> : null}
            <Icon name={item.icon} size={20} className={styles.mobileNavIcon} />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
