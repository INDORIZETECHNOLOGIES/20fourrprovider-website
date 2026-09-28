"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Banner } from "@/components/ui/Banner";
import { Icon } from "@/components/ui/Icon";
import { ApiError } from "@/lib/api/client";
import type { ServiceCategory } from "@/lib/api/provider";
import { getCityRateCards, removeCity, saveCityRates, type CityOption, type CityRateCard as Card } from "@/lib/api/pricing";
import { GST_STATE_NAME_BY_CODE, GST_STATES } from "@/lib/constants/indianStates";
import {
  draftsEqual,
  hasErrors,
  pricedCount,
  toCityDraft,
  toRowsPayload,
  validateCityDraft,
  type CityDraft,
  type CityDraftErrors,
} from "@/lib/pricing/cityRates";
import { AddCityPanel } from "./AddCityPanel";
import { CityRateCard } from "./CityRateCard";
import styles from "./CityRates.module.css";

type CityRatesProps = {
  accessToken: string;
  offered: ServiceCategory[];
  /** The provider's own state name from their profile — the add-city panel starts there. */
  serviceState: string | null;
};

type CityMeta = { key: string; name: string; stateCode: string | null; isNew: boolean };
type Status = { tone: "error" | "info"; message: string } | null;

const ADD = "__add__";
const UNPLACED = "__unplaced__";
const NO_ERRORS: CityDraftErrors = { rows: {} };

function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

export function CityRates({ accessToken, offered, serviceState }: CityRatesProps) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [primaryKey, setPrimaryKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [added, setAdded] = useState<CityMeta[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CityDraft>>({});
  const [errors, setErrors] = useState<Record<string, CityDraftErrors>>({});
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [busy, setBusy] = useState<{ key: string; action: "save" | "remove" } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const load = useCallback(async () => {
    try {
      const { cities, primaryCityKey } = await getCityRateCards(accessToken);
      setLoadError(null);
      setCards(cities);
      setPrimaryKey(primaryCityKey);
      return cities;
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Couldn't load your rates.");
      return null;
    }
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    getCityRateCards(accessToken)
      .then(({ cities, primaryCityKey }) => {
        if (cancelled) return;
        setCards(cities);
        setPrimaryKey(primaryCityKey);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Couldn't load your rates.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const placed = useMemo(() => (cards ?? []).filter((c) => c.cityKey), [cards]);
  const unplaced = useMemo(() => (cards ?? []).find((c) => !c.cityKey) ?? null, [cards]);

  // Saved cities (primary first, then by name), then cities added this session.
  const cities: CityMeta[] = useMemo(() => {
    const saved = placed
      .map((c) => ({ key: c.cityKey!, name: c.cityName ?? c.cityKey!, stateCode: c.stateCode, isNew: false }))
      .sort((a, b) => (a.key === primaryKey ? -1 : b.key === primaryKey ? 1 : a.name.localeCompare(b.name)));
    return [...saved, ...added.filter((a) => !saved.some((s) => s.key === a.key))];
  }, [placed, added, primaryKey]);

  const savedCard = useCallback((key: string) => placed.find((c) => c.cityKey === key) ?? null, [placed]);
  const draftFor = useCallback((key: string) => drafts[key] ?? toCityDraft(savedCard(key)), [drafts, savedCard]);
  const isDirty = useCallback(
    (key: string) => Boolean(drafts[key]) && !draftsEqual(drafts[key], toCityDraft(savedCard(key))),
    [drafts, savedCard],
  );

  const current = selected ?? cities[0]?.key ?? ADD;
  const anyDirty = cities.some((c) => c.isNew || isDirty(c.key));

  // Leaving with unsaved rates asks first — a provider can easily type into two cities and forget one.
  useEffect(() => {
    if (!anyDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  function setStatus(key: string, status: Status) {
    setStatuses((s) => ({ ...s, [key]: status }));
  }

  function handleAdd(city: CityOption, copyFrom: string | null) {
    const source = copyFrom === UNPLACED ? unplaced : copyFrom ? (drafts[copyFrom] ? null : savedCard(copyFrom)) : null;
    const draft = copyFrom && drafts[copyFrom] ? drafts[copyFrom] : toCityDraft(source);
    setAdded((a) => [...a, { key: city.key, name: city.name, stateCode: city.stateCode, isNew: true }]);
    setDrafts((d) => ({ ...d, [city.key]: draft }));
    setSelected(city.key);
  }

  async function handleSave(meta: CityMeta) {
    const draft = draftFor(meta.key);
    const found = validateCityDraft(draft, offered);
    setErrors((e) => ({ ...e, [meta.key]: found }));
    if (hasErrors(found)) return setStatus(meta.key, { tone: "error", message: "Fix the highlighted fields." });

    const rows = toRowsPayload(draft, offered, savedCard(meta.key));
    if (rows.length === 0) {
      return setStatus(meta.key, { tone: "error", message: "Add a daily rate for at least one service." });
    }

    setBusy({ key: meta.key, action: "save" });
    setStatus(meta.key, null);
    try {
      await saveCityRates(meta.key, rows, accessToken);
      await load();
      setAdded((a) => a.filter((x) => x.key !== meta.key));
      setDrafts((d) => withoutKey(d, meta.key));
      setStatus(meta.key, { tone: "info", message: `Saved. Clients in ${meta.name} now see these rates.` });
    } catch (err) {
      setStatus(meta.key, {
        tone: "error",
        message:
          err instanceof ApiError && err.code === "SC_1511"
            ? "You don't hold a PSARA licence for this state yet — add it under Tax profile."
            : err instanceof Error
              ? err.message
              : "Couldn't save these rates. Try again.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove(meta: CityMeta) {
    const drop = () => {
      setAdded((a) => a.filter((x) => x.key !== meta.key));
      setDrafts((d) => withoutKey(d, meta.key));
      setSelected(null);
    };
    if (meta.isNew) return drop();

    setBusy({ key: meta.key, action: "remove" });
    try {
      await removeCity(meta.key, accessToken);
      await load();
      drop();
    } catch (err) {
      setStatus(meta.key, {
        tone: "error",
        message:
          err instanceof ApiError && err.code === "SC_1514"
            ? `You have bookings in ${meta.name} that aren't finished yet. Remove it once they're done.`
            : err instanceof Error
              ? err.message
              : "Couldn't remove this city. Try again.",
      });
    } finally {
      setBusy(null);
    }
  }

  // Arrow keys move between tabs, as a tablist should.
  function handleTabKeys(event: KeyboardEvent<HTMLDivElement>) {
    const order = [...cities.map((c) => c.key), ADD];
    const index = order.indexOf(current);
    const next =
      event.key === "ArrowRight" ? order[(index + 1) % order.length] :
      event.key === "ArrowLeft" ? order[(index - 1 + order.length) % order.length] :
      event.key === "Home" ? order[0] :
      event.key === "End" ? order[order.length - 1] : null;
    if (!next) return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  const defaultStateCode =
    GST_STATES.find((s) => s.name.toLowerCase() === (serviceState ?? "").trim().toLowerCase())?.code ?? null;
  const copySources = [
    ...(unplaced ? [{ key: UNPLACED, label: "Your current rates" }] : []),
    ...cities.map((c) => ({ key: c.key, label: `Copy ${c.name}'s rates` })),
  ];

  if (loadError) {
    return (
      <Banner>
        {loadError}{" "}
        <button type="button" className={styles.inlineLink} onClick={load}>
          Try again
        </button>
      </Banner>
    );
  }

  if (cards === null) {
    return (
      <div className={styles.skeleton} aria-busy="true" aria-label="Loading your rates">
        <div className={styles.skeletonTabs} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  const meta = cities.find((c) => c.key === current) ?? null;

  return (
    <div className={styles.rates}>
      {unplaced ? (
        <div className={styles.notice}>
          <Banner tone="info">
            Some of your rates aren&apos;t tied to a city yet, so they apply wherever you work. Add your cities
            below — you can start each one from these rates.
          </Banner>
        </div>
      ) : null}

      {cities.length > 0 ? (
        <div className={styles.tabs} role="tablist" aria-label="Your cities" onKeyDown={handleTabKeys}>
          {cities.map((c) => {
            const active = c.key === current;
            const dirty = c.isNew || isDirty(c.key);
            return (
              <button
                key={c.key}
                ref={(el) => {
                  tabRefs.current[c.key] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${c.key}`}
                aria-selected={active}
                aria-controls="city-panel"
                tabIndex={active ? 0 : -1}
                className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                onClick={() => setSelected(c.key)}
              >
                <span>{c.name}</span>
                <span className={styles.tabCount}>
                  {pricedCount(draftFor(c.key), offered)}/{offered.length}
                </span>
                {dirty ? <span className={styles.tabDot} aria-label="unsaved changes" /> : null}
              </button>
            );
          })}
          <button
            ref={(el) => {
              tabRefs.current[ADD] = el;
            }}
            type="button"
            role="tab"
            aria-selected={current === ADD}
            aria-controls="city-panel"
            tabIndex={current === ADD ? 0 : -1}
            className={`${styles.tab} ${styles.tabAdd} ${current === ADD ? styles.tabActive : ""}`}
            onClick={() => setSelected(ADD)}
          >
            <Icon name="plus" size={16} />
            <span>Add city</span>
          </button>
        </div>
      ) : null}

      <div id="city-panel" role="tabpanel" aria-labelledby={meta ? `tab-${meta.key}` : undefined}>
        {current === ADD || !meta ? (
          <AddCityPanel
            key={cities.length}
            accessToken={accessToken}
            defaultStateCode={defaultStateCode}
            existingKeys={cities.map((c) => c.key)}
            copySources={copySources}
            isFirst={cities.length === 0}
            onAdd={handleAdd}
            onCancel={() => setSelected(null)}
          />
        ) : (
          <CityRateCard
            key={meta.key}
            cityKey={meta.key}
            cityName={meta.name}
            stateName={meta.stateCode ? GST_STATE_NAME_BY_CODE[meta.stateCode] ?? null : null}
            isPrimary={meta.key === primaryKey}
            isNew={meta.isNew}
            offered={offered}
            draft={draftFor(meta.key)}
            errors={errors[meta.key] ?? NO_ERRORS}
            dirty={isDirty(meta.key)}
            saving={busy?.key === meta.key && busy.action === "save"}
            removing={busy?.key === meta.key && busy.action === "remove"}
            status={statuses[meta.key] ?? null}
            onChange={(draft) => {
              setDrafts((d) => ({ ...d, [meta.key]: draft }));
              setStatus(meta.key, null);
            }}
            onSave={() => handleSave(meta)}
            onRemove={() => handleRemove(meta)}
          />
        )}
      </div>
    </div>
  );
}
