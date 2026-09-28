import { apiRequest, apiUpload } from "./client";

// Backend spec 0017. An agency's roster of the people it sends on jobs. Agencies only — an
// individual provider gets SC_1580. Names and phones are encrypted at rest and come back only to
// the agency; document numbers never come back to anyone.

export const PERSONNEL_CATEGORIES = ["guard", "bouncer", "gunman", "pso"] as const;
export type PersonnelCategory = (typeof PERSONNEL_CATEGORIES)[number];

export const PERSONNEL_DOCUMENT_TYPES = ["psara_training", "police_verification", "arms_licence"] as const;
export type PersonnelDocumentType = (typeof PERSONNEL_DOCUMENT_TYPES)[number];

export const PERSONNEL_DOCUMENT_LABELS: Record<PersonnelDocumentType, string> = {
  psara_training: "PSARA training certificate",
  police_verification: "Police verification",
  arms_licence: "Arms licence",
};

/** Mirrors the backend's REQUIRED_DOCUMENTS (models/Personnel.ts). */
export const REQUIRED_DOCUMENTS: Record<PersonnelCategory, PersonnelDocumentType[]> = {
  guard: ["psara_training", "police_verification"],
  bouncer: ["psara_training", "police_verification"],
  gunman: ["psara_training", "police_verification", "arms_licence"],
  pso: ["psara_training", "police_verification", "arms_licence"],
};

export type Person = {
  personnelId: string;
  fullName: string;
  phone: string | null;
  category: PersonnelCategory;
  yearsExperience: number;
  languages: string[];
  heightCm: number | null;
  /** Presigned, five minutes. Re-fetch rather than cache. */
  photoUrl: string | null;
  documents: Array<{ type: PersonnelDocumentType; expiresAt: string | null; uploadedAt: string }>;
  rating: { average: number; count: number } | null;
  status: "active" | "inactive";
  /** Active, with every required document uploaded and in date today. */
  assignable: boolean;
  missingDocuments: PersonnelDocumentType[];
  expiredDocuments: PersonnelDocumentType[];
};

export type PersonInput = {
  fullName?: string;
  phone?: string | null;
  category?: PersonnelCategory;
  yearsExperience?: number;
  languages?: string[];
  heightCm?: number | null;
};

export function listPersonnel(
  accessToken: string,
  filter: { status?: "active" | "inactive"; category?: PersonnelCategory } = {},
): Promise<{ personnel: Person[] }> {
  const query = new URLSearchParams(Object.entries(filter).filter(([, v]) => v) as [string, string][]).toString();
  return apiRequest(`/provider/personnel${query ? `?${query}` : ""}`, { accessToken });
}

/** Both attestations are required every time a person is added (spec 0017 rule 3, DPDP Act). */
export function createPerson(
  input: PersonInput & { fullName: string; category: PersonnelCategory },
  attestation: { documentsGenuine: true; consentToDisplay: true },
  accessToken: string,
): Promise<Person> {
  return apiRequest("/provider/personnel", { method: "POST", body: { ...input, attestation }, accessToken });
}

export function updatePerson(
  personnelId: string,
  input: PersonInput & { status?: "active" | "inactive" },
  accessToken: string,
): Promise<Person> {
  return apiRequest(`/provider/personnel/${personnelId}`, { method: "PATCH", body: input, accessToken });
}

export function uploadPersonPhoto(personnelId: string, file: File, accessToken: string): Promise<Person> {
  const form = new FormData();
  form.append("file", file);
  return apiUpload(`/provider/personnel/${personnelId}/photo`, form, accessToken);
}

/** Adds or replaces the document of that type. */
export function uploadPersonDocument(
  personnelId: string,
  input: { type: PersonnelDocumentType; file: File; number?: string; expiresAt?: string },
  accessToken: string,
): Promise<Person> {
  const form = new FormData();
  form.append("type", input.type);
  if (input.number) form.append("number", input.number);
  if (input.expiresAt) form.append("expiresAt", input.expiresAt);
  form.append("file", input.file);
  return apiUpload(`/provider/personnel/${personnelId}/documents`, form, accessToken);
}

// ── A booking's team ──────────────────────────────────────────────────────────

export type AssignedPersonnel = {
  personnelId: string;
  assignedAt: string;
  replacedAt: string | null;
  replacedBy: string | null;
};

/** Exactly `headcount` people of the booking's category, from acceptance until duty starts. */
export function assignTeam(bookingId: string, personnelIds: string[], accessToken: string): Promise<{ assigned: string[] }> {
  return apiRequest(`/provider/bookings/${bookingId}/personnel`, { method: "PUT", body: { personnelIds }, accessToken });
}

export function replaceTeamMember(
  bookingId: string,
  outgoingId: string,
  replacementId: string,
  accessToken: string,
): Promise<{ assigned: string[] }> {
  return apiRequest(`/provider/bookings/${bookingId}/personnel/${outgoingId}/replace`, {
    method: "POST",
    body: { replacementId },
    accessToken,
  });
}

/** Plain-language message for the team errors a provider can act on. */
export function teamErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case "SC_1582":
      return "Someone you picked has a missing or expired document for these dates.";
    case "SC_1584":
      return "Someone you picked is already on another booking on these dates.";
    case "SC_1585":
      return "Pick exactly as many people as the booking needs.";
    case "SC_1589":
      return "The team can only be changed between accepting and the start of duty.";
    case "SC_1590":
      return "Everyone on the team has to be of the booking's service type.";
    case "SC_1588":
      return "Confirm both statements to add a person.";
    default:
      return null;
  }
}
