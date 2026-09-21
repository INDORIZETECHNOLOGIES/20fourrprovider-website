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

// Every amount here is paise. Only the daily rate and shift length are required;
// the rest are optional add-ons the backend stores per category.
export type ProviderPricing = {
  category: ServiceCategory;
  dailyRate: number;
  totalHoursPerDay: number;
  // Short single-day bookings (under the shift length) can be charged by the hour.
  hourlyEnabled?: boolean;
  hourlyRate?: number | null;
  minimumHours?: number | null;
  // Daily add-ons a client can choose on top of the rate.
  vehicleRate?: number | null;
  vehicleWithDriverRate?: number | null;
  // Stored but not applied to any price today — carried through untouched so a
  // save never resets it, and deliberately not editable here.
  weekendMultiplier?: number | null;
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

export type BankDetails = {
  accountNumber?: string | null; // masked to last 4 on read
  ifscCode?: string | null;
  accountName?: string | null;
  bankName?: string | null;
  accountType?: "savings" | "current" | null;
  verified?: boolean;
  confirmedByProvider?: boolean;
};

// As stored on the profile. `url` is presigned in place on read, so the storage
// key that /gallery/remove needs is recovered from it (see lib/api/gallery.ts).
export type GalleryItem = {
  url: string;
  type: "photo" | "video";
  caption?: string | null;
};

export type VehicleOptions = {
  offersVehicle?: boolean;
  offersVehicleWithDriver?: boolean;
  vehicleType?: "car" | "suv" | "van" | "bike" | null;
  vehicleRegistration?: string | null;
};

// Private to the provider and the verification team — never shown to clients.
export type ProviderAdminData = {
  dateOfBirth?: string | null;
  homeAddress?: string | null;
  emergencyContact?: {
    name?: string | null;
    phone?: string | null;
    relation?: string | null;
  } | null;
};

// A licence number the provider typed, with the verification team's verdict.
export type LicenceBlock = {
  number?: string | null;
  issuingState?: string | null;
  documentUrl?: string | null;
  verified?: boolean;
};

export type VerificationStatus = "pending" | "submitted" | "verified" | "rejected";

export type ProviderProfile = {
  _id: string;
  userId: { _id: string; name: string; email: string; phone: string; profilePhoto: string | null };
  rating: { average: number; count: number };
  providerType: ProviderType;
  serviceCategories: ServiceCategory[];
  serviceCity: string;
  serviceState: string;
  yearsExperience: number;
  pricing: ProviderPricing[];
  businessName?: string;
  description?: string;
  isVerified: boolean;
  verificationStatus?: VerificationStatus;
  // Only meaningful while verificationStatus is "rejected".
  verificationRejectionReason?: string | null;
  serviceCities?: string[];
  psaraLicense?: LicenceBlock | null;
  weaponLicense?: LicenceBlock | null;
  // Public profile — what clients see.
  languages?: string[];
  specializations?: string[];
  skills?: string[];
  serviceRadius?: number | null;
  availableNow?: boolean;
  gallery?: GalleryItem[];
  isExServiceman?: boolean;
  isPoliceVeteran?: boolean;
  previousOrganization?: string | null;
  rankAtRetirement?: string | null;
  regiment?: string | null;
  passportAvailable?: boolean;
  travelAcrossIndia?: boolean;
  internationalTravel?: boolean;
  // Agencies.
  yearEstablished?: number | null;
  numberOfPersonnel?: number | null;
  responseTime?: string | null;
  isoCertification?: string | null;
  vehicleOptions?: VehicleOptions;
  adminData?: ProviderAdminData | null;
  // Keyed by `${documentType}Url` (e.g. `aadhaarUrl`) — a presigned GET URL once
  // uploaded, absent otherwise. See src/lib/constants/providerDocuments.ts.
  documents?: Record<string, string | undefined>;
  bankDetails?: BankDetails;
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

// Everything PUT /provider/profile reads. A save sends all of these — the ones
// the caller didn't change come from the loaded profile — so a page that edits
// one section can never blank another. See "PUT /provider/profile takes the
// whole details object" in CLAUDE.md.
export type ProviderProfileUpdate = Partial<{
  name: string;
  phone: string;
  providerType: ProviderType;
  businessName: string;
  description: string;
  serviceCategories: ServiceCategory[];
  serviceCity: string;
  serviceCities: string[];
  serviceState: string;
  yearsExperience: number;
  languages: string[];
  specializations: string[];
  skills: string[];
  serviceRadius: number | null;
  availableNow: boolean;
  isExServiceman: boolean;
  isPoliceVeteran: boolean;
  previousOrganization: string;
  rankAtRetirement: string;
  regiment: string;
  passportAvailable: boolean;
  travelAcrossIndia: boolean;
  internationalTravel: boolean;
  yearEstablished: number | null;
  numberOfPersonnel: number | null;
  responseTime: string;
  isoCertification: string;
  vehicleOptions: VehicleOptions;
  adminData: ProviderAdminData;
  // null clears the number; a blank string would be stored as "" instead.
  psaraLicense: { number: string | null; issuingState: string | null };
  weaponLicense: { number: string | null };
}>;

function currentProfileFields(profile: ProviderProfile): ProviderProfileUpdate {
  return {
    providerType: profile.providerType,
    businessName: profile.businessName,
    description: profile.description,
    serviceCategories: profile.serviceCategories,
    serviceCity: profile.serviceCity,
    serviceCities: profile.serviceCities,
    serviceState: profile.serviceState,
    yearsExperience: profile.yearsExperience,
    languages: profile.languages,
    specializations: profile.specializations,
    skills: profile.skills,
    serviceRadius: profile.serviceRadius,
    availableNow: profile.availableNow,
    isExServiceman: profile.isExServiceman,
    isPoliceVeteran: profile.isPoliceVeteran,
    previousOrganization: profile.previousOrganization ?? undefined,
    rankAtRetirement: profile.rankAtRetirement ?? undefined,
    regiment: profile.regiment ?? undefined,
    passportAvailable: profile.passportAvailable,
    travelAcrossIndia: profile.travelAcrossIndia,
    internationalTravel: profile.internationalTravel,
    yearEstablished: profile.yearEstablished,
    numberOfPersonnel: profile.numberOfPersonnel,
    responseTime: profile.responseTime ?? undefined,
    isoCertification: profile.isoCertification ?? undefined,
    vehicleOptions: profile.vehicleOptions,
  };
}

export function saveProviderProfile(
  profile: ProviderProfile,
  patch: ProviderProfileUpdate,
  accessToken: string,
): Promise<{ profile: ProviderProfile }> {
  return apiRequest("/provider/profile", {
    method: "PUT",
    body: { ...currentProfileFields(profile), ...patch },
    accessToken,
  });
}

// PUT /provider/pricing replaces the stored array wholesale, so anything a save
// leaves out falls back to its schema default. Existing rows are therefore
// carried through field by field (dropping `_id`/`updatedAt`), with the one
// out-of-range guard the API enforces: a legacy weekend multiplier outside 1–3
// would turn an unrelated save into a 400, so it is omitted (the server then
// applies its default) rather than echoed.
export function carryPricingFields(existing: ProviderPricing | undefined): Partial<ProviderPricing> {
  if (!existing) return {};
  const weekend = Number(existing.weekendMultiplier);
  return {
    hourlyEnabled: existing.hourlyEnabled,
    hourlyRate: existing.hourlyRate,
    minimumHours: existing.minimumHours,
    vehicleRate: existing.vehicleRate,
    vehicleWithDriverRate: existing.vehicleWithDriverRate,
    ...(Number.isFinite(weekend) && weekend >= 1 && weekend <= 3 ? { weekendMultiplier: weekend } : {}),
  };
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

// Submitting any bankDetails field resets bankDetails.verified to false — only
// an admin can re-verify. See CLAUDE.md.
export function updateBankDetails(
  input: { accountNumber: string; ifscCode: string; accountName: string; bankName?: string; accountType?: "savings" | "current" },
  accessToken: string,
): Promise<{ profile: ProviderProfile }> {
  return apiRequest("/provider/profile", { method: "PUT", body: { bankDetails: input }, accessToken });
}

// One-tap attestation that the (admin-verified) bank account shown is theirs.
// 400s until an admin has entered + verified accountNumber/ifscCode. See CLAUDE.md.
export function confirmBankDetails(accessToken: string): Promise<{ confirmedByProvider: true }> {
  return apiRequest("/provider/bank-details/confirm", { method: "POST", accessToken });
}

export function isProfileComplete(profile: ProviderProfile): boolean {
  return profile.serviceCategories.length > 0;
}
