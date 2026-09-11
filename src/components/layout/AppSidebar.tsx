"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, useSession } from "@/lib/auth/session";
import styles from "./AppSidebar.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

type AppSidebarProps = {
  isVerified?: boolean;
  unreadCount?: number;
};

export function AppSidebar({ isVerified, unreadCount = 0 }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

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
    { href: "/dashboard", label: "Dashboard", icon: "⊞" },
    { href: "/bookings", label: "Bookings", icon: "📋" },
    { href: "/earnings", label: "Earnings", icon: "₹" },
    { href: "/availability", label: "Availability", icon: "🗓" },
    { href: "/documents", label: "Documents", icon: "📄" },
    {
      href: "/notifications",
      label: "Notifications",
      icon: "🔔",
      badge: unreadCount,
    },
  ];

  const accountNav: NavItem[] = [
    { href: "/tickets", label: "Support", icon: "💬" },
    { href: "/account", label: "Account", icon: "⚙" },
  ];

  const mobileNav: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: "⊞" },
    { href: "/bookings", label: "Bookings", icon: "📋" },
    { href: "/earnings", label: "Earnings", icon: "₹" },
    {
      href: "/notifications",
      label: "Alerts",
      icon: "🔔",
      badge: unreadCount,
    },
    { href: "/account", label: "Account", icon: "⚙" },
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
              <i className={styles.navIcon}>{item.icon}</i>
              {item.label}
              {item.badge ? (
                <span className={styles.navBadge}>{item.badge}</span>
              ) : null}
            </Link>
          ))}

          <span className={styles.navSection}>Settings</span>
          {accountNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
            >
              <i className={styles.navIcon}>{item.icon}</i>
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
          <button
            type="button"
            className={styles.signOutBtn}
            onClick={handleSignOut}
          >
            <i className={styles.navIcon}>↩</i>
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
            {item.badge ? (
              <span className={styles.mobileNavBadge}>{item.badge}</span>
            ) : null}
            <span className={styles.mobileNavIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
