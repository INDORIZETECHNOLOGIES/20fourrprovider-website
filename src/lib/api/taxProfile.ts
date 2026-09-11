import { apiRequest } from "./client";

export type TaxTier = "registered" | "unregistered";
export type PanVerificationStatus = "unsubmitted" | "pending" | "verified" | "rejected";
export type GstinStatus = "not_applicable" | "unverified" | "active" | "cancelled";
export type PsaraVerificationStatus = "pending" | "verified" | "rejected";

export type PsaraCoverageEntry = {
  stateCode: string;
  stateName: string | null;
  licenceNumber: string;
  issuedAt: string | null;
  expiresAt: string;
  verificationStatus: PsaraVerificationStatus;
  expired: boolean;
};

export type TaxProfile = {
  taxTier: TaxTier;
  panPresent: boolean;
  panMasked: string | null;
  panHolderType: string | null;
  panVerificationStatus: PanVerificationStatus;
  gstin: string | null;
  gstinStatus: GstinStatus;
  stateCode: string | null;
  stateName: string | null;
  turnoverDeclaration: { financialYear: string | null; amountPaise: number | null; declaredAt: string } | null;
  psaraCoverage: PsaraCoverageEntry[];
  taxProfileComplete: boolean;
  blockingReasons: string[];
};

export function getTaxProfile(accessToken: string): Promise<TaxProfile> {
  return apiRequest("/provider/tax-profile", { accessToken });
}

export function updateTaxProfile(
  input: {
    panNumber: string;
    taxTier: TaxTier;
    gstin?: string;
    turnoverDeclaration?: { financialYear?: string; amountPaise: number };
  },
  accessToken: string,
): Promise<TaxProfile> {
  return apiRequest("/provider/tax-profile", { method: "PUT", body: input, accessToken });
}

export function updatePsaraCoverage(
  licences: {
    stateCode: string;
    licenceNumber: string;
    issuedAt?: string;
    expiresAt: string;
  }[],
  accessToken: string,
): Promise<TaxProfile> {
  return apiRequest("/provider/psara-coverage", { method: "PUT", body: { licences }, accessToken });
}
