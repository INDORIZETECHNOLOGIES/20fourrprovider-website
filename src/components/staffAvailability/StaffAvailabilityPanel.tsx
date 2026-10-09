"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError } from "@/lib/api/client";
import { getProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import { getCapacity } from "@/lib/api/capacity";
import { getStaffAvailability, STAFF_CATEGORIES, type StaffDay } from "@/lib/api/staffAvailability";
import { addMonths, monthKey, toDateString, todayString } from "@/lib/staffCalendar";
import { mergeCapacity, withCalendarDay, type CapacityFilter, type DayLoad } from "@/lib/staffCapacity";
import { DayEditor } from "./DayEditor";
import { RangeEditor } from "./RangeEditor";
import { StaffCalendar } from "./StaffCalendar";
import { useLiveVersion } from "@/lib/live/accountEvents";
import styles from "./StaffAvailability.module.css";

const VERIFICATION_REQUIRED =
  "You can plan your headcount once your documents are verified. Until then this page is read-only.";

export function StaffAvailabilityPanel({ accessToken }: { accessToken: string }) {
  // Read once on mount: "today" and the visible month shouldn't shift mid-session.
  const [now] = useState(() => new Date());
  const today = todayString(now);

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [days, setDays] = useState<Map<string, StaffDay>>(new Map());
  const [maxStaff, setMaxStaff] = useState<number | null>(null);
  // Which request the current data belongs to, so "loading" is derived from a
  // key mismatch instead of being set synchronously inside the effect.
  const [settled, setSettled] = useState<{ key: string; error: string | null } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  // Booked headcount per date and category (spec 0011). Null until the first month loads; stays
  // empty if the capacity read fails, which only hides the booked figures.
  const [capacity, setCapacity] = useState<Map<string, DayLoad>>(new Map());
  const [requireBulk, setRequireBulk] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<CapacityFilter>("all");

  const isFirm = profile?.providerType === "firm";
  const requestKey = `${monthKey(view.year, view.month)}#${reloadKey}`;
  const loading = settled?.key !== requestKey;
  const monthError = settled?.key === requestKey ? settled.error : null;

  useEffect(() => {
    let cancelled = false;
    getProviderProfile(accessToken)
      .then(({ profile }) => {
        if (!cancelled) setProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setProfileError("Couldn't load your profile. Try refreshing.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // Booked counts move when a booking is accepted or cancelled; refetch in place, keeping the
  // month on screen (liveVersion is deliberately not part of requestKey, so no loading state).
  const liveVersion = useLiveVersion({ entities: ["booking", "contract"] });

  useEffect(() => {
    if (!isFirm) return;
    let cancelled = false;
    const from = toDateString(view.year, view.month, 1);
    const to = toDateString(view.year, view.month, new Date(view.year, view.month + 1, 0).getDate());
    // One capacity read per category — the endpoint takes one. A failed read drops only the
    // booked figures for that category, never the calendar itself.
    const capacityReads = Promise.all(
      STAFF_CATEGORIES.map((category) => getCapacity(accessToken, { category, from, to }).catch(() => null)),
    );
    Promise.all([getStaffAvailability(accessToken, monthKey(view.year, view.month)), capacityReads])
      .then(([result, reads]) => {
        if (cancelled) return;
        const ok = reads.filter((r) => r !== null);
        setDays(new Map(result.staffAvailability.map((d) => [d.date, d])));
        setMaxStaff(result.maxStaff);
        setCapacity(mergeCapacity(ok));
        if (ok[0]) setRequireBulk(ok[0].requireStaffAvailabilityForBulk);
        setSettled({ key: requestKey, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setSettled({
          key: requestKey,
          error: err instanceof ApiError ? err.message : "Couldn't load this month. Try again.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, isFirm, view.year, view.month, requestKey, liveVersion]);

  const loads = useMemo(() => {
    const dates = new Set([...capacity.keys(), ...days.keys()]);
    return new Map([...dates].map((date) => [date, withCalendarDay(capacity.get(date), days.get(date))]));
  }, [capacity, days]);

  // "All" plus each category the provider offers; ex-servicemen are counted in "All" only.
  const filters: CapacityFilter[] = [
    "all",
    ...STAFF_CATEGORIES.filter((c) => (profile?.serviceCategories as string[] | undefined)?.includes(c)),
  ];

  const readOnly = profile ? !profile.isVerified : true;
  const canGoBack = view.year * 12 + view.month > now.getFullYear() * 12 + now.getMonth();

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Staff availability"
          intro="How many of each kind of staff your agency can field on each date. Clients booking a team are matched against this."
        />

        {profileError ? <Banner>{profileError}</Banner> : null}

        {profile && !isFirm ? (
          <EmptyState
            icon="person-shield"
            title="Staff availability is for agencies"
            body="It tracks headcount across a team. As an individual provider you set the days you can't work under Availability."
            action={{ href: "/availability", label: "Go to Availability" }}
          />
        ) : null}

        {isFirm ? (
          <>
            {readOnly ? <Banner>{VERIFICATION_REQUIRED}</Banner> : null}
            {monthError ? <Banner>{monthError}</Banner> : null}

            {!loading && maxStaff == null ? (
              <p className={styles.sectionText}>
                You haven&apos;t set a team size, so there is no limit on a day&apos;s total. Add it under{" "}
                <Link href="/profile/public" className={styles.link}>
                  Public profile
                </Link>{" "}
                to cap it.
              </p>
            ) : maxStaff != null ? (
              <p className={styles.sectionText}>
                A single day can&apos;t total more than {maxStaff}, the number of personnel on your{" "}
                <Link href="/profile/public" className={styles.link}>
                  Public profile
                </Link>
                . Change it there if your agency has grown or shrunk.
              </p>
            ) : null}

            {requireBulk !== null ? (
              <p className={styles.sectionText}>
                {requireBulk
                  ? "Clients can book more than one person only on dates you've filled in. A one-person booking doesn't need the calendar."
                  : "Dates you haven't filled in are open to bookings of any size."}
              </p>
            ) : null}

            <section className={styles.section} aria-label="Calendar">
              <StaffCalendar
                loads={loads}
                filter={filter}
                filters={filters}
                onFilterChange={setFilter}
                year={view.year}
                month={view.month}
                selected={selected}
                today={today}
                loading={loading}
                canGoBack={canGoBack}
                onSelect={setSelected}
                onMonthChange={(delta) => {
                  setSelected(null);
                  setView((v) => addMonths(v.year, v.month, delta));
                }}
              />
            </section>

            {selected ? (
              <DayEditor
                key={selected}
                date={selected}
                day={days.get(selected)}
                booked={loads.get(selected)?.booked ?? {}}
                maxStaff={maxStaff}
                disabled={readOnly}
                accessToken={accessToken}
                onChanged={(date, day) => setDays((current) => new Map(current).set(date, day))}
                onClose={() => setSelected(null)}
              />
            ) : null}

            <RangeEditor
              today={today}
              maxStaff={maxStaff}
              disabled={readOnly}
              accessToken={accessToken}
              onApplied={() => setReloadKey((k) => k + 1)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
