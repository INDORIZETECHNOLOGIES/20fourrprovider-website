import {
  PERSONNEL_DOCUMENT_LABELS,
  REQUIRED_DOCUMENTS,
  type Person,
  type PersonInput,
  type PersonnelCategory,
  type PersonnelDocumentType,
} from "@/lib/api/personnel";

export const PERSONNEL_CATEGORY_LABELS: Record<PersonnelCategory, { one: string; many: string }> = {
  guard: { one: "Security guard", many: "Security guards" },
  bouncer: { one: "Bouncer", many: "Bouncers" },
  gunman: { one: "Armed guard", many: "Armed guards" },
  pso: { one: "Personal security officer", many: "Personal security officers" },
};

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "?";

/** Why a person can't be sent on a job, or null when they can. */
export function blockReason(person: Pick<Person, "status" | "missingDocuments" | "expiredDocuments">): string | null {
  if (person.status === "inactive") return "Inactive";
  const parts = [
    ...person.missingDocuments.map((t) => `${PERSONNEL_DOCUMENT_LABELS[t]} missing`),
    ...person.expiredDocuments.map((t) => `${PERSONNEL_DOCUMENT_LABELS[t]} expired`),
  ];
  return parts.length ? parts.join(" · ") : null;
}

export type DocumentState =
  | { state: "missing" }
  | { state: "expired"; expiresAt: string }
  | { state: "expiring"; expiresAt: string }
  | { state: "valid"; expiresAt: string | null };

const EXPIRING_DAYS = 30;

/** One required document's standing today; "expiring" within 30 days, so it can be renewed in time. */
export function documentState(person: Pick<Person, "documents">, type: PersonnelDocumentType, now = new Date()): DocumentState {
  const doc = person.documents.find((d) => d.type === type);
  if (!doc) return { state: "missing" };
  if (!doc.expiresAt) return { state: "valid", expiresAt: null };
  const expires = new Date(doc.expiresAt).getTime();
  if (expires < now.getTime()) return { state: "expired", expiresAt: doc.expiresAt };
  if (expires - now.getTime() < EXPIRING_DAYS * 86_400_000) return { state: "expiring", expiresAt: doc.expiresAt };
  return { state: "valid", expiresAt: doc.expiresAt };
}

export const requiredDocuments = (category: PersonnelCategory): PersonnelDocumentType[] => REQUIRED_DOCUMENTS[category];

// ── The add/edit form ─────────────────────────────────────────────────────────

export type PersonDraft = {
  fullName: string;
  phone: string;
  category: PersonnelCategory | "";
  yearsExperience: string;
  languages: string;
  heightCm: string;
};

export const EMPTY_DRAFT: PersonDraft = { fullName: "", phone: "", category: "", yearsExperience: "", languages: "", heightCm: "" };

export function toDraft(person: Person): PersonDraft {
  return {
    fullName: person.fullName,
    phone: person.phone ?? "",
    category: person.category,
    yearsExperience: String(person.yearsExperience ?? ""),
    languages: person.languages.join(", "),
    heightCm: person.heightCm ? String(person.heightCm) : "",
  };
}

const splitLanguages = (text: string) =>
  text
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

export type DraftErrors = Partial<Record<keyof PersonDraft, string>>;

/** Mirrors the backend's personnel validators, so a save doesn't bounce on a 400. */
export function validateDraft(d: PersonDraft): DraftErrors {
  const e: DraftErrors = {};
  const name = d.fullName.trim();
  if (name.length < 2 || name.length > 120) e.fullName = "Enter their full name.";
  if (d.phone.trim() && !/^[6-9]\d{9}$/.test(d.phone.trim())) e.phone = "A 10-digit mobile number, without +91.";
  if (!d.category) e.category = "Choose what they do.";
  if (d.yearsExperience.trim()) {
    const n = Number(d.yearsExperience);
    if (!Number.isInteger(n) || n < 0 || n > 60) e.yearsExperience = "Whole years, 0–60.";
  }
  if (d.heightCm.trim()) {
    const n = Number(d.heightCm);
    if (!Number.isInteger(n) || n < 100 || n > 250) e.heightCm = "In centimetres, 100–250.";
  }
  const langs = splitLanguages(d.languages);
  if (langs.length > 10) e.languages = "Up to 10 languages.";
  else if (langs.some((l) => l.length < 2 || l.length > 30)) e.languages = "Separate languages with commas.";
  return e;
}

export function toInput(d: PersonDraft): PersonInput {
  return {
    fullName: d.fullName.trim(),
    phone: d.phone.trim() || null,
    ...(d.category ? { category: d.category } : {}),
    yearsExperience: d.yearsExperience.trim() ? Number(d.yearsExperience) : 0,
    languages: splitLanguages(d.languages),
    heightCm: d.heightCm.trim() ? Number(d.heightCm) : null,
  };
}

/**
 * Why a person can't go on a booking ending `lastDay` — the backend checks documents are valid
 * through the booking's last day, not just today (spec 0017 build decision 4).
 */
export function blockReasonFor(person: Person, lastDay: string): string | null {
  const today = blockReason(person);
  if (today) return today;
  const end = new Date(lastDay).getTime();
  const lapsing = REQUIRED_DOCUMENTS[person.category].filter((type) => {
    const doc = person.documents.find((d) => d.type === type);
    return doc?.expiresAt && new Date(doc.expiresAt).getTime() < end;
  });
  return lapsing.length ? `${lapsing.map((t) => PERSONNEL_DOCUMENT_LABELS[t]).join(" and ")} expires before this booking ends` : null;
}
