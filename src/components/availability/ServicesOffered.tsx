"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Banner } from "@/components/ui/Banner";
import { RowList } from "@/components/ui/RowList";
import {
  getProviderProfile,
  saveProviderProfile,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  type ProviderProfile,
  type ServiceCategory,
} from "@/lib/api/provider";
import styles from "./AvailabilityPanel.module.css";

const DESCRIPTIONS: Record<ServiceCategory, string> = {
  guard: "Site, gate and premises security",
  bouncer: "Venues, events and crowd control",
  gunman: "Armed protection — needs a verified arms licence",
  pso: "Close protection for a person — needs a verified arms licence",
};

type ServicesOfferedProps = {
  profile: ProviderProfile;
  accessToken: string;
  onUpdated: (profile: ProviderProfile) => void;
};

/**
 * What the provider offers at all. Saved the moment a switch moves, like the availability
 * switch. Prices live per city below; a service switched off keeps its prices, so turning it
 * back on restores them.
 */
export function ServicesOffered({ profile, accessToken, onUpdated }: ServicesOfferedProps) {
  const [offered, setOffered] = useState<ServiceCategory[]>(profile.serviceCategories);
  const [savingCategory, setSavingCategory] = useState<ServiceCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(category: ServiceCategory, on: boolean) {
    const previous = offered;
    const next = on ? SERVICE_CATEGORIES.filter((c) => c === category || previous.includes(c)) : previous.filter((c) => c !== category);
    setOffered(next);
    setSavingCategory(category);
    setError(null);
    try {
      await saveProviderProfile(profile, { serviceCategories: next }, accessToken);
      const { profile: fresh } = await getProviderProfile(accessToken);
      onUpdated(fresh);
    } catch (err) {
      setOffered(previous);
      setError(err instanceof Error ? err.message : "Couldn't update your services. Try again.");
    } finally {
      setSavingCategory(null);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="services-title">
      <h2 id="services-title" className={styles.sectionTitle}>
        Services you offer
      </h2>
      <p className={styles.sectionSubtext}>
        Clients search by service. Switch one off and you stop appearing in those searches; its prices are kept.
      </p>
      {error ? (
        <div className={styles.bannerGap}>
          <Banner>{error}</Banner>
        </div>
      ) : null}
      <RowList>
        {SERVICE_CATEGORIES.map((category) => {
          const on = offered.includes(category);
          const last = on && offered.length === 1;
          return (
            <div key={category} className={styles.serviceRow}>
              <div className={styles.serviceText}>
                <p className={styles.serviceName}>{SERVICE_CATEGORY_LABELS[category]}</p>
                <p className={styles.serviceDesc}>{last ? "Your only service — keep at least one on" : DESCRIPTIONS[category]}</p>
              </div>
              <Switch
                id={`service-${category}`}
                label={savingCategory === category ? "Saving…" : on ? "Offered" : "Off"}
                checked={on}
                disabled={savingCategory !== null || last}
                onChange={(next) => toggle(category, next)}
              />
            </div>
          );
        })}
      </RowList>
    </section>
  );
}
