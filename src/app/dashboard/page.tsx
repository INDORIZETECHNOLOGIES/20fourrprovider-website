"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useSession,
  useRedirectIfLoggedOut,
} from "@/lib/auth/session";
import {
  getProviderProfile,
  isProfileComplete,
  SERVICE_CATEGORY_LABELS,
  type ProviderProfile,
} from "@/lib/api/provider";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONE, type BookingStatus } from "@/lib/constants/bookingStatus";
import {
  listBookings,
  type Booking,
} from "@/lib/api/bookings";
import { listSettlements } from "@/lib/api/settlements";
import { getUnreadNotificationCount } from "@/lib/api/notifications";
import { setAvailability } from "@/lib/api/availability";
import { AppSidebar } from "@/components/layout/AppSidebar";
import styles from "./page.module.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPaise(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100_000)
    return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000)
    return `₹${(rupees / 1_000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function statusPillClass(status: BookingStatus): string {
  const tone = BOOKING_STATUS_TONE[status];
  switch (tone) {
    case "action":  return styles.statusPillPending;
    case "active":  return styles.statusPillAccepted;
    case "muted":   return styles.statusPillCompleted;
    case "danger":  return styles.statusPillRejected;
    default:        return styles.statusPillCompleted;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const session = useSession();

  const [profile, setProfile] = useState<ProviderProfile | null | "loading">("loading");
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [settledPaise, setSettledPaise] = useState<number | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availToggling, setAvailToggling] = useState(false);

  useRedirectIfLoggedOut();

  useEffect(() => {
    if (!session) return;
    const token = session.tokens.accessToken;
    let cancelled = false;

    // Profile
    getProviderProfile(token).then(({ profile: p }) => {
      if (cancelled) return;
      if (!isProfileComplete(p)) {
        router.replace("/profile/setup");
        return;
      }
      setProfile(p);
    }).catch(() => { if (!cancelled) setProfile(null); });

    // Pending bookings count
    listBookings(token, { status: "pending", limit: 1 }).then(({ pagination }) => {
      if (!cancelled) setPendingCount(pagination.total);
    }).catch(() => {});

    // Active bookings count (all statuses that mean "in-flight")
    listBookings(token, { status: "provider_accepted", limit: 1 }).then(({ pagination }) => {
      if (!cancelled) setActiveCount(pagination.total);
    }).catch(() => {});

    // Settled earnings (first page, sum netPaise)
    listSettlements(token, { state: "released", limit: 50 }).then(({ settlements }) => {
      if (!cancelled) {
        const total = settlements.reduce((sum, s) => sum + (s.netPaise ?? 0), 0);
        setSettledPaise(total);
      }
    }).catch(() => {});

    // Recent bookings (last 5 across all statuses)
    listBookings(token, { limit: 5 }).then(({ bookings }) => {
      if (!cancelled) setRecentBookings(bookings);
    }).catch(() => {});

    // Unread notifications
    getUnreadNotificationCount(token).then(({ unreadCount: c }) => {
      if (!cancelled) setUnreadCount(c);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [session, router]);

  async function handleAvailabilityToggle(next: boolean) {
    if (!session || !profile || profile === "loading") return;
    setAvailToggling(true);
    try {
      await setAvailability(next, session.tokens.accessToken);
      setProfile((prev) =>
        prev && prev !== "loading"
          ? { ...prev, availability: { ...prev.availability, isAvailable: next } }
          : prev
      );
    } catch {
      // Silently ignore — user can go to /availability for full control
    } finally {
      setAvailToggling(false);
    }
  }

  if (!session || profile === "loading") return null;

  const isVerified = profile ? profile.isVerified : false;
  const isAvailable = profile ? profile.availability.isAvailable : false;

  const serviceLabel =
    profile && profile.serviceCategories.length > 0
      ? profile.serviceCategories
          .map((c) => SERVICE_CATEGORY_LABELS[c])
          .join(", ")
      : null;

  const locationLabel =
    profile ? `${profile.serviceCity}, ${profile.serviceState}` : null;

  const expLabel =
    profile && profile.yearsExperience
      ? `${profile.yearsExperience} yr exp`
      : null;

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <AppSidebar isVerified={isVerified} unreadCount={unreadCount} />

      {/* Top header (mobile: wordmark; desktop: page title) */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.headerWordmark}>
          20fourr
        </Link>
        <h1 className={styles.headerPageTitle}>Dashboard</h1>
        <div className={styles.headerRight} />
      </header>

      <main className={styles.main}>
        {/* Welcome greeting */}
        <div className={styles.greeting}>
          <p className={styles.greetingText}>
            Welcome back, {session.name.split(" ")[0]}.
          </p>
          <p className={styles.greetingMeta}>
            {serviceLabel && <span>{serviceLabel}</span>}
            {serviceLabel && locationLabel && (
              <span className={styles.greetingPipe}>·</span>
            )}
            {locationLabel && <span>{locationLabel}</span>}
            {expLabel && (
              <>
                <span className={styles.greetingPipe}>·</span>
                <span>{expLabel}</span>
              </>
            )}
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className={styles.statRow}>
          <Link href="/bookings?status=pending" className={`${styles.statCard} ${styles.statCardAccentPending}`}>
            <p className={styles.statLabel}>Pending requests</p>
            {pendingCount === null ? (
              <div className={styles.statSkeleton} />
            ) : (
              <p className={styles.statValue}>{pendingCount}</p>
            )}
            <p className={styles.statSub}>
              {pendingCount === null
                ? "Loading…"
                : pendingCount === 0
                ? "No pending requests"
                : "Tap to review"}
            </p>
          </Link>

          <Link href="/bookings?status=accepted" className={`${styles.statCard} ${styles.statCardAccentActive}`}>
            <p className={styles.statLabel}>Active bookings</p>
            {activeCount === null ? (
              <div className={styles.statSkeleton} />
            ) : (
              <p className={styles.statValue}>{activeCount}</p>
            )}
            <p className={styles.statSub}>
              {activeCount === null
                ? "Loading…"
                : activeCount === 0
                ? "None in progress"
                : "Currently running"}
            </p>
          </Link>

          <Link href="/earnings" className={`${styles.statCard} ${styles.statCardAccentEarnings}`}>
            <p className={styles.statLabel}>Settled earnings</p>
            {settledPaise === null ? (
              <div className={styles.statSkeleton} />
            ) : (
              <p className={styles.statValue}>{settledPaise === 0 ? "—" : formatPaise(settledPaise)}</p>
            )}
            <p className={styles.statSub}>
              {settledPaise === null
                ? "Loading…"
                : settledPaise === 0
                ? "No settlements yet"
                : "From released settlements"}
            </p>
          </Link>
        </div>

        {/* ── Availability toggle ── */}
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Availability</h2>
          <Link href="/availability" className={styles.sectionLink}>
            Manage →
          </Link>
        </div>

        <div className={styles.availCard}>
          <div className={styles.availInfo}>
            <p className={styles.availTitle}>
              {isAvailable ? "You are accepting bookings" : "You are not accepting bookings"}
            </p>
            <p className={styles.availSubtext}>
              {isAvailable
                ? "Clients can discover and book you. Toggle off to pause."
                : "You are invisible to new clients. Toggle on to resume."}
            </p>
          </div>

          <button
            type="button"
            disabled={availToggling}
            onClick={() => handleAvailabilityToggle(!isAvailable)}
            className={`${styles.availStatus} ${isAvailable ? styles.availStatusOn : styles.availStatusOff}`}
            aria-label={isAvailable ? "Pause availability" : "Resume availability"}
          >
            <span className={styles.availStatusDot} />
            {availToggling ? "Saving…" : isAvailable ? "Available" : "Paused"}
          </button>
        </div>

        {/* ── Recent bookings ── */}
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent bookings</h2>
          <Link href="/bookings" className={styles.sectionLink}>
            View all →
          </Link>
        </div>

        <div className={styles.bookingsList}>
          {recentBookings === null ? (
            [1, 2, 3].map((i) => (
              <div key={i} className={styles.bookingRow} style={{ opacity: 0.5 }}>
                <div className={styles.bookingRowLeft}>
                  <div className={styles.statSkeleton} style={{ width: 120, marginBottom: 6 }} />
                  <div className={styles.statSkeleton} style={{ width: 80, height: "0.75rem" }} />
                </div>
              </div>
            ))
          ) : recentBookings.length === 0 ? (
            <div className={styles.emptyState}>
              No bookings yet. Once clients book you, they'll appear here.
            </div>
          ) : (
            recentBookings.map((b) => (
              <Link
                key={b._id}
                href={`/bookings/${b.bookingId}`}
                className={styles.bookingRow}
              >
                <div className={styles.bookingRowLeft}>
                  <p className={styles.bookingClient}>{b.clientId.name}</p>
                  <div className={styles.bookingMeta}>
                    <span className={styles.categoryBadge}>
                      {SERVICE_CATEGORY_LABELS[b.serviceCategory]}
                    </span>
                    <span>
                      {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </span>
                  </div>
                </div>
                <span className={`${styles.statusPill} ${statusPillClass(b.status)}`}>
                  {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                </span>
                <span className={styles.bookingChevron}>›</span>
              </Link>
            ))
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Quick actions</h2>
        </div>

        <div className={styles.actionsGrid}>
          <Link href="/documents" className={styles.actionCard}>
            <span className={styles.actionIcon}>📄</span>
            <span className={styles.actionLabel}>Documents</span>
            <p className={styles.actionSub}>Upload KYC &amp; certificates</p>
          </Link>
          <Link href="/availability" className={styles.actionCard}>
            <span className={styles.actionIcon}>🗓</span>
            <span className={styles.actionLabel}>Availability</span>
            <p className={styles.actionSub}>Set working hours &amp; days off</p>
          </Link>
          <Link href="/bookings" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>All bookings</span>
            <p className={styles.actionSub}>Review, accept &amp; manage</p>
          </Link>
          <Link href="/earnings" className={styles.actionCard}>
            <span className={styles.actionIcon}>₹</span>
            <span className={styles.actionLabel}>Earnings</span>
            <p className={styles.actionSub}>Settlements &amp; payouts</p>
          </Link>
          <Link href="/tickets" className={styles.actionCard}>
            <span className={styles.actionIcon}>💬</span>
            <span className={styles.actionLabel}>Support</span>
            <p className={styles.actionSub}>Raise or track tickets</p>
          </Link>
          <Link href="/account" className={styles.actionCard}>
            <span className={styles.actionIcon}>⚙</span>
            <span className={styles.actionLabel}>Account</span>
            <p className={styles.actionSub}>Privacy, data &amp; settings</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
