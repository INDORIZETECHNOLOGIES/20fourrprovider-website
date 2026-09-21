"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getProviderProfile, saveProviderProfile, type ProviderProfile } from "@/lib/api/provider";
import { readSession, saveSession } from "@/lib/auth/session";
import { INDIAN_STATES } from "@/lib/constants/indianStates";
import { validateName, validatePhone } from "@/lib/validation/auth";
import {
  SERVICE_CITIES_MAX,
  normalizeTags,
  validateBusinessName,
  validateDateOfBirth,
  validateEmergencyName,
  validateEmergencyPhone,
  validateEmergencyRelation,
  validateHomeAddress,
} from "@/lib/validation/profileDetails";
import { validateServiceCity, validateServiceState, validateYearsExperience } from "@/lib/validation/profile";
import { TagInput } from "./TagInput";
import styles from "./ProfileForms.module.css";

type Errors = Partial<
  Record<
    | "name"
    | "phone"
    | "businessName"
    | "yearsExperience"
    | "serviceState"
    | "serviceCity"
    | "dateOfBirth"
    | "homeAddress"
    | "emergencyName"
    | "emergencyPhone"
    | "emergencyRelation",
    string
  >
>;

const dateOnly = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

export function EditDetailsPanel({ accessToken }: { accessToken: string }) {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProviderProfile(accessToken), getCurrentUser(accessToken)])
      .then(([{ profile }, { user }]) => {
        if (cancelled) return;
        setProfile(profile);
        setUser(user);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load your details. Try refreshing.");
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
          title="Your details"
          intro="Your contact details, where you work, and the private details we use to verify you."
        />
        {loadError ? <Banner>{loadError}</Banner> : null}
        {profile && user ? (
          <DetailsForm
            profile={profile}
            user={user}
            accessToken={accessToken}
            onSaved={(next, name) => {
              setProfile(next);
              setUser((current) => (current ? { ...current, name } : current));
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function DetailsForm({
  profile,
  user,
  accessToken,
  onSaved,
}: {
  profile: ProviderProfile;
  user: AuthUser;
  accessToken: string;
  onSaved: (profile: ProviderProfile, name: string) => void;
}) {
  const isFirm = profile.providerType === "firm";
  const contact = profile.adminData?.emergencyContact;

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [businessName, setBusinessName] = useState(profile.businessName ?? "");
  const [years, setYears] = useState(String(profile.yearsExperience ?? ""));
  const [serviceState, setServiceState] = useState(profile.serviceState ?? "");
  const [serviceCity, setServiceCity] = useState(profile.serviceCity ?? "");
  const [otherCities, setOtherCities] = useState<string[]>(
    (profile.serviceCities ?? []).filter((city) => city !== profile.serviceCity),
  );
  const [dob, setDob] = useState(dateOnly(profile.adminData?.dateOfBirth));
  const [address, setAddress] = useState(profile.adminData?.homeAddress ?? "");
  const [emergencyName, setEmergencyName] = useState(contact?.name ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(contact?.phone ?? "");
  const [emergencyRelation, setEmergencyRelation] = useState(contact?.relation ?? "");

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setFormError(null);

    const next: Errors = {
      name: validateName(name) ?? undefined,
      phone: validatePhone(phone) ?? undefined,
      businessName: validateBusinessName(businessName, isFirm) ?? undefined,
      yearsExperience: validateYearsExperience(Number(years)) ?? undefined,
      serviceState: validateServiceState(serviceState) ?? undefined,
      serviceCity: validateServiceCity(serviceCity) ?? undefined,
      dateOfBirth: validateDateOfBirth(dob) ?? undefined,
      homeAddress: validateHomeAddress(address) ?? undefined,
      emergencyName: validateEmergencyName(emergencyName) ?? undefined,
      emergencyPhone: validateEmergencyPhone(emergencyPhone) ?? undefined,
      emergencyRelation: validateEmergencyRelation(emergencyRelation) ?? undefined,
    };
    const invalid = Object.values(next).some(Boolean);
    setErrors(next);
    if (invalid) {
      setFormError("Fix the highlighted fields and save again.");
      return;
    }

    setSaving(true);
    try {
      const primary = serviceCity.trim();
      const { profile: updated } = await saveProviderProfile(
        profile,
        {
          name: name.trim(),
          phone: phone.trim(),
          ...(isFirm ? { businessName: businessName.trim() } : {}),
          yearsExperience: Number(years),
          serviceState: serviceState.trim(),
          serviceCity: primary,
          // The primary city leads the coverage list; the API de-duplicates.
          serviceCities: normalizeTags([primary, ...otherCities]),
          adminData: {
            dateOfBirth: dob || null,
            homeAddress: address.trim() || null,
            emergencyContact: {
              name: emergencyName.trim() || null,
              phone: emergencyPhone.trim() || null,
              relation: emergencyRelation.trim() || null,
            },
          },
        },
        accessToken,
      );

      // The sidebar's initials read the stored name.
      const session = readSession();
      if (session) saveSession({ ...session, name: name.trim() });

      onSaved(updated, name.trim());
      setSaved(true);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Couldn't save your details. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {saved ? (
        <p className={styles.saved} role="status">
          Details saved.
        </p>
      ) : null}
      {formError ? <Banner>{formError}</Banner> : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact</h2>
        <p className={styles.sectionText}>
          Your email is changed from Account. Changing your phone number means verifying it again.
        </p>
        <div className={styles.stack}>
          <Field id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
          <Field
            id="phone"
            label="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            error={errors.phone}
            inputMode="numeric"
            autoComplete="tel-national"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{isFirm ? "Your agency" : "Your experience"}</h2>
        <div className={styles.stack}>
          {isFirm ? (
            <Field
              id="businessName"
              label="Agency name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={errors.businessName}
              maxLength={100}
            />
          ) : null}
          <Field
            id="yearsExperience"
            label="Years of experience"
            value={years}
            onChange={(e) => setYears(e.target.value.replace(/\D/g, "").slice(0, 2))}
            error={errors.yearsExperience}
            inputMode="numeric"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Where you work</h2>
        <p className={styles.sectionText}>
          Clients search by city. Add every city you can deploy to, not only your main one.
        </p>
        <div className={styles.stack}>
          <div className={styles.pair}>
            <Select
              id="serviceState"
              label="State"
              value={serviceState}
              onChange={(e) => setServiceState(e.target.value)}
              error={errors.serviceState}
            >
              <option value="" disabled>
                Choose a state
              </option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
            <Field id="serviceCity" label="Main city" value={serviceCity} onChange={(e) => setServiceCity(e.target.value)} error={errors.serviceCity} maxLength={100} />
          </div>
          <TagInput
            id="otherCities"
            label="Other cities you serve"
            placeholder="e.g. Pune"
            tags={otherCities}
            max={SERVICE_CITIES_MAX - 1}
            maxLength={100}
            onChange={setOtherCities}
          />
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.audience}>Only you and our verification team</span>
        <h2 className={styles.sectionTitle}>Private details</h2>
        <p className={styles.sectionText}>
          We use these to verify you and reach someone if there is an emergency on duty. Clients never see them.
        </p>
        <div className={styles.stack}>
          <Field id="dob" label="Date of birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} error={errors.dateOfBirth} autoComplete="bday" />
          <Textarea
            id="homeAddress"
            label="Home address"
            className={styles.textarea}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.homeAddress}
            maxLength={300}
            autoComplete="street-address"
          />
        </div>
        <hr className={styles.divider} />
        <h3 className={styles.sectionTitle} style={{ fontSize: "1rem" }}>
          Emergency contact
        </h3>
        <div className={styles.stack}>
          <div className={styles.pair}>
            <Field id="emergencyName" label="Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} error={errors.emergencyName} />
            <Field id="emergencyRelation" label="Relationship" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} error={errors.emergencyRelation} placeholder="e.g. Spouse" />
          </div>
          <Field
            id="emergencyPhone"
            label="Mobile number"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            error={errors.emergencyPhone}
            inputMode="numeric"
          />
        </div>
      </section>

      <div className={styles.actions}>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save details"}
        </Button>
      </div>
    </form>
  );
}
