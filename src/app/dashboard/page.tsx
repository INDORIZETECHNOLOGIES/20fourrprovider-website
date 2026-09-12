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
import { PROVIDER_DOCUMENT_CATALOG } from "@/lib/constants/providerDocuments";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONE, type BookingStatus } from "@/lib/constants/bookingStatus";
import { listBookings, type Booking } from "@/lib/api/bookings";
import { listSettlements } from "@/lib/api/settlements";
import { setAvailability } from "@/lib/api/availability";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Switch } from "@/components/ui/Switch";
import { Icon } from "@/components/ui/Icon";
import styles from "./page.module.css";

// Only the latest page of released settlements is summed — an all-time total
// would need every page loaded (see the Earnings note in CLAUDE.md), so the
// card says which sample it covers instead of implying a lifetime figure.
const PAYOUT_SAMPLE = 50;

// Enough of each confirmed status to find the next shift; the count shown on the
// ledger strip comes from `pagination.total`, not from this page of results.
const UPCOMING_SAMPLE = 20;

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

// The shift a provider needs to think about right now: one they're already on,
// otherwise the soonest paid booking that hasn't finished.
function pickNextShift(bookings: Booking[]): Booking | null {
  const onDuty = bookings.find((b) => b.status === "duty_started");
  if (onDuty) return onDuty;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    bookings
      .filter((b) => new Date(b.endDate).getTime() >= startOfToday.getTime())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] ?? null
  );
}

type SetupTask = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  action?: { href: string; label: string };
};

// What actually stands between a provider and their first booking. Every item is
// derived from the profile already fetched — no extra requests.
function setupTasks(profile: ProviderProfile): SetupTask[] {
  const required = PROVIDER_DOCUMENT_CATALOG.filter((d) => d.requiredFor[profile.providerType]);
  const uploaded = required.filter((d) => profile.documents?.[`${d.id}Url`]);
  const bank = profile.bankDetails;

  const bankTask: SetupTask = !bank?.accountNumber
    ? {
        id: "bank",
        label: "Payout bank account",
        detail: "Where your settlements are paid. Nothing can be released without it.",
        done: false,
        action: { href: "/earnings", label: "Add bank details" },
      }
    : !bank.verified
      ? {
          id: "bank",
          label: "Payout bank account",
          detail: `Account ending ${bank.accountNumber.slice(-4)} — our team is verifying it.`,
          done: false,
        }
      : !bank.confirmedByProvider
        ? {
            id: "bank",
            label: "Payout bank account",
            detail: "Verified. Confirm it's yours before the first payout can be released.",
            done: false,
            action: { href: "/earnings", label: "Confirm your account" },
          }
        : { id: "bank", label: "Payout bank account", detail: "Verified and confirmed.", done: true };

  return [
    {
      id: "profile",
      label: "Profile details",
      detail: "Services, city and experience — this is what clients search on.",
      done: true,
    },
    {
      id: "documents",
      label: "Identity documents",
      detail:
        uploaded.length === required.length
          ? `All ${required.length} required documents uploaded.`
          : `${uploaded.length} of ${required.length} required documents uploaded.`,
      done: uploaded.length === required.length,
      action:
        uploaded.length === required.length
          ? undefined
          : { href: "/documents", label: "Upload documents" },
    },
    bankTask,
    {
      id: "verification",
      label: "Account verification",
      detail: profile.isVerified
        ? "Verified — clients can find and book you."
        : "Our team reviews your documents once they're all in. You can't accept bookings until then.",
      done: profile.isVerified,
    },
  ];
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
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
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
      listBookings(token, { status: "payment_done", limit: UPCOMING_SAMPLE }),
      listBookings(token, { status: "duty_started", limit: UPCOMING_SAMPLE }),
    ])
      .then(([paid, onDuty]) => {
        if (cancelled) return;
        setConfirmedCount(paid.pagination.total + onDuty.pagination.total);
        setConfirmedBookings([...onDuty.bookings, ...paid.bookings]);
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
  const nextShift = pickNextShift(confirmedBookings);
  const tasks = profile ? setupTasks(profile) : [];
  const tasksDone = tasks.filter((t) => t.done).length;
  // The checklist earns its place only while something is still outstanding.
  const showSetup = tasks.length > 0 && tasksDone < tasks.length;

  // Tell the provider what's actually standing between them and their first
  // request, instead of a generic "nothing here". The setup checklist already
  // carries the verification call to action, so don't repeat it underneath.
  const emptyBookings: EmptyCopy = !profile
    ? { title: "No bookings yet", body: "Requests from clients will appear here." }
    : !profile.isVerified
      ? {
          title: "No bookings yet",
          body: "Clients can book you once your account is verified.",
          ...(showSetup ? {} : { action: { href: "/documents", label: "Check your documents" } }),
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
        <div className={styles.greeting}>
          <h1 className={styles.greetingText}>Welcome back, {session.name.split(" ")[0]}.</h1>
          {summary ? <p className={styles.greetingMeta}>{summary}</p> : null}
        </div>

        {/* ── The one thing that matters most: a shift to turn up for, or the
            work left before bookings can come in. ── */}
        {nextShift ? (
          <Link href={`/bookings/${nextShift._id}`} className={styles.shift}>
            <div className={styles.shiftDate}>
              <span className={styles.shiftDay}>
                {new Date(nextShift.startDate).toLocaleDateString("en-IN", { day: "numeric" })}
              </span>
              <span className={styles.shiftMonth}>
                {new Date(nextShift.startDate).toLocaleDateString("en-IN", { month: "short" })}
              </span>
            </div>

            <div className={styles.shiftBody}>
              <p className={styles.shiftKicker}>
                {nextShift.status === "duty_started" ? "On duty now" : "Next shift"}
              </p>
              <p className={styles.shiftTitle}>
                {SERVICE_CATEGORY_LABELS[nextShift.serviceCategory]} for {nextShift.clientId.name}
              </p>
              <p className={styles.shiftMeta}>
                {nextShift.startTime}–{nextShift.endTime}
                {nextShift.numberOfDays > 1 ? ` · ${nextShift.numberOfDays} days` : ""}
                {nextShift.address ? ` · ${nextShift.address}` : ""}
              </p>
            </div>

            <span className={styles.shiftAction}>
              Open booking
              <Icon name="arrow-right" size={16} />
            </span>
          </Link>
        ) : showSetup ? (
          <section className={styles.setup}>
            <div className={styles.setupHead}>
              <h2 className={styles.setupTitle}>Before clients can book you</h2>
              <p className={styles.setupProgress}>
                {tasksDone} of {tasks.length} done
              </p>
            </div>

            <ol className={styles.setupList}>
              {tasks.map((task) => (
                <li key={task.id} className={styles.setupItem}>
                  <span className={`${styles.setupMark} ${task.done ? styles.setupMarkDone : ""}`}>
                    {task.done ? <Icon name="check" size={13} /> : null}
                  </span>
                  <div>
                    <p className={`${styles.setupLabel} ${task.done ? styles.setupLabelDone : ""}`}>
                      {task.label}
                    </p>
                    <p className={styles.setupDetail}>{task.detail}</p>
                    {task.action ? (
                      <Link href={task.action.href} className={styles.setupAction}>
                        {task.action.label}
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* ── Counters, as one ledger strip rather than three floating cards ── */}
        <div className={styles.ledger}>
          <Link href="/bookings?status=pending" className={styles.ledgerCell}>
            <p className={styles.ledgerLabel}>Pending requests</p>
            {pendingCount === null ? (
              <div className={styles.skeleton} />
            ) : (
              <p className={styles.ledgerValue}>{pendingCount}</p>
            )}
            <p className={styles.ledgerSub}>
              {pendingCount === null
                ? "Loading…"
                : pendingCount === 0
                  ? "Nothing waiting on you"
                  : "Waiting for your response"}
            </p>
          </Link>

          <Link href="/bookings" className={styles.ledgerCell}>
            <p className={styles.ledgerLabel}>Confirmed bookings</p>
            {confirmedCount === null ? (
              <div className={styles.skeleton} />
            ) : (
              <p className={styles.ledgerValue}>{confirmedCount}</p>
            )}
            <p className={styles.ledgerSub}>
              {confirmedCount === null
                ? "Loading…"
                : confirmedCount === 0
                  ? "Nothing scheduled yet"
                  : "Paid and scheduled"}
            </p>
          </Link>

          <Link href="/earnings" className={styles.ledgerCell}>
            <p className={styles.ledgerLabel}>Paid out</p>
            {payouts === null ? (
              <div className={styles.skeleton} />
            ) : (
              <p className={styles.ledgerValue}>
                {payouts.total === 0 ? "—" : formatCompactPaise(payouts.paise)}
              </p>
            )}
            <p className={styles.ledgerSub}>
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

        {/* ── Availability ── */}
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Availability</h2>
          <Link href="/availability" className={styles.sectionLink}>
            Working hours and days off
          </Link>
        </div>

        <div className={styles.availRow}>
          <div>
            <p className={styles.availTitle}>
              {isAvailable ? "You are accepting bookings" : "You are not accepting bookings"}
            </p>
            <p className={styles.availSubtext}>
              {isAvailable
                ? "Clients can discover and book you. Switch off to pause."
                : "You're hidden from new clients. Switch on to resume."}
            </p>
          </div>

          <Switch
            id="dashboard-availability"
            label={availToggling ? "Saving…" : isAvailable ? "Available" : "Paused"}
            checked={isAvailable}
            disabled={availToggling}
            onChange={handleAvailabilityToggle}
          />
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
                  <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonLineShort}`} />
                </div>
              </div>
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <EmptyState icon="clipboard" {...emptyBookings} />
        ) : (
          <div className={styles.bookingsList}>
            {recentBookings.map((b) => (
              <Link key={b._id} href={`/bookings/${b._id}`} className={styles.bookingRow}>
                <div className={styles.bookingRowLeft}>
                  <p className={styles.bookingClient}>{b.clientId.name}</p>
                  <p className={styles.bookingMeta}>
                    {SERVICE_CATEGORY_LABELS[b.serviceCategory]} · {formatDate(b.startDate)} –{" "}
                    {formatDate(b.endDate)}
                  </p>
                </div>
                <span className={`${styles.statusPill} ${statusPillClass(b.status)}`}>
                  {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                </span>
                <Icon name="arrow-right" size={16} className={styles.bookingChevron} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
