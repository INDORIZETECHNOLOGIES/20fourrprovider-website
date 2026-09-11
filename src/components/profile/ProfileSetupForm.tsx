"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import {
  updateProviderProfile,
  updateProviderPricing,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  type ProviderType,
  type ServiceCategory,
} from "@/lib/api/provider";
import {
  validateDailyRate,
  validateServiceCategories,
  validateServiceCity,
  validateServiceState,
  validateTotalHoursPerDay,
  validateYearsExperience,
} from "@/lib/validation/profile";
import { INDIAN_STATES } from "@/lib/constants/indianStates";
import styles from "./ProfileSetupForm.module.css";

type PricingDraft = Record<ServiceCategory, { dailyRate: string; totalHoursPerDay: string }>;

type FieldErrors = {
  categories?: string;
  city?: string;
  state?: string;
  yearsExperience?: string;
  pricing?: Partial<Record<ServiceCategory, { dailyRate?: string; totalHoursPerDay?: string }>>;
};

export function ProfileSetupForm({ accessToken }: { accessToken: string }) {
  const router = useRouter();
  const [providerType, setProviderType] = useState<ProviderType>("individual");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [pricing, setPricing] = useState<PricingDraft>({} as PricingDraft);
  const [serviceCity, setServiceCity] = useState("");
  const [serviceState, setServiceState] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(category: ServiceCategory) {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
    setPricing((current) =>
      current[category] ? current : { ...current, [category]: { dailyRate: "", totalHoursPerDay: "" } },
    );
  }

  function updatePricing(category: ServiceCategory, field: "dailyRate" | "totalHoursPerDay", value: string) {
    setPricing((current) => ({
      ...current,
      [category]: { ...current[category], [field]: value },
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const years = Number(yearsExperience);
    const errors: FieldErrors = {
      categories: validateServiceCategories(categories) ?? undefined,
      city: validateServiceCity(serviceCity) ?? undefined,
      state: validateServiceState(serviceState) ?? undefined,
      yearsExperience: validateYearsExperience(years) ?? undefined,
    };

    const pricingErrors: FieldErrors["pricing"] = {};
    for (const category of categories) {
      const draft = pricing[category] ?? { dailyRate: "", totalHoursPerDay: "" };
      const dailyRateError = validateDailyRate(Number(draft.dailyRate)) ?? undefined;
      const hoursError = validateTotalHoursPerDay(Number(draft.totalHoursPerDay)) ?? undefined;
      if (dailyRateError || hoursError) {
        pricingErrors[category] = { dailyRate: dailyRateError, totalHoursPerDay: hoursError };
      }
    }
    if (Object.keys(pricingErrors).length > 0) errors.pricing = pricingErrors;

    setFieldErrors(errors);
    const hasErrors =
      Boolean(errors.categories || errors.city || errors.state || errors.yearsExperience) ||
      Object.keys(errors.pricing ?? {}).length > 0;
    if (hasErrors) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await updateProviderProfile(
        {
          providerType,
          serviceCategories: categories,
          serviceCity,
          serviceState,
          yearsExperience: years,
          businessName: providerType === "firm" ? businessName || undefined : undefined,
          description: description || undefined,
        },
        accessToken,
      );
      await updateProviderPricing(
        categories.map((category) => ({
          category,
          dailyRate: Math.round(Number(pricing[category].dailyRate) * 100),
          totalHoursPerDay: Number(pricing[category].totalHoursPerDay),
        })),
        accessToken,
      );
      router.push("/dashboard");
    } catch (error) {
      setFormError(describeProfileError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Set up your provider profile</h1>
        <p className={styles.subtext}>
          This is what clients and the verification team see. You can add documents and bank
          details afterwards.
        </p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError ? <Banner>{formError}</Banner> : null}

          <div className={styles.section}>
            <span className={styles.sectionLabel}>You are</span>
            <div className={styles.segmented} role="radiogroup" aria-label="Provider type">
              {(["individual", "firm"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={providerType === type}
                  className={`${styles.segmentButton} ${providerType === type ? styles.segmentButtonActive : ""}`}
                  onClick={() => setProviderType(type)}
                >
                  {type === "individual" ? "An individual" : "A firm"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Services you provide</span>
            <div className={styles.chips}>
              {SERVICE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={categories.includes(category)}
                  className={`${styles.chip} ${categories.includes(category) ? styles.chipActive : ""}`}
                  onClick={() => toggleCategory(category)}
                >
                  {SERVICE_CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>
            {fieldErrors.categories ? <Banner>{fieldErrors.categories}</Banner> : null}
          </div>

          <div className={styles.row}>
            <Field
              id="serviceCity"
              label="Service city"
              value={serviceCity}
              onChange={(e) => setServiceCity(e.target.value)}
              error={fieldErrors.city}
            />
            <Select
              id="serviceState"
              label="Service state"
              value={serviceState}
              onChange={(e) => setServiceState(e.target.value)}
              error={fieldErrors.state}
            >
              <option value="">Select a state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
          </div>

          <Field
            id="yearsExperience"
            label="Years of experience"
            type="number"
            min={0}
            max={50}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            error={fieldErrors.yearsExperience}
          />

          {providerType === "firm" ? (
            <Field
              id="businessName"
              label="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          ) : null}

          {categories.length > 0 ? (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Pricing</span>
              {categories.map((category) => (
                <div key={category} className={styles.pricingRow}>
                  <span className={styles.pricingCategory}>{SERVICE_CATEGORY_LABELS[category]}</span>
                  <Field
                    id={`dailyRate-${category}`}
                    label="Daily rate (₹)"
                    type="number"
                    min={100}
                    max={100000}
                    value={pricing[category]?.dailyRate ?? ""}
                    onChange={(e) => updatePricing(category, "dailyRate", e.target.value)}
                    error={fieldErrors.pricing?.[category]?.dailyRate}
                  />
                  <Field
                    id={`hours-${category}`}
                    label="Hours per shift"
                    type="number"
                    min={4}
                    max={24}
                    value={pricing[category]?.totalHoursPerDay ?? ""}
                    onChange={(e) => updatePricing(category, "totalHoursPerDay", e.target.value)}
                    error={fieldErrors.pricing?.[category]?.totalHoursPerDay}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <Textarea
            id="description"
            label="About you (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </div>
    </main>
  );
}

function describeProfileError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "SC_210") return "Add pricing for every service you selected.";
    return error.message;
  }
  return "Something went wrong. Try again.";
}
