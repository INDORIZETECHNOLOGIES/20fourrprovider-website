import { apiRequest } from "./client";
import type { DayOff, WorkingHours } from "./availability";

export const SERVICE_CATEGORIES = ["guard", "bouncer", "gunman", "pso"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  guard: "Security guard",
  bouncer: "Bouncer",
  gunman: "Armed guard (gunman)",
  pso: "Personal security officer",
};

export type ProviderType = "individual" | "firm";

export type ProviderPricing = {
  category: ServiceCategory;
  dailyRate: number; // paise
  totalHoursPerDay: number;
};

export type ProviderProfileDetailsInput = {
  providerType: ProviderType;
  serviceCategories: ServiceCategory[];
  serviceCity: string;
  serviceState: string;
  yearsExperience: number;
  businessName?: string;
  description?: string;
};

export type ProviderProfile = {
  _id: string;
  providerType: ProviderType;
  serviceCategories: ServiceCategory[];
  serviceCity: string;
  serviceState: string;
  yearsExperience: number;
  pricing: ProviderPricing[];
  businessName?: string;
  description?: string;
  isVerified: boolean;
  // Keyed by `${documentType}Url` (e.g. `aadhaarUrl`) — a presigned GET URL once
  // uploaded, absent otherwise. See src/lib/constants/providerDocuments.ts.
  documents?: Record<string, string | undefined>;
  availability: {
    isAvailable: boolean;
    workingHours: WorkingHours;
    daysOff: DayOff[];
  };
};

// Registration auto-creates a blank ProviderProfile server-side, so
// POST /provider/profile (the documented "create" endpoint) always 409s
// with SC_1307 for a real account — PUT is the only path that actually
// works for filling in a provider's profile. See CLAUDE.md.
export function updateProviderProfile(
  input: ProviderProfileDetailsInput,
  accessToken: string,
): Promise<{ profile: ProviderProfile }> {
  return apiRequest("/provider/profile", { method: "PUT", body: input, accessToken });
}

export function updateProviderPricing(
  pricing: ProviderPricing[],
  accessToken: string,
): Promise<{ pricing: ProviderPricing[] }> {
  return apiRequest("/provider/pricing", { method: "PUT", body: { pricing }, accessToken });
}

export function getProviderProfile(accessToken: string): Promise<{ profile: ProviderProfile }> {
  return apiRequest("/provider/profile", { accessToken });
}

export function isProfileComplete(profile: ProviderProfile): boolean {
  return profile.serviceCategories.length > 0;
}
