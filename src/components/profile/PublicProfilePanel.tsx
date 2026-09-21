"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { toGalleryPhotos } from "@/lib/api/gallery";
import { getProviderProfile, saveProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import {
  DESCRIPTION_MAX,
  LANGUAGES_MAX,
  SKILLS_MAX,
  SPECIALIZATIONS_MAX,
  normalizeTags,
  validateDescription,
  validateNumberOfPersonnel,
  validateResponseTime,
  validateServiceRadius,
  validateShortText,
  validateVehicleRegistration,
  validateYearEstablished,
} from "@/lib/validation/profileDetails";
import { GallerySection } from "./GallerySection";
import { TagInput } from "./TagInput";
import styles from "./ProfileForms.module.css";

const VEHICLE_TYPES = [
  { value: "car", label: "Car" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Van" },
  { value: "bike", label: "Bike" },
] as const;

type Errors = Partial<
  Record<
    | "description"
    | "serviceRadius"
    | "previousOrganization"
    | "rankAtRetirement"
    | "regiment"
    | "yearEstablished"
    | "numberOfPersonnel"
    | "responseTime"
    | "isoCertification"
    | "vehicleRegistration",
    string
  >
>;

export function PublicProfilePanel({ accessToken }: { accessToken: string }) {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProviderProfile(accessToken)
      .then(({ profile }) => {
        if (!cancelled) setProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load your public profile. Try refreshing.");
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
          title="Public profile"
          intro="What clients read when they compare providers. A complete profile gets more bookings."
        />
        {loadError ? <Banner>{loadError}</Banner> : null}
        {profile ? <PublicForm profile={profile} accessToken={accessToken} onSaved={setProfile} /> : null}
      </div>
    </div>
  );
}

function PublicForm({
  profile,
  accessToken,
  onSaved,
}: {
  profile: ProviderProfile;
  accessToken: string;
  onSaved: (profile: ProviderProfile) => void;
}) {
  const isFirm = profile.providerType === "firm";
  const vehicle = profile.vehicleOptions;

  const [description, setDescription] = useState(profile.description ?? "");
  const [availableNow, setAvailableNow] = useState(Boolean(profile.availableNow));
  const [radius, setRadius] = useState(profile.serviceRadius != null ? String(profile.serviceRadius) : "");
  const [travelAcrossIndia, setTravelAcrossIndia] = useState(Boolean(profile.travelAcrossIndia));
  const [passport, setPassport] = useState(Boolean(profile.passportAvailable));
  const [international, setInternational] = useState(Boolean(profile.internationalTravel));
  const [languages, setLanguages] = useState(profile.languages ?? []);
  const [specializations, setSpecializations] = useState(profile.specializations ?? []);
  const [skills, setSkills] = useState(profile.skills ?? []);

  const [exServiceman, setExServiceman] = useState(Boolean(profile.isExServiceman));
  const [policeVeteran, setPoliceVeteran] = useState(Boolean(profile.isPoliceVeteran));
  const [previousOrg, setPreviousOrg] = useState(profile.previousOrganization ?? "");
  const [rank, setRank] = useState(profile.rankAtRetirement ?? "");
  const [regiment, setRegiment] = useState(profile.regiment ?? "");

  const [yearEstablished, setYearEstablished] = useState(profile.yearEstablished != null ? String(profile.yearEstablished) : "");
  const [personnel, setPersonnel] = useState(profile.numberOfPersonnel != null ? String(profile.numberOfPersonnel) : "");
  const [responseTime, setResponseTime] = useState(profile.responseTime ?? "");
  const [iso, setIso] = useState(profile.isoCertification ?? "");

  const [offersVehicle, setOffersVehicle] = useState(Boolean(vehicle?.offersVehicle));
  const [offersDriver, setOffersDriver] = useState(Boolean(vehicle?.offersVehicleWithDriver));
  const [vehicleType, setVehicleType] = useState<string>(vehicle?.vehicleType ?? "");
  const [vehicleReg, setVehicleReg] = useState(vehicle?.vehicleRegistration ?? "");

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const vehicleOn = offersVehicle || offersDriver;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setFormError(null);

    const next: Errors = {
      description: validateDescription(description) ?? undefined,
      serviceRadius: validateServiceRadius(radius) ?? undefined,
      previousOrganization: validateShortText(previousOrg, 120) ?? undefined,
      rankAtRetirement: validateShortText(rank, 80) ?? undefined,
      regiment: validateShortText(regiment, 120) ?? undefined,
      yearEstablished: validateYearEstablished(yearEstablished) ?? undefined,
      numberOfPersonnel: validateNumberOfPersonnel(personnel) ?? undefined,
      responseTime: validateResponseTime(responseTime) ?? undefined,
      isoCertification: validateShortText(iso, 120) ?? undefined,
      vehicleRegistration: vehicleOn ? (validateVehicleRegistration(vehicleReg) ?? undefined) : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setFormError("Fix the highlighted fields and save again.");
      return;
    }

    setSaving(true);
    try {
      const { profile: updated } = await saveProviderProfile(
        profile,
        {
          description: description.trim(),
          availableNow,
          serviceRadius: radius.trim() ? Number(radius) : null,
          languages: normalizeTags(languages),
          specializations: normalizeTags(specializations),
          skills: normalizeTags(skills),
          vehicleOptions: {
            offersVehicle,
            offersVehicleWithDriver: offersDriver,
            vehicleType: vehicleOn && vehicleType ? (vehicleType as "car" | "suv" | "van" | "bike") : null,
            vehicleRegistration: vehicleOn ? vehicleReg.trim().toUpperCase() || null : null,
          },
          ...(isFirm
            ? {
                yearEstablished: yearEstablished.trim() ? Number(yearEstablished) : null,
                numberOfPersonnel: personnel.trim() ? Number(personnel) : null,
                responseTime: responseTime.trim(),
                isoCertification: iso.trim(),
              }
            : {
                isExServiceman: exServiceman,
                isPoliceVeteran: policeVeteran,
                previousOrganization: previousOrg.trim(),
                rankAtRetirement: rank.trim(),
                regiment: regiment.trim(),
                travelAcrossIndia,
                passportAvailable: passport,
                internationalTravel: international,
              }),
        },
        accessToken,
      );
      onSaved(updated);
      setSaved(true);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Couldn't save your public profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const overLimit = description.length > DESCRIPTION_MAX;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        {saved ? (
          <p className={styles.saved} role="status">
            Public profile saved.
          </p>
        ) : null}
        {formError ? <Banner>{formError}</Banner> : null}

        <section className={styles.section}>
          <span className={styles.audience}>Shown to clients</span>
          <h2 className={styles.sectionTitle}>About you</h2>
          <div className={styles.stack}>
            <Textarea
              id="description"
              label={isFirm ? "About your agency" : "About you"}
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              placeholder="Your background, the kind of work you do best, and how you operate on duty."
            />
            <p className={`${styles.counter} ${overLimit ? styles.counterOver : ""}`}>
              {description.length}/{DESCRIPTION_MAX}
            </p>
            <Switch id="availableNow" label="Show me as available now" checked={availableNow} onChange={setAvailableNow} />
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.audience}>Shown to clients</span>
          <h2 className={styles.sectionTitle}>Reach and languages</h2>
          <div className={styles.stack}>
            <Field
              id="serviceRadius"
              label="How far you will travel (km)"
              hint="Leave blank if you have no set limit."
              value={radius}
              onChange={(e) => setRadius(e.target.value.replace(/\D/g, "").slice(0, 4))}
              error={errors.serviceRadius}
              inputMode="numeric"
            />
            {!isFirm ? (
              <div className={styles.switches}>
                <Switch id="travelAcrossIndia" label="Willing to travel across India" checked={travelAcrossIndia} onChange={setTravelAcrossIndia} />
                <Switch id="passport" label="I hold a passport" checked={passport} onChange={setPassport} />
                <Switch id="international" label="Available for international travel" checked={international} onChange={setInternational} />
              </div>
            ) : null}
            <TagInput id="languages" label="Languages you speak" placeholder="e.g. Hindi" tags={languages} max={LANGUAGES_MAX} maxLength={40} onChange={setLanguages} />
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.audience}>Shown to clients</span>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.stack}>
            <TagInput
              id="specializations"
              label="Specialisations"
              hint="e.g. Close protection, VIP escort, residential security."
              placeholder="e.g. Close protection"
              tags={specializations}
              max={SPECIALIZATIONS_MAX}
              maxLength={60}
              onChange={setSpecializations}
            />
            <TagInput
              id="skills"
              label="Skills and certifications"
              hint="e.g. First aid, crowd management, defensive driving."
              placeholder="e.g. First aid"
              tags={skills}
              max={SKILLS_MAX}
              maxLength={60}
              onChange={setSkills}
            />
          </div>
        </section>

        {isFirm ? (
          <section className={styles.section}>
            <span className={styles.audience}>Shown to clients</span>
            <h2 className={styles.sectionTitle}>Your agency</h2>
            <div className={styles.stack}>
              <div className={styles.pair}>
                <Field id="yearEstablished" label="Year established" value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value.replace(/\D/g, "").slice(0, 4))} error={errors.yearEstablished} inputMode="numeric" />
                <Field id="personnel" label="Number of personnel" value={personnel} onChange={(e) => setPersonnel(e.target.value.replace(/\D/g, "").slice(0, 6))} error={errors.numberOfPersonnel} inputMode="numeric" />
              </div>
              <Field id="responseTime" label="Typical response time" placeholder="e.g. Within 30 minutes" value={responseTime} onChange={(e) => setResponseTime(e.target.value)} error={errors.responseTime} maxLength={60} />
              <Field id="iso" label="ISO certification (optional)" placeholder="e.g. ISO 9001:2015" value={iso} onChange={(e) => setIso(e.target.value)} error={errors.isoCertification} maxLength={120} />
            </div>
          </section>
        ) : (
          <section className={styles.section}>
            <span className={styles.audience}>Shown to clients</span>
            <h2 className={styles.sectionTitle}>Service background</h2>
            <p className={styles.sectionText}>Clients value a record of service. Add it if it applies to you.</p>
            <div className={styles.stack}>
              <div className={styles.switches}>
                <Switch id="exServiceman" label="Ex-serviceman" checked={exServiceman} onChange={setExServiceman} />
                <Switch id="policeVeteran" label="Police veteran" checked={policeVeteran} onChange={setPoliceVeteran} />
              </div>
              {exServiceman || policeVeteran ? (
                <>
                  <div className={styles.pair}>
                    <Field id="previousOrg" label="Previous organisation" placeholder="e.g. Indian Army" value={previousOrg} onChange={(e) => setPreviousOrg(e.target.value)} error={errors.previousOrganization} maxLength={120} />
                    <Field id="rank" label="Rank at retirement" placeholder="e.g. Subedar" value={rank} onChange={(e) => setRank(e.target.value)} error={errors.rankAtRetirement} maxLength={80} />
                  </div>
                  <Field id="regiment" label="Regiment or unit (optional)" value={regiment} onChange={(e) => setRegiment(e.target.value)} error={errors.regiment} maxLength={120} />
                </>
              ) : null}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <span className={styles.audience}>Shown to clients</span>
          <h2 className={styles.sectionTitle}>Vehicle</h2>
          <p className={styles.sectionText}>Turn these on if you can bring a vehicle. Rates are set under Availability.</p>
          <div className={styles.stack}>
            <div className={styles.switches}>
              <Switch id="offersVehicle" label="I can provide a vehicle" checked={offersVehicle} onChange={setOffersVehicle} />
              <Switch id="offersDriver" label="I can provide a vehicle with a driver" checked={offersDriver} onChange={setOffersDriver} />
            </div>
            {vehicleOn ? (
              <div className={styles.pair}>
                <Select id="vehicleType" label="Vehicle type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                  <option value="">Not specified</option>
                  {VEHICLE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Field id="vehicleReg" label="Registration number" placeholder="e.g. MH 02 AB 1234" value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value)} error={errors.vehicleRegistration} maxLength={20} />
              </div>
            ) : null}
          </div>
        </section>

        <div className={styles.actions}>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save public profile"}
          </Button>
        </div>
      </form>

      <div style={{ marginTop: "var(--space-8)" }}>
        <GallerySection initial={toGalleryPhotos(profile.gallery)} accessToken={accessToken} />
      </div>
    </>
  );
}
