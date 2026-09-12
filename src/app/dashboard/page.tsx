"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, useRedirectIfLoggedOut } from "@/lib/auth/session";
import {
  getProviderProfile,
  isProfileComplete,
  SERVICE_CATEGORY_LABELS,
  type ProviderProfile,
} from "@/lib/api/provider";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONE, type BookingStatus } from "@/lib/constants/bookingStatus";
import { listBookings, type Booking } from "@/lib/api/bookings";
import { listSettlements } from "@/lib/api/settlements";
import { setAvailability } from "@/lib/api/availability";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import styles from "./page.module.css";

// Only the latest page of released settlements is summed — an all-time total
// would need every page loaded (see the Earnings note in CLAUDE.md), so the
// card says which sample it covers instead of implying a lifetime figure.
const PAYOUT_SAMPLE = 50;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCompactPaise(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function statusPillClass(status: BookingStatus): string {
  switch (BOOKING_STATUS_TONE[status]) {
    case "action":
      return styles.statusPillPending;
    case "active":
      return styles.statusPillAccepted;
    case "danger":
      return styles.statusPillRejected;
    default:
      return styles.statusPillCompleted;
  }
}

// One readable sentence, e.g. "Security guard and bouncer in Pune, Maharashtra,
// with 5 years of experience." — rather than a dot-separated meta string.
function profileSummary(profile: ProviderProfile): string | null {
  const labels = profile.serviceCategories.map((category, i) => {
    const label = SERVICE_CATEGORY_LABELS[category];
    return i === 0 ? label : label.charAt(0).toLowerCase() + label.slice(1);
  });
  if (labels.length === 0) return null;

  const services =
    labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
  const place = [profile.serviceCity, profile.serviceState].filter(Boolean).join(", ");
  const years = profile.yearsExperience;

  return `${services}${place ? ` in ${place}` : ""}${
    years ? `, with ${years} ${years === 1 ? "year" : "years"} of experience` : ""
  }.`;
}

type PayoutSummary = { paise: number; counted: number; total: number };

type EmptyCopy = { title: string; body: string; action?: { href: string; label: string } };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const session = useSession();

  const [profile, setProfile] = useState<ProviderProfile | null | "loading">("loading");
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [payouts, setPayouts] = useState<PayoutSummary | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[] | null>(null);
  const [availToggling, setAvailToggling] = useState(false);

  useRedirectIfLoggedOut();

  useEffect(() => {
    if (!session) return;
    const token = session.tokens.accessToken;
    let cancelled = false;

    getProviderProfile(token)
      .then(({ profile: p }) => {
        if (cancelled) return;
        if (!isProfileComplete(p)) {
          router.replace("/profile/setup");
          return;
        }
        setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    listBookings(token, { status: "pending", limit: 1 })
      .then(({ pagination }) => {
        if (!cancelled) setPendingCount(pagination.total);
      })
      .catch(() => {});

    // "Confirmed" = paid and not yet finished — the bookings a provider has to
    // turn up for. The list endpoint filters by a single status, hence two calls.
    Promise.all([
      listBookings(token, { status: "payment_done", limit: 1 }),
      listBookings(token, { status: "duty_started", limit: 1 }),
    ])
      .then(([paid, onDuty]) => {
        if (!cancelled) setConfirmedCount(paid.pagination.total + onDuty.pagination.total);
      })
      .catch(() => {});

    listSettlements(token, { state: "released", limit: PAYOUT_SAMPLE })
      .then(({ settlements, pagination }) => {
        if (cancelled) return;
        setPayouts({
          paise: settlements.reduce((sum, s) => sum + (s.netPaise ?? 0), 0),
          counted: settlements.length,
          total: pagination.total,
        });
      })
      .catch(() => {});

    listBookings(token, { limit: 5 })
      .then(({ bookings }) => {
        if (!cancelled) setRecentBookings(bookings);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session, router]);

  async function handleAvailabilityToggle(next: boolean) {
    if (!session || !profile || profile === "loading") return;
    setAvailToggling(true);
    try {
      await setAvailability(next, session.tokens.accessToken);
      setProfile((prev) =>
        prev && prev !== "loading"
          ? { ...prev, availability: { ...prev.availability, isAvailable: next } }
          : prev,
      );
    } catch {
      // Silently ignore — the provider can use /availability for full control.
    } finally {
      setAvailToggling(false);
    }
  }

  if (!session || profile === "loading") return null;

  const isAvailable = profile ? profile.availability.isAvailable : false;
  const summary = profile ? profileSummary(profile) : null;

  // Tell the provider what's actually standing between them and their first
  // request, instead of a generic "nothing here".
  const emptyBookings: EmptyCopy = !profile
    ? { title: "No bookings yet", body: "Requests from clients will appear here." }
    : !profile.isVerified
      ? {
          title: "No bookings yet",
          body: "Clients can book you once your documents are verified.",
          action: { href: "/documents", label: "Check your documents" },
        }
      : !isAvailable
        ? {
            title: "No bookings yet",
            body: "You're paused, so clients can't find you. Switch your availability back on above to start receiving requests.",
          }
        : { title: "No bookings yet", body: "You're visible to clients — new requests will show up here." };

  return (
    <AppShell title="Dashboard">
      <div className={styles.content}>
        {/* Welcome greeting */}
        <div className={styles.greeting}>
          <h1 className={styles.greetingText}>Welcome back, {session.name.split(" ")[0]}.</h1>
          {summary ? <p className={styles.greetingMeta}>{summary}</p> : null}
        </div>

        {/* ── Stat cards ── */}
        <div className={styles.statRow}>
          <Link
            href="/bookings?status=pending"
            className={`${styles.statCard} ${styles.statCardAccentPending}`}
          >
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
                  ? "Nothing waiting on you"
                  : "Waiting for your response"}
            </p>
          </Link>

          <Link href="/bookings" className={`${styles.statCard} ${styles.statCardAccentActive}`}>
            <p className={styles.statLabel}>Confirmed bookings</p>
            {confirmedCount === null ? (
              <div className={styles.statSkeleton} />
            ) : (
              <p className={styles.statValue}>{confirmedCount}</p>
            )}
            <p className={styles.statSub}>
              {confirmedCount === null
                ? "Loading…"
                : confirmedCount === 0
                  ? "Nothing scheduled yet"
                  : "Paid and scheduled"}
            </p>
          </Link>

          <Link href="/earnings" className={`${styles.statCard} ${styles.statCardAccentEarnings}`}>
            <p className={styles.statLabel}>Paid out</p>
            {payouts === null ? (
              <div className={styles.statSkeleton} />
            ) : (
              <p className={styles.statValue}>
                {payouts.total === 0 ? "—" : formatCompactPaise(payouts.paise)}
              </p>
            )}
            <p className={styles.statSub}>
              {payouts === null
                ? "Loading…"
                : payouts.total === 0
                  ? "No payouts released yet"
                  : payouts.total > payouts.counted
                    ? `Your latest ${payouts.counted} of ${payouts.total} payouts`
                    : `Across ${payouts.total} ${payouts.total === 1 ? "payout" : "payouts"}`}
            </p>
          </Link>
        </div>

        {/* ── Availability toggle ── */}
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Availability</h2>
          <Link href="/availability" className={styles.sectionLink}>
            Manage availability
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
          {recentBookings && recentBookings.length > 0 ? (
            <Link href="/bookings" className={styles.sectionLink}>
              View all bookings
            </Link>
          ) : null}
        </div>

        {recentBookings === null ? (
          <div className={styles.bookingsList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${styles.bookingRow} ${styles.bookingRowSkeleton}`}>
                <div className={styles.bookingRowLeft}>
                  <div className={`${styles.statSkeleton} ${styles.skeletonLine}`} />
                  <div className={`${styles.statSkeleton} ${styles.skeletonLineShort}`} />
                </div>
              </div>
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className={styles.emptyWrap}>
            <EmptyState icon="clipboard" {...emptyBookings} />
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {recentBookings.map((b) => (
              <Link key={b._id} href={`/bookings/${b._id}`} className={styles.bookingRow}>
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
                <Icon name="arrow-right" size={16} className={styles.bookingChevron} />
              </Link>
            ))}
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Quick actions</h2>
        </div>

        <div className={styles.actionsGrid}>
          <Link href="/documents" className={styles.actionCard}>
            <Icon name="file" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Documents</span>
            <p className={styles.actionSub}>Upload KYC &amp; certificates</p>
          </Link>
          <Link href="/availability" className={styles.actionCard}>
            <Icon name="calendar" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Availability</span>
            <p className={styles.actionSub}>Set working hours &amp; days off</p>
          </Link>
          <Link href="/bookings" className={styles.actionCard}>
            <Icon name="clipboard" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>All bookings</span>
            <p className={styles.actionSub}>Review, accept &amp; manage</p>
          </Link>
          <Link href="/earnings" className={styles.actionCard}>
            <Icon name="receipt" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Earnings</span>
            <p className={styles.actionSub}>Settlements &amp; payouts</p>
          </Link>
          <Link href="/ratings" className={styles.actionCard}>
            <Icon name="star" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Ratings</span>
            <p className={styles.actionSub}>What clients say about you</p>
          </Link>
          <Link href="/tax-profile" className={styles.actionCard}>
            <Icon name="percent" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Tax profile</span>
            <p className={styles.actionSub}>PAN, GST &amp; PSARA coverage</p>
          </Link>
          <Link href="/tickets" className={styles.actionCard}>
            <Icon name="chat" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Support</span>
            <p className={styles.actionSub}>Raise or track tickets</p>
          </Link>
          <Link href="/account" className={styles.actionCard}>
            <Icon name="gear" size={22} className={styles.actionIcon} />
            <span className={styles.actionLabel}>Account</span>
            <p className={styles.actionSub}>Privacy, data &amp; settings</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
