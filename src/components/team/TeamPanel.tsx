"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { Stars } from "@/components/ui/Stars";
import { Switch } from "@/components/ui/Switch";
import { listPersonnel, PERSONNEL_CATEGORIES, type Person, type PersonnelCategory } from "@/lib/api/personnel";
import { getProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import { PERSONNEL_CATEGORY_LABELS, blockReason } from "@/lib/team";
import { AddPersonForm } from "./AddPersonForm";
import { PersonAvatar } from "./PersonAvatar";
import { PersonEditor } from "./PersonEditor";
import styles from "./Team.module.css";

type Filter = PersonnelCategory | "all";

export function TeamPanel({ accessToken }: { accessToken: string }) {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProviderProfile(accessToken)
      .then(({ profile }) => {
        if (cancelled) return;
        setProfile(profile);
        if (profile.providerType !== "firm") return;
        return listPersonnel(accessToken).then(({ personnel }) => {
          if (!cancelled) {
            setPeople(personnel);
            setError(null);
          }
        });
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your team. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, attempt]);

  const upsert = (person: Person) =>
    setPeople((current) => {
      const list = current ?? [];
      return list.some((p) => p.personnelId === person.personnelId)
        ? list.map((p) => (p.personnelId === person.personnelId ? person : p))
        : [person, ...list];
    });

  const visible = useMemo(
    () =>
      (people ?? []).filter(
        (p) => (showInactive || p.status === "active") && (filter === "all" || p.category === filter),
      ),
    [people, filter, showInactive],
  );

  const active = (people ?? []).filter((p) => p.status === "active");
  const ready = active.filter((p) => p.assignable).length;
  const counts = Object.fromEntries(
    PERSONNEL_CATEGORIES.map((c) => [c, active.filter((p) => p.category === c).length]),
  ) as Record<PersonnelCategory, number>;
  const inactiveCount = (people ?? []).length - active.length;

  if (profile && profile.providerType !== "firm") {
    return (
      <div className={styles.page}>
        <div className={styles.column}>
          <PageHeader title="Your team" />
          <EmptyState
            icon="person-shield"
            title="Teams are for agencies"
            body="An agency keeps a roster of the people it sends on jobs. As an individual provider, you're the one clients book."
            action={{ href: "/profile", label: "Back to profile" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Your team"
          intro="The people you send on jobs. Once you assign someone to a booking, the client sees their photo, first initial, experience and languages; their full name and phone only after paying."
        />

        {error ? (
          <Banner>
            {error}{" "}
            <button type="button" className={styles.inlineLink} onClick={() => setAttempt((n) => n + 1)}>
              Retry
            </button>
          </Banner>
        ) : null}

        {people === null && !error ? <div className={styles.skeleton} aria-busy="true" aria-label="Loading your team" /> : null}

        {people !== null ? (
          <>
            <div className={styles.toolbar}>
              <p className={styles.summary}>
                {active.length === 0
                  ? "No one on your team yet."
                  : `${active.length} ${active.length === 1 ? "person" : "people"} · ${ready} ready to assign`}
              </p>
              {!adding ? (
                <button type="button" className={styles.primaryButton} onClick={() => setAdding(true)}>
                  <Icon name="plus" size={16} />
                  Add a person
                </button>
              ) : null}
            </div>

            {adding ? (
              <AddPersonForm
                accessToken={accessToken}
                onCancel={() => setAdding(false)}
                onCreated={(person) => {
                  upsert(person);
                  setAdding(false);
                  setFilter("all");
                  setOpenId(person.personnelId);
                }}
              />
            ) : null}

            {people.length > 0 ? (
              <div className={styles.filterBar}>
                <div className={styles.filters} role="radiogroup" aria-label="Show">
                  {(["all", ...PERSONNEL_CATEGORIES] as Filter[]).map((f) =>
                    f === "all" || counts[f as PersonnelCategory] > 0 ? (
                      <button
                        key={f}
                        type="button"
                        role="radio"
                        aria-checked={filter === f}
                        className={`${styles.filter} ${filter === f ? styles.filterActive : ""}`}
                        onClick={() => setFilter(f)}
                      >
                        {f === "all" ? "Everyone" : PERSONNEL_CATEGORY_LABELS[f].many}
                        <span className={styles.filterCount}>{f === "all" ? active.length : counts[f]}</span>
                      </button>
                    ) : null,
                  )}
                </div>
                {inactiveCount > 0 ? (
                  <Switch id="show-inactive" label={`Show inactive (${inactiveCount})`} checked={showInactive} onChange={setShowInactive} />
                ) : null}
              </div>
            ) : null}

            {people.length === 0 && !adding ? (
              <EmptyState
                icon="person-shield"
                title="Add the people you send on jobs"
                body="Each needs a PSARA training certificate and police verification, and an arms licence for armed roles. Once they're in, you can assign them to bookings."
              />
            ) : null}

            {visible.length > 0 ? (
              <RowList>
                {visible.map((person) => {
                  const reason = blockReason(person);
                  const open = openId === person.personnelId;
                  return (
                    <div key={person.personnelId} className={`${styles.person} ${person.status === "inactive" ? styles.personInactive : ""}`}>
                      <button
                        type="button"
                        className={styles.personRow}
                        aria-expanded={open}
                        aria-controls={`person-${person.personnelId}`}
                        onClick={() => setOpenId(open ? null : person.personnelId)}
                      >
                        <PersonAvatar name={person.fullName} photoUrl={person.photoUrl} />
                        <span className={styles.personText}>
                          <span className={styles.personName}>{person.fullName}</span>
                          <span className={styles.personMeta}>
                            {PERSONNEL_CATEGORY_LABELS[person.category].one}
                            {` · ${person.yearsExperience} ${person.yearsExperience === 1 ? "year" : "years"}`}
                            {person.languages.length ? ` · ${person.languages.join(", ")}` : ""}
                          </span>
                          {reason ? <span className={styles.personReason}>{reason}</span> : null}
                        </span>
                        <span className={styles.personSide}>
                          {person.rating && person.rating.count > 0 ? (
                            <span className={styles.personRating}>
                              <Stars value={person.rating.average} size={13} />
                              <span className={styles.ratingCount}>{person.rating.count}</span>
                            </span>
                          ) : null}
                          {person.status === "inactive" ? (
                            <Badge tone="muted">Inactive</Badge>
                          ) : person.assignable ? (
                            <Badge tone="active">Ready</Badge>
                          ) : (
                            <Badge tone="action">Can&apos;t be assigned</Badge>
                          )}
                          <Icon name="chevron" size={16} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
                        </span>
                      </button>
                      {open ? (
                        <div id={`person-${person.personnelId}`}>
                          <PersonEditor
                            key={person.personnelId}
                            person={person}
                            accessToken={accessToken}
                            onUpdated={upsert}
                            onClose={() => setOpenId(null)}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </RowList>
            ) : null}

            {people.length > 0 && visible.length === 0 ? (
              <p className={styles.help}>No one matches this filter.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
