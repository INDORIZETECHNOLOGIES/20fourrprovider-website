import type { ProviderType } from "@/lib/api/provider";

export type ProviderDocumentId =
  | "aadhaar"
  | "pan"
  | "selfieVerification"
  | "passport"
  | "drivingLicense"
  | "exServicemanCert"
  | "serviceId"
  | "characterCertificate"
  | "certificate"
  | "weaponLicense"
  | "firstAidCertificate"
  | "bankAccountProof"
  | "gst"
  | "udyamRegistration"
  | "incorporationCertificate"
  | "authorizedSignatoryId"
  | "psaraLicense"
  | "addressProofRegisteredOffice"
  | "epfRegistration"
  | "esicRegistration"
  | "professionalTaxRegistration"
  | "labourLicence"
  | "insurance"
  | "workmenCompensationInsurance"
  | "policeVerification"
  | "pastEmploymentCheck"
  | "selfDeclaration";

export type ProviderDocumentCatalogEntry = {
  id: ProviderDocumentId;
  label: string;
  section: string;
  appliesTo: ProviderType[];
  requiredFor: Partial<Record<ProviderType, boolean>>;
  hint?: string;
};

// Mirrors the backend's canonical catalog (src/constants/providerDocuments.ts) —
// keep in sync with it, same as the mobile app is required to.
export const PROVIDER_DOCUMENT_CATALOG: ProviderDocumentCatalogEntry[] = [
  { id: "aadhaar", label: "Aadhaar Card", section: "Identity & KYC", appliesTo: ["individual"], requiredFor: { individual: true } },
  { id: "pan", label: "PAN Card", section: "Identity & KYC", appliesTo: ["individual", "firm"], requiredFor: { individual: true, firm: true } },
  { id: "selfieVerification", label: "Selfie / Live Face Verification", section: "Identity & KYC", appliesTo: ["individual"], requiredFor: { individual: true } },
  { id: "passport", label: "Passport", section: "Identity & KYC", appliesTo: ["individual"], requiredFor: {} },
  { id: "drivingLicense", label: "Driving Licence", section: "Identity & KYC", appliesTo: ["individual"], requiredFor: {} },

  { id: "exServicemanCert", label: "Discharge Book / Retirement Certificate", section: "Professional Verification", appliesTo: ["individual"], requiredFor: {}, hint: "For ex-servicemen (retired Army/Police/Paramilitary)" },
  { id: "serviceId", label: "Service ID", section: "Professional Verification", appliesTo: ["individual"], requiredFor: {} },
  { id: "characterCertificate", label: "Character Certificate", section: "Professional Verification", appliesTo: ["individual"], requiredFor: {} },
  { id: "certificate", label: "Security Training Certificate", section: "Professional Verification", appliesTo: ["individual"], requiredFor: {} },
  { id: "weaponLicense", label: "Firearms Licence", section: "Professional Verification", appliesTo: ["individual", "firm"], requiredFor: {}, hint: "Only if you offer armed services, where legally applicable" },
  { id: "firstAidCertificate", label: "First Aid / CPR Certificate", section: "Professional Verification", appliesTo: ["individual"], requiredFor: {} },

  { id: "bankAccountProof", label: "Bank Account Proof", section: "Bank & Tax", appliesTo: ["individual", "firm"], requiredFor: { individual: true, firm: true }, hint: "Cancelled cheque or bank statement" },
  { id: "gst", label: "GST Registration", section: "Bank & Tax", appliesTo: ["individual", "firm"], requiredFor: { firm: true }, hint: "Only if applicable to you" },
  { id: "udyamRegistration", label: "UDYAM Registration", section: "Bank & Tax", appliesTo: ["individual"], requiredFor: {} },

  { id: "incorporationCertificate", label: "Certificate of Incorporation / Partnership Deed / Proprietorship Proof", section: "Business Documents", appliesTo: ["firm"], requiredFor: { firm: true } },
  { id: "authorizedSignatoryId", label: "Authorized Signatory ID Proof", section: "Business Documents", appliesTo: ["firm"], requiredFor: { firm: true } },

  { id: "psaraLicense", label: "PSARA Licence", section: "Licensing", appliesTo: ["firm"], requiredFor: { firm: true }, hint: "Valid for the state(s) where services are offered" },

  { id: "addressProofRegisteredOffice", label: "Address Proof of Registered Office", section: "Compliance", appliesTo: ["firm"], requiredFor: { firm: true } },
  { id: "epfRegistration", label: "EPF Registration", section: "Compliance", appliesTo: ["firm"], requiredFor: {} },
  { id: "esicRegistration", label: "ESIC Registration", section: "Compliance", appliesTo: ["firm"], requiredFor: {} },
  { id: "professionalTaxRegistration", label: "Professional Tax Registration", section: "Compliance", appliesTo: ["firm"], requiredFor: {}, hint: "Where applicable" },
  { id: "labourLicence", label: "Labour Licence", section: "Compliance", appliesTo: ["firm"], requiredFor: {} },
  { id: "insurance", label: "Public Liability Insurance", section: "Compliance", appliesTo: ["firm"], requiredFor: {} },
  { id: "workmenCompensationInsurance", label: "Workmen / Employee Compensation Insurance", section: "Compliance", appliesTo: ["firm"], requiredFor: {} },
  { id: "policeVerification", label: "Police Verification / Background Check", section: "Compliance", appliesTo: ["individual", "firm"], requiredFor: { individual: true, firm: true } },
  { id: "pastEmploymentCheck", label: "Past Employment Check", section: "Compliance", appliesTo: ["individual", "firm"], requiredFor: { individual: true, firm: true }, hint: "Mandatory KYC — verification of previous employment history with security agencies" },
  { id: "selfDeclaration", label: "Self Declaration (PSARA Compliance)", section: "Compliance", appliesTo: ["individual", "firm"], requiredFor: { individual: true, firm: true }, hint: "Declaration that you are PSARA compliant & this platform is only a connecting service" },
];
