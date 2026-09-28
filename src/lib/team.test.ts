import { describe, expect, it } from "vitest";
import type { Person } from "@/lib/api/personnel";
import { EMPTY_DRAFT, blockReason, blockReasonFor, documentState, initials, toInput, validateDraft } from "./team";

const now = new Date("2026-09-28T12:00:00Z");
const person = (patch: Partial<Person> = {}): Person => ({
  personnelId: "p1",
  fullName: "Ravi Kumar Patil",
  phone: null,
  category: "guard",
  yearsExperience: 4,
  languages: ["Marathi", "Hindi"],
  heightCm: null,
  photoUrl: null,
  documents: [],
  rating: null,
  status: "active",
  assignable: true,
  missingDocuments: [],
  expiredDocuments: [],
  ...patch,
});

describe("blockReason", () => {
  it("names each missing or expired document", () => {
    expect(blockReason(person({ missingDocuments: ["police_verification"], expiredDocuments: ["arms_licence"] }))).toBe(
      "Police verification missing · Arms licence expired",
    );
  });

  it("is null for someone who can be assigned, and 'Inactive' for someone switched off", () => {
    expect(blockReason(person())).toBeNull();
    expect(blockReason(person({ status: "inactive" }))).toBe("Inactive");
  });
});

describe("documentState", () => {
  const docs = [
    { type: "psara_training" as const, expiresAt: "2026-10-10T00:00:00Z", uploadedAt: "" },
    { type: "police_verification" as const, expiresAt: "2026-01-01T00:00:00Z", uploadedAt: "" },
    { type: "arms_licence" as const, expiresAt: null, uploadedAt: "" },
  ];
  it("reads missing, expired, expiring within 30 days, and valid", () => {
    expect(documentState(person({ documents: [] }), "psara_training", now).state).toBe("missing");
    expect(documentState(person({ documents: docs }), "police_verification", now).state).toBe("expired");
    expect(documentState(person({ documents: docs }), "psara_training", now).state).toBe("expiring");
    expect(documentState(person({ documents: docs }), "arms_licence", now)).toEqual({ state: "valid", expiresAt: null });
  });
});

describe("the person form", () => {
  it("asks for a name and a category", () => {
    expect(validateDraft(EMPTY_DRAFT)).toMatchObject({ fullName: expect.any(String), category: expect.any(String) });
  });

  it("checks phone, experience, height and languages like the API does", () => {
    const e = validateDraft({ fullName: "Ravi", phone: "12345", category: "guard", yearsExperience: "61", languages: "a", heightCm: "90" });
    expect(Object.keys(e).sort()).toEqual(["heightCm", "languages", "phone", "yearsExperience"]);
  });

  it("builds the payload, splitting languages and clearing blanks", () => {
    expect(toInput({ fullName: " Ravi ", phone: "", category: "bouncer", yearsExperience: "", languages: "Hindi, Marathi ,", heightCm: "" })).toEqual({
      fullName: "Ravi",
      phone: null,
      category: "bouncer",
      yearsExperience: 0,
      languages: ["Hindi", "Marathi"],
      heightCm: null,
    });
  });
});

describe("initials", () => {
  it("takes the first two names", () => {
    expect(initials("Ravi Kumar Patil")).toBe("RK");
  });
});

describe("blockReasonFor", () => {
  it("catches a document that lapses before the booking's last day", () => {
    const p = person({
      documents: [
        { type: "psara_training", expiresAt: "2026-10-03T00:00:00Z", uploadedAt: "" },
        { type: "police_verification", expiresAt: null, uploadedAt: "" },
      ],
    });
    expect(blockReasonFor(p, "2026-10-02T18:30:00Z")).toBeNull();
    expect(blockReasonFor(p, "2026-10-05T18:30:00Z")).toBe("PSARA training certificate expires before this booking ends");
  });
});
