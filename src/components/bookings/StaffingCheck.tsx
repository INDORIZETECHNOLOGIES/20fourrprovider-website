"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCapacity } from "@/lib/api/capacity";
import { STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, type StaffCategory } from "@/lib/api/staffAvailability";
import { daysInclusive } from "@/lib/staffCalendar";
import { indiaDate, staffingShortfall, type Shortfall } from "@/lib/staffCapacity";
import styles from "./BookingDetail.module.css";

// The capacity endpoint answers at most 92 days per call; a longer request skips the preview and
// leaves the decision to the accept check.
const MAX_DAYS = 92;
const SHOWN = 4;

const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function reasonText(s: Shortfall): string {
  if (s.reason === "off") return `${dayLabel(s.date)} (marked off)`;
  if (s.reason === "unset") return `${dayLabel(s.date)} (not filled in)`;
  return `${dayLabel(s.date)} (${s.free} free)`;
}

type Props = {
  category: string;
  headcount: number;
  startDate: string;
  endDate: string;
  accessToken: string;
};

/**
 * Before an agency accepts a request for several people, whether its staff calendar can cover
 * every day. A preview only: the accept re-checks inside the booking lock, and that one decides.
 */
export function StaffingCheck({ category, headcount, startDate, endDate, accessToken }: Props) {
  const [result, setResult] = useState<{ shortfall: Shortfall[] } | null>(null);
  const from = indiaDate(startDate);
  const to = indiaDate(endDate);
  const span = daysInclusive(from, to);
  const checkable = STAFF_CATEGORIES.includes(category as StaffCategory) && span !== null && span <= MAX_DAYS;

  useEffect(() => {
    if (!checkable) return;
    let cancelled = false;
    getCapacity(accessToken, { category: category as StaffCategory, from, to })
      .then((r) => {
        if (!cancelled) setResult({ shortfall: staffingShortfall(r.days, headcount, r.requireStaffAvailabilityForBulk) });
      })
      .catch(() => {
        // A preview that can't load just isn't shown; accepting still checks.
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, category, checkable, from, to, headcount]);

  if (!checkable || !result) return null;
  const people = STAFF_CATEGORY_LABELS[category as StaffCategory].toLowerCase();
  const { shortfall } = result;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Staffing</h2>
      {shortfall.length === 0 ? (
        <p className={styles.staffingOk}>
          Your staff calendar has {headcount} {people} free on every day of this booking.
        </p>
      ) : (
        <>
          <p className={styles.staffingShort}>
            This request needs {headcount} {people} each day. You&apos;re short on{" "}
            {shortfall.slice(0, SHOWN).map(reasonText).join(", ")}
            {shortfall.length > SHOWN ? ` and ${shortfall.length - SHOWN} more days` : ""}.
          </p>
          <p className={styles.staffingHint}>
            Accepting will be refused until those days are covered.{" "}
            <Link href="/staff-availability">Update staff availability</Link>
          </p>
        </>
      )}
    </div>
  );
}
