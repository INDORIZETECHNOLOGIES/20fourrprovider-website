"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { listEligibleCities, registerCity, type CityOption } from "@/lib/api/pricing";
import { GST_STATES } from "@/lib/constants/indianStates";
import styles from "./CityRates.module.css";

const OTHER = "__other__";

type AddCityPanelProps = {
  accessToken: string;
  /** Pre-selected state (the provider's own), as a GST code. */
  defaultStateCode: string | null;
  /** Keys already on the card — not offered again. */
  existingKeys: string[];
  /** Cities whose rates can be copied, plus "current rates" for an unplaced card. */
  copySources: Array<{ key: string; label: string }>;
  /** True when there's no city yet: the panel is the whole section, with no Cancel. */
  isFirst: boolean;
  onAdd: (city: CityOption, copyFrom: string | null) => void;
  onCancel: () => void;
};

export function AddCityPanel({ accessToken, defaultStateCode, existingKeys, copySources, isFirst, onAdd, onCancel }: AddCityPanelProps) {
  const [stateCode, setStateCode] = useState(defaultStateCode ?? "");
  const [cities, setCities] = useState<CityOption[] | null>(null);
  const [cityKey, setCityKey] = useState("");
  const [customName, setCustomName] = useState("");
  const [copyFrom, setCopyFrom] = useState(copySources[0]?.key ?? "");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!stateCode) return;
    let cancelled = false;
    listEligibleCities(accessToken, stateCode)
      .then(({ cities }) => {
        if (!cancelled) setCities(cities);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, stateCode]);

  const available = useMemo(
    () => (cities ?? []).filter((c) => !existingKeys.includes(c.key)).sort((a, b) => a.name.localeCompare(b.name)),
    [cities, existingKeys],
  );
  const loading = Boolean(stateCode) && cities === null;
  const choosingOther = cityKey === OTHER || (!loading && available.length === 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!stateCode) return setError("Choose the state first.");
    if (choosingOther && customName.trim().length < 2) return setError("Enter the city or town name.");
    if (!choosingOther && !cityKey) return setError("Choose a city.");

    setWorking(true);
    try {
      const city = choosingOther
        ? await registerCity(customName.trim(), stateCode, accessToken)
        : available.find((c) => c.key === cityKey)!;
      if (existingKeys.includes(city.key)) {
        setError(`${city.name} is already on your rate card.`);
        return;
      }
      onAdd(city, copyFrom || null);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "SC_1511"
          ? "You don't hold a PSARA licence for this state yet. Add it under Tax profile → PSARA coverage."
          : err instanceof Error
            ? err.message
            : "Couldn't add the city. Try again.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate aria-labelledby="add-city-title">
      <header className={styles.cardHead}>
        <div>
          <h3 id="add-city-title" className={styles.cityName}>
            {isFirst ? "Add the first city you work in" : "Add a city"}
          </h3>
          <p className={styles.cityMeta}>Each city is priced on its own. Clients there see these rates.</p>
        </div>
      </header>

      <div className={styles.addBody}>
        {error ? <Banner>{error}</Banner> : null}

        <div className={styles.fieldPair}>
          <Select
            id="add-city-state"
            label="State"
            value={stateCode}
            disabled={working}
            onChange={(e) => {
              setStateCode(e.target.value);
              setCities(null);
              setCityKey("");
            }}
          >
            <option value="" disabled>
              Choose a state
            </option>
            {GST_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </Select>

          {choosingOther ? (
            <Field
              id="add-city-name"
              label="City or town"
              value={customName}
              disabled={working}
              autoComplete="address-level2"
              onChange={(e) => setCustomName(e.target.value)}
              hint={available.length === 0 && !loading ? "Type your city or town." : undefined}
            />
          ) : (
            <Select
              id="add-city-city"
              label="City"
              value={cityKey}
              disabled={working || loading || !stateCode}
              onChange={(e) => setCityKey(e.target.value)}
            >
              <option value="" disabled>
                {loading ? "Loading cities…" : "Choose a city"}
              </option>
              {available.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
              <option value={OTHER}>My city isn&apos;t listed…</option>
            </Select>
          )}
        </div>

        {copySources.length > 0 ? (
          <Select
            id="add-city-copy"
            label="Start from"
            value={copyFrom}
            disabled={working}
            onChange={(e) => setCopyFrom(e.target.value)}
            hint="Copied rates are a starting point — nothing is saved until you save the new city."
          >
            {copySources.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
            <option value="">A blank rate card</option>
          </Select>
        ) : null}
      </div>

      <footer className={styles.cardFoot}>
        <div className={styles.footStatus}>
          {!isFirst ? (
            <button type="button" className={styles.quietButton} onClick={onCancel} disabled={working}>
              Cancel
            </button>
          ) : null}
        </div>
        <button type="submit" className={styles.saveButton} disabled={working}>
          {working ? "Adding…" : "Add city"}
        </button>
      </footer>
    </form>
  );
}
