"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api/client";
import {
  getProviderProfile,
  saveProviderProfile,
  type LicenceBlock,
  type ProviderProfile,
} from "@/lib/api/provider";
import { INDIAN_STATES } from "@/lib/constants/indianStates";
import { validateLicenceNumber } from "@/lib/validation/profile";
import styles from "./ProfileForms.module.css";

type Errors = { psaraNumber?: string; weaponNumber?: string; issuingState?: string };

// Not entered, waiting on the verification team, or approved.
function statusOf(licence: LicenceBlock | null | undefined, hasCopy: boolean) {
  if (licence?.verified) return { label: "Verified", tone: "active" as const };
  if (licence?.number) {
    return hasCopy
      ? { label: "In review", tone: "action" as const }
      : { label: "Upload a copy to be reviewed", tone: "action" as const };
  }
  return { label: "Not added", tone: "muted" as const };
}

export function LicencesPanel({ accessToken }: { accessToken: string }) {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProviderProfile(accessToken)
      .then(({ profile }) => {
        if (!cancelled) setProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load your licences. Try refreshing.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <Link href="/profile" className={styles.back}>
          <Icon name="arrow-right" size={16} style={{ transform: "rotate(180deg)" }} />
          Profile
        </Link>
        <PageHeader
          title="Licences"
          intro="Your PSARA and weapon licence numbers. Upload a copy of each under Documents so our team can check them."
        />
        {loadError ? <Banner>{loadError}</Banner> : null}
        {profile ? <LicencesForm profile={profile} accessToken={accessToken} onSaved={setProfile} /> : null}
      </div>
    </div>
  );
}

function LicencesForm({
  profile,
  accessToken,
  onSaved,
}: {
  profile: ProviderProfile;
  accessToken: string;
  onSaved: (profile: ProviderProfile) => void;
}) {
  const [psaraNumber, setPsaraNumber] = useState(profile.psaraLicense?.number ?? "");
  const [issuingState, setIssuingState] = useState(profile.psaraLicense?.issuingState ?? "");
  const [weaponNumber, setWeaponNumber] = useState(profile.weaponLicense?.number ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const psaraCopy = Boolean(profile.psaraLicense?.documentUrl || profile.documents?.psaraLicenseUrl);
  const weaponCopy = Boolean(profile.weaponLicense?.documentUrl || profile.documents?.weaponLicenseUrl);
  const psara = statusOf(profile.psaraLicense, psaraCopy);
  const weapon = statusOf(profile.weaponLicense, weaponCopy);
  const offersArmed = profile.serviceCategories.includes("gunman");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setFormError(null);

    const next: Errors = {
      psaraNumber: validateLicenceNumber(psaraNumber) ?? undefined,
      weaponNumber: validateLicenceNumber(weaponNumber) ?? undefined,
      // The state is what the team checks a PSARA number against.
      issuingState: psaraNumber.trim() && !issuingState ? "Choose the state that issued this licence." : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSaving(true);
    try {
      const { profile: updated } = await saveProviderProfile(
        profile,
        {
          // Blank clears the number (null), so an empty string is never stored.
          psaraLicense: {
            number: psaraNumber.trim() || null,
            issuingState: psaraNumber.trim() ? issuingState : null,
          },
          weaponLicense: { number: weaponNumber.trim() || null },
        },
        accessToken,
      );
      onSaved(updated);
      setSaved(true);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Couldn't save your licences. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {saved ? (
        <p className={styles.saved} role="status">
          Licences saved.
        </p>
      ) : null}
      {formError ? <Banner>{formError}</Banner> : null}

      <section className={styles.section}>
        <span className={styles.audience}>Only you and our verification team</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            PSARA licence
          </h2>
          <Badge tone={psara.tone}>{psara.label}</Badge>
        </div>
        <p className={styles.sectionText} style={{ marginTop: "var(--space-2)" }}>
          PSARA licences are issued by a state. Enter the number exactly as printed and the state that issued it. To
          list every state you can work in, use{" "}
          <Link href="/tax-profile" style={{ fontWeight: 600 }}>
            Tax profile
          </Link>
          .
        </p>
        <div className={styles.stack}>
          <Field
            id="psaraNumber"
            label="Licence number"
            value={psaraNumber}
            onChange={(e) => setPsaraNumber(e.target.value)}
            error={errors.psaraNumber}
            maxLength={50}
            autoComplete="off"
          />
          <Select
            id="issuingState"
            label="Issuing state"
            value={issuingState}
            onChange={(e) => setIssuingState(e.target.value)}
            error={errors.issuingState}
          >
            <option value="">Choose a state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </div>
        {!psaraCopy ? (
          <p className={styles.sectionText} style={{ margin: "var(--space-4) 0 0" }}>
            No copy on file yet.{" "}
            <Link href="/documents" style={{ fontWeight: 600 }}>
              Upload it under Documents
            </Link>
            .
          </p>
        ) : null}
      </section>

      <section className={styles.section}>
        <span className={styles.audience}>Only you and our verification team</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            Weapon licence
          </h2>
          <Badge tone={weapon.tone}>{weapon.label}</Badge>
        </div>
        <p className={styles.sectionText} style={{ marginTop: "var(--space-2)" }}>
          {offersArmed
            ? "You offer armed guard services, so we need your weapon licence before you can be booked for them."
            : "Only needed if you offer armed services, where the law applies."}
        </p>
        <div className={styles.stack}>
          <Field
            id="weaponNumber"
            label="Licence number"
            value={weaponNumber}
            onChange={(e) => setWeaponNumber(e.target.value)}
            error={errors.weaponNumber}
            maxLength={50}
            autoComplete="off"
          />
        </div>
        {!weaponCopy && weaponNumber.trim() ? (
          <p className={styles.sectionText} style={{ margin: "var(--space-4) 0 0" }}>
            No copy on file yet.{" "}
            <Link href="/documents" style={{ fontWeight: 600 }}>
              Upload it under Documents
            </Link>
            .
          </p>
        ) : null}
      </section>

      <div className={styles.actions}>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save licences"}
        </Button>
      </div>
    </form>
  );
}
