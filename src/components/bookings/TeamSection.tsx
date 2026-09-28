"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/client";
import { headcountOf, type Booking } from "@/lib/api/bookings";
import {
  assignTeam,
  listPersonnel,
  replaceTeamMember,
  teamErrorMessage,
  type Person,
  type PersonnelCategory,
} from "@/lib/api/personnel";
import { PERSONNEL_CATEGORY_LABELS, blockReasonFor } from "@/lib/team";
import { PersonAvatar } from "@/components/team/PersonAvatar";
import styles from "./TeamSection.module.css";

// Spec 0017 rule 10 / build decision 5: the team can be set or changed from acceptance until duty
// starts. After that it's a record of who went.
const EDITABLE: Booking["status"][] = ["provider_accepted", "payment_pending", "payment_done"];
const SHOWN: Booking["status"][] = [...EDITABLE, "duty_started", "duty_ended", "completed", "disputed"];

type Props = {
  booking: Pick<Booking, "_id" | "status" | "serviceCategory" | "headcount" | "assignedPersonnel" | "endDate">;
  isVerified: boolean;
  accessToken: string;
  onAssigned: (activeIds: string[]) => void;
};

export function TeamSection({ booking, isVerified, accessToken, onAssigned }: Props) {
  const [roster, setRoster] = useState<Person[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [mode, setMode] = useState<"view" | "pick">("view");
  const [picked, setPicked] = useState<string[]>([]);
  const [replacing, setReplacing] = useState<{ outgoing: string; incoming: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = booking.serviceCategory as PersonnelCategory;
  const needed = headcountOf(booking);
  const activeIds = useMemo(
    () => (booking.assignedPersonnel ?? []).filter((a) => !a.replacedAt).map((a) => a.personnelId),
    [booking.assignedPersonnel],
  );
  const editable = EDITABLE.includes(booking.status) && isVerified;
  const shown = SHOWN.includes(booking.status);

  useEffect(() => {
    if (!shown) return;
    let cancelled = false;
    listPersonnel(accessToken)
      .then(({ personnel }) => {
        if (!cancelled) setRoster(personnel);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, shown]);

  if (!shown) return null;

  const byId = new Map((roster ?? []).map((p) => [p.personnelId, p]));
  const candidates = (roster ?? []).filter((p) => p.status === "active" && p.category === category);
  const reasonFor = (p: Person) => blockReasonFor(p, booking.endDate);
  const ready = candidates.filter((p) => !reasonFor(p));
  // Pickable people first; the blocked ones follow, with the reason, so the fix is visible.
  const ordered = [...ready, ...candidates.filter((p) => reasonFor(p))];
  const spare = ready.filter((p) => !activeIds.includes(p.personnelId));
  const many = PERSONNEL_CATEGORY_LABELS[category]?.many.toLowerCase() ?? "people";
  const one = PERSONNEL_CATEGORY_LABELS[category]?.one.toLowerCase() ?? "person";

  const fail = (err: unknown) =>
    setError(
      (err instanceof ApiError && teamErrorMessage(err.code)) ||
        (err instanceof Error ? err.message : "Couldn't update the team. Try again."),
    );

  async function saveTeam() {
    setBusy(true);
    setError(null);
    try {
      const { assigned } = await assignTeam(booking._id, picked, accessToken);
      onAssigned(assigned);
      setMode("view");
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function saveReplacement() {
    if (!replacing?.incoming) return;
    setBusy(true);
    setError(null);
    try {
      const { assigned } = await replaceTeamMember(booking._id, replacing.outgoing, replacing.incoming, accessToken);
      onAssigned(assigned);
      setReplacing(null);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : current.length < needed ? [...current, id] : current,
    );
  }

  const startPicking = () => {
    setPicked(activeIds.filter((id) => {
      const p = byId.get(id);
      return p && !reasonFor(p);
    }));
    setError(null);
    setMode("pick");
  };

  return (
    <section className={styles.section} aria-labelledby="team-title">
      <div className={styles.head}>
        <h2 id="team-title" className={styles.title}>
          Team
        </h2>
        {mode === "view" && editable && activeIds.length > 0 && roster ? (
          <button type="button" className={styles.quiet} onClick={startPicking}>
            Change team
          </button>
        ) : null}
      </div>

      {loadError ? <p className={styles.error}>Couldn&apos;t load your team. Refresh to try again.</p> : null}
      {!roster && !loadError ? <p className={styles.muted}>Loading your team…</p> : null}

      {roster && mode === "view" && activeIds.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.lead}>
            {editable
              ? `Choose the ${needed === 1 ? one : `${needed} ${many}`} going. The client sees who's coming before they pay.`
              : `No team was assigned to this booking.`}
          </p>
          {editable && ready.length < needed ? (
            <p className={styles.muted}>
              You have {ready.length} {ready.length === 1 ? one : many} ready to assign; this booking needs {needed}.{" "}
              <Link href="/team" className={styles.link}>
                Add people or update documents
              </Link>
            </p>
          ) : null}
          {editable && ready.length > 0 ? (
            <button type="button" className={styles.primary} onClick={startPicking}>
              Assign team
            </button>
          ) : null}
          {!isVerified && EDITABLE.includes(booking.status) ? (
            <p className={styles.muted}>Assigning a team opens once your documents are verified.</p>
          ) : null}
        </div>
      ) : null}

      {roster && mode === "view" && activeIds.length > 0 ? (
        <ul className={styles.list}>
          {activeIds.map((id) => {
            const person = byId.get(id);
            const isReplacing = replacing?.outgoing === id;
            const swaps = spare;
            return (
              <li key={id} className={styles.member}>
                <div className={styles.memberRow}>
                  <PersonAvatar name={person?.fullName ?? "?"} photoUrl={person?.photoUrl ?? null} size={36} />
                  <div className={styles.memberText}>
                    <p className={styles.memberName}>{person?.fullName ?? "Someone no longer on your team"}</p>
                    {person ? (
                      <p className={styles.muted}>
                        {person.yearsExperience} {person.yearsExperience === 1 ? "year" : "years"}
                        {person.phone ? ` · ${person.phone}` : ""}
                      </p>
                    ) : null}
                  </div>
                  {editable && !isReplacing && swaps.length > 0 ? (
                    <button
                      type="button"
                      className={styles.quiet}
                      aria-label={`Replace ${person?.fullName ?? "this person"}`}
                      onClick={() => {
                        setError(null);
                        setReplacing({ outgoing: id, incoming: "" });
                      }}
                    >
                      Replace
                    </button>
                  ) : null}
                </div>
                {isReplacing ? (
                  <div className={styles.replace}>
                    <label className={styles.replaceLabel} htmlFor={`replace-${id}`}>
                      Send instead
                    </label>
                    <select
                      id={`replace-${id}`}
                      className={styles.select}
                      value={replacing.incoming}
                      disabled={busy}
                      onChange={(e) => setReplacing({ outgoing: id, incoming: e.target.value })}
                    >
                      <option value="" disabled>
                        Choose someone
                      </option>
                      {swaps.map((p) => (
                        <option key={p.personnelId} value={p.personnelId}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                    <button type="button" className={styles.primary} disabled={busy || !replacing.incoming} onClick={saveReplacement}>
                      {busy ? "Swapping…" : "Confirm swap"}
                    </button>
                    <button type="button" className={styles.quiet} disabled={busy} onClick={() => setReplacing(null)}>
                      Cancel
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {roster && mode === "view" && activeIds.length > 0 && editable && spare.length === 0 ? (
        <p className={styles.muted}>
          No other {many} are ready to swap in.{" "}
          <Link href="/team" className={styles.link}>
            Your team
          </Link>
        </p>
      ) : null}

      {roster && mode === "pick" ? (
        <div className={styles.pick}>
          <p className={styles.lead}>
            Choose {needed === 1 ? `the ${one}` : `${needed} ${many}`}.{" "}
            <span className={styles.count}>
              {picked.length} of {needed} chosen
            </span>
          </p>
          <ul className={styles.list} aria-label={`Your ${many}`}>
            {ordered.map((p) => {
              const reason = reasonFor(p);
              const checked = picked.includes(p.personnelId);
              const disabled = busy || Boolean(reason) || (!checked && picked.length >= needed);
              return (
                <li key={p.personnelId}>
                  <label className={`${styles.option} ${reason ? styles.optionBlocked : ""}`}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(p.personnelId)} />
                    <PersonAvatar name={p.fullName} photoUrl={p.photoUrl} size={32} />
                    <span className={styles.memberText}>
                      <span className={styles.memberName}>{p.fullName}</span>
                      <span className={reason ? styles.blocked : styles.muted}>
                        {reason ?? `${p.yearsExperience} ${p.yearsExperience === 1 ? "year" : "years"}${p.languages.length ? ` · ${p.languages.join(", ")}` : ""}`}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {candidates.length === 0 ? (
            <p className={styles.muted}>
              No {many} on your team yet.{" "}
              <Link href="/team" className={styles.link}>
                Add them
              </Link>
            </p>
          ) : null}
          <div className={styles.actions}>
            <button type="button" className={styles.primary} disabled={busy || picked.length !== needed} onClick={saveTeam}>
              {busy ? "Saving…" : "Save team"}
            </button>
            <button type="button" className={styles.quiet} disabled={busy} onClick={() => setMode("view")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
