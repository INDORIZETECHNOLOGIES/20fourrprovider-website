// Limits mirror updateProviderProfileValidator on the backend; the server stays
// the authority, these only catch the obvious before a round trip.

export const DESCRIPTION_MAX = 2000;
export const LANGUAGES_MAX = 20;
export const SPECIALIZATIONS_MAX = 20;
export const SKILLS_MAX = 30;
export const SERVICE_CITIES_MAX = 20;

export function validateDescription(text: string): string | null {
  if (text.length > DESCRIPTION_MAX) return `Keep this under ${DESCRIPTION_MAX} characters.`;
  return null;
}

export function validateBusinessName(name: string, required: boolean): string | null {
  if (required && !name.trim()) return "Enter your agency's name.";
  if (name.length > 100) return "Keep the name under 100 characters.";
  return null;
}

export function validateDateOfBirth(iso: string, now: Date = new Date()): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Enter a valid date of birth.";
  if (date.getTime() > now.getTime()) return "Date of birth can't be in the future.";
  if (now.getFullYear() - date.getFullYear() > 100) return "Enter a valid date of birth.";
  return null;
}

export function validateHomeAddress(address: string): string | null {
  if (address.length > 300) return "Keep the address under 300 characters.";
  return null;
}

export function validateEmergencyName(name: string): string | null {
  if (name.length > 100) return "Keep the name under 100 characters.";
  return null;
}

export function validateEmergencyPhone(phone: string): string | null {
  if (!phone.trim()) return null;
  if (!/^[6-9]\d{9}$/.test(phone.trim())) return "Enter a 10-digit mobile number starting with 6–9.";
  return null;
}

export function validateEmergencyRelation(relation: string): string | null {
  if (relation.length > 40) return "Keep this under 40 characters.";
  return null;
}

// Blank means "no limit stated".
export function validateServiceRadius(km: string): string | null {
  if (!km.trim()) return null;
  const value = Number(km);
  if (!Number.isInteger(value) || value < 0 || value > 5000) {
    return "Enter a whole number of kilometres, from 0 to 5000.";
  }
  return null;
}

export function validateYearEstablished(year: string, now: Date = new Date()): string | null {
  if (!year.trim()) return null;
  const value = Number(year);
  if (!Number.isInteger(value) || value < 1900 || value > now.getFullYear()) {
    return "Enter a year between 1900 and this year.";
  }
  return null;
}

export function validateNumberOfPersonnel(count: string): string | null {
  if (!count.trim()) return null;
  const value = Number(count);
  if (!Number.isInteger(value) || value < 0 || value > 100000) {
    return "Enter a whole number, up to 100000.";
  }
  return null;
}

// e.g. "Within 30 minutes" — the API wants at least one digit in it.
export function validateResponseTime(text: string): string | null {
  if (!text.trim()) return null;
  if (text.length > 60) return "Keep this under 60 characters.";
  if (!/\d/.test(text)) return 'Include a number, e.g. "Within 30 minutes".';
  return null;
}

export function validateVehicleRegistration(text: string): string | null {
  if (!text.trim()) return null;
  if (text.length > 20 || !/^[A-Z0-9 ]+$/i.test(text)) {
    return "Use letters and numbers only, up to 20 characters.";
  }
  return null;
}

export function validateShortText(text: string, max: number): string | null {
  if (text.length > max) return `Keep this under ${max} characters.`;
  return null;
}

/** Trim and drop blanks and case-insensitive repeats, keeping the first spelling. */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      if (!tag) return false;
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
