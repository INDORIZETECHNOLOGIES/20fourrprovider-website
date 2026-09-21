"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError } from "@/lib/api/client";
import { getProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import { getStaffAvailability, type StaffDay } from "@/lib/api/staffAvailability";
import { addMonths, monthKey, todayString } from "@/lib/staffCalendar";
import { DayEditor } from "./DayEditor";
import { RangeEditor } from "./RangeEditor";
import { StaffCalendar } from "./StaffCalendar";
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

  useEffect(() => {
    if (!isFirm) return;
    let cancelled = false;
    getStaffAvailability(accessToken, monthKey(view.year, view.month))
      .then((result) => {
        if (cancelled) return;
        setDays(new Map(result.staffAvailability.map((d) => [d.date, d])));
        setMaxStaff(result.maxStaff);
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
  }, [accessToken, isFirm, view.year, view.month, requestKey]);

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
                Your team size is {maxStaff}. A single day can&apos;t total more than that.
              </p>
            ) : null}

            <section className={styles.section} aria-label="Calendar">
              <StaffCalendar
                year={view.year}
                month={view.month}
                days={days}
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
